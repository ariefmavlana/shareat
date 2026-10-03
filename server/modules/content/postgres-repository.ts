import { randomUUID } from 'node:crypto'
import { and, eq, asc, isNotNull, sql, count, desc } from 'drizzle-orm'
import { createError } from 'h3'
import { database } from '../../db/client'
import { lockContentSlugs } from '../../db/locks'
import {
  entities,
  revisions,
  auditLogs,
  outbox,
  assets,
  redirects,
} from '../../db/schema'
import { publicDto } from './service'
import type { ContentRepository } from './repository'
import type { Actor, ContentRecord } from '../../../shared/contracts/content'
type DB = ReturnType<typeof database>
type TX = Parameters<Parameters<DB['transaction']>[0]>[0]
type Executor = DB | TX
async function hydrate(
  executor: Executor,
  row: typeof entities.$inferSelect,
): Promise<ContentRecord> {
  const rs = await executor
    .select()
    .from(revisions)
    .where(eq(revisions.entityId, row.id))
    .orderBy(asc(revisions.sequence))
  return {
    ...row,
    revisions: rs.map((r) => ({
      ...r,
      checklist: r.checklist ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  }
}
async function audit(
  tx: Executor,
  actor: Actor,
  action: string,
  targetId: string,
  reason?: string,
) {
  await tx.insert(auditLogs).values({
    id: randomUUID(),
    actorId: actor.id,
    action,
    targetId,
    requestId: actor.requestId ?? randomUUID(),
    reason: reason ?? null,
    safeChange: {},
    createdAt: new Date(),
  })
}
async function writeRevisions(tx: Executor, record: ContentRecord) {
  for (const [index, rev] of record.revisions.entries())
    await tx
      .insert(revisions)
      .values({
        ...rev,
        entityId: record.id,
        sequence: index + 1,
        createdAt: new Date(rev.createdAt),
      })
      .onConflictDoUpdate({
        target: revisions.id,
        set: {
          status: rev.status,
          reviewerId: rev.reviewerId,
          checklist: rev.checklist,
          createdAt: new Date(rev.createdAt),
        },
      })
}
export function postgresContentRepository(): ContentRepository {
  const db = database()
  return {
    async create(record, actor) {
      await db.transaction(async (tx) => {
        await lockContentSlugs(tx)
        if (['program', 'initiative', 'story'].includes(record.kind)) {
          const base = (
            {
              program: '/program/',
              initiative: '/inisiatif/',
              story: '/cerita/',
            } as Record<string, string>
          )[record.kind]!
          const [alias] = await tx
            .select()
            .from(redirects)
            .where(eq(redirects.fromPath, base + record.slug))
            .for('update')
          if (alias)
            throw createError({
              statusCode: 409,
              statusMessage: 'Slug sudah dipakai sebagai alias',
            })
        }
        const { revisions: _revisions, ...row } = record
        await tx.insert(entities).values(row)
        await writeRevisions(tx, record)
        await audit(tx, actor, 'content.create', record.id)
      })
    },
    async get(id) {
      const [row] = await db.select().from(entities).where(eq(entities.id, id))
      return row ? hydrate(db, row) : null
    },
    async bySlug(kind, slug) {
      const [row] = await db
        .select()
        .from(entities)
        .where(and(eq(entities.kind, kind), eq(entities.slug, slug)))
      return row ? hydrate(db, row) : null
    },
    async list(query) {
      const conditions = []
      if (query.kind) conditions.push(eq(entities.kind, query.kind))
      if (query.organizationId)
        conditions.push(eq(entities.organizationId, query.organizationId))
      const where = and(...conditions)
      const [result] = await db
        .select({ total: count() })
        .from(entities)
        .where(where)
      const total = result?.total ?? 0,
        pages = Math.max(1, Math.ceil(total / 20))
      if (query.page > pages)
        throw createError({
          statusCode: 404,
          statusMessage: 'Halaman tidak ditemukan',
        })
      const rows = await db
        .select({ entity: entities, revision: revisions })
        .from(entities)
        .innerJoin(
          revisions,
          and(
            eq(revisions.entityId, entities.id),
            sql`${revisions.sequence} = (SELECT MAX(r.sequence) FROM content_revisions r WHERE r.entity_id = ${entities.id})`,
          ),
        )
        .where(where)
        .orderBy(desc(revisions.createdAt), asc(entities.id))
        .limit(20)
        .offset((query.page - 1) * 20)
      return {
        items: rows.map(({ entity, revision }) => ({
          ...entity,
          revisions: [
            {
              ...revision,
              checklist: revision.checklist ?? null,
              createdAt: revision.createdAt.toISOString(),
            },
          ],
        })),
        page: query.page,
        pages,
        total,
      }
    },
    async page(query) {
      const clauses = [
        eq(entities.archived, false),
        isNotNull(entities.publishedRevisionId),
        eq(revisions.status, 'published'),
      ]
      if (query.kind) clauses.push(eq(entities.kind, query.kind))
      if (process.env.NUXT_APP_MODE === 'production')
        clauses.push(sql`${revisions.body}->>'demo' = 'false'`)
      for (const [key, value] of [
        ['programSlug', query.program],
        ['activityStatus', query.status],
      ] as const)
        if (value) clauses.push(sql`${revisions.body}->>${key} = ${value}`)
      if (query.lokasi)
        clauses.push(
          sql`strpos(lower(coalesce(${revisions.body}->>'location', '')), lower(${query.lokasi})) > 0`,
        )
      if (query.q)
        clauses.push(
          sql`strpos(lower(concat(${revisions.body}->>'title', ' ', ${revisions.body}->>'summary')), lower(${query.q})) > 0`,
        )
      const where = and(...clauses)
      const [result] = await db
        .select({ total: count() })
        .from(entities)
        .innerJoin(revisions, eq(entities.publishedRevisionId, revisions.id))
        .where(where)
      const total = result?.total ?? 0,
        pages = Math.max(1, Math.ceil(total / 20))
      if (query.page > pages)
        throw createError({
          statusCode: 404,
          statusMessage: 'Halaman tidak ditemukan',
        })
      const rows = await db
        .select({ entity: entities, revision: revisions })
        .from(entities)
        .innerJoin(revisions, eq(entities.publishedRevisionId, revisions.id))
        .where(where)
        .orderBy(
          sql`coalesce((${revisions.body}->>'sortOrder')::integer, 0)`,
          desc(revisions.createdAt),
          asc(entities.id),
        )
        .limit(20)
        .offset((query.page - 1) * 20)
      return {
        items: rows
          .map(({ entity, revision }) =>
            publicDto({
              ...entity,
              revisions: [
                {
                  ...revision,
                  checklist: revision.checklist ?? null,
                  createdAt: revision.createdAt.toISOString(),
                },
              ],
            }),
          )
          .filter((x) => x !== null),
        page: query.page,
        pages,
        total,
      }
    },
    async published() {
      const rows = await db
        .select({ entity: entities, revision: revisions })
        .from(entities)
        .innerJoin(revisions, eq(entities.publishedRevisionId, revisions.id))
        .where(
          and(
            eq(entities.archived, false),
            isNotNull(entities.publishedRevisionId),
          ),
        )
      return rows
        .map(({ entity, revision }) =>
          publicDto({
            ...entity,
            revisions: [
              {
                ...revision,
                checklist: revision.checklist ?? null,
                createdAt: revision.createdAt.toISOString(),
              },
            ],
          }),
        )
        .filter((x) => x !== null)
    },
    async mutate(id, version, actor, action, reason, change) {
      return db.transaction(async (tx) => {
        const [row] = await tx
          .select()
          .from(entities)
          .where(eq(entities.id, id))
          .for('update')
        if (!row)
          throw createError({
            statusCode: 404,
            statusMessage: 'Konten tidak ditemukan',
          })
        if (row.version !== version)
          throw createError({
            statusCode: 409,
            statusMessage:
              'Konten telah berubah. Muat ulang sebelum menyimpan.',
          })
        const record = await hydrate(tx, row)
        change(record)
        record.version++
        if (action === 'content.publish') {
          const latest = record.revisions.at(-1)!
          if (process.env.NUXT_APP_MODE === 'production' && latest.body.demo)
            throw createError({
              statusCode: 422,
              statusMessage:
                'Konten demo tidak boleh dipublikasikan dalam produksi',
            })
          if (record.kind === 'initiative') {
            if (!latest.body.programSlug)
              throw createError({
                statusCode: 422,
                statusMessage: 'Program wajib untuk inisiatif',
              })
            const [program] = await tx
              .select()
              .from(entities)
              .where(
                and(
                  eq(entities.kind, 'program'),
                  eq(entities.slug, latest.body.programSlug),
                  eq(entities.archived, false),
                  isNotNull(entities.publishedRevisionId),
                ),
              )
            if (!program)
              throw createError({
                statusCode: 422,
                statusMessage: 'Program harus tersedia dan dipublikasikan',
              })
          }
          if (latest.body.imageId) {
            const [asset] = await tx
              .select()
              .from(assets)
              .where(eq(assets.id, latest.body.imageId))
            if (
              !asset ||
              asset.organizationId !== record.organizationId ||
              asset.scanStatus !== 'clean' ||
              asset.rightsStatus !== 'approved' ||
              !asset.mime.startsWith('image/') ||
              !latest.body.imageAlt
            )
              throw createError({
                statusCode: 422,
                statusMessage:
                  'Media belum memenuhi scan, hak, dan deskripsi publik',
              })
          }
        }
        await writeRevisions(tx, record)
        await tx
          .update(entities)
          .set({
            version: record.version,
            publishedRevisionId: record.publishedRevisionId,
            everPublished: record.everPublished,
            archived: record.archived,
          })
          .where(eq(entities.id, id))
        await audit(tx, actor, action, id, reason)
        if (['content.publish', 'content.archive'].includes(action))
          await tx.insert(outbox).values({
            id: randomUUID(),
            type: 'publication_changed',
            entityId: id,
            status: 'pending',
            availableAt: new Date(),
          })
        return record
      })
    },
  }
}
