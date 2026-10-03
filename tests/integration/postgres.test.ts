import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { and, eq, inArray, sql } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { database, closeDatabase } from '../../server/db/client'
import { lockIdentityLifecycle } from '../../server/db/locks'
import {
  revokeUserChallenges,
  revokeOrganizationChallenges,
} from '../../server/modules/identity/lifecycle'
import {
  organizations,
  users,
  entities,
  revisions,
  auditLogs,
  outbox,
  rateLimits,
  redirects,
  settings,
  authChallenges,
} from '../../server/db/schema'
import { postgresContentRepository } from '../../server/modules/content/postgres-repository'
import { ContentService } from '../../server/modules/content/service'
import { rateLimit } from '../../server/utils/auth'
import { digest } from '../../server/modules/identity/crypto'
import type { Actor, ContentBody } from '../../shared/contracts/content'
const org = randomUUID(),
  editorId = randomUUID(),
  reviewerId = randomUUID(),
  tag = randomUUID()
const ids: string[] = []
const editor: Actor = {
  id: editorId,
  organizationId: org,
  verified: true,
  roles: ['editor'],
}
const reviewer: Actor = {
  id: reviewerId,
  organizationId: org,
  verified: true,
  roles: ['reviewer'],
}
const body: ContentBody = {
  title: 'Uji PostgreSQL ' + tag,
  summary: 'Pencarian literal 100% untuk komunitas Indonesia.',
  paragraphs: ['Buku 📚 dan pengetahuan untuk semua.'],
  location: 'Yogyakarta',
  programSlug: 'share-eat',
  responsible: 'Tim pengujian',
  activityStatus: 'planning',
  demo: true,
  sortOrder: 10,
}
let service: ContentService
let allowed = false
const query = { page: 1, q: tag, program: '', lokasi: '', status: '' }
async function create(input: ContentBody = body) {
  const item = await service.create(editor, 'initiative', input)
  ids.push(item.id)
  return item
}
async function publish(id: string) {
  await service.transition(editor, id, 1, 'submit')
  await service.transition(reviewer, id, 2, 'review', {
    claims: true,
    media: true,
    privacy: true,
    seo: true,
    contact: true,
  })
  return service.transition(reviewer, id, 3, 'publish')
}
describe('PostgreSQL persistence invariants', () => {
  beforeAll(async () => {
    const uri = process.env.NUXT_DATABASE_URL
    if (
      !uri ||
      process.env.NUXT_APP_MODE !== 'demo' ||
      !['localhost', '127.0.0.1'].includes(new URL(uri).hostname) ||
      !new URL(uri).pathname.endsWith('_test')
    )
      throw new Error(
        'Integration tests require an isolated local *_test PostgreSQL database in demo mode',
      )
    allowed = true
    await database()
      .insert(organizations)
      .values({
        id: org,
        name: 'Uji database',
        slug: 'test-' + tag,
        verified: true,
      })
    await database()
      .insert(users)
      .values(
        [editorId, reviewerId].map((id) => ({
          id,
          organizationId: org,
          email: id + '@shareat.example',
          passwordHash: 'fixture-only',
          mfaCipher: 'fixture-only',
          roles: [],
          createdAt: new Date(),
        })),
      )
    service = new ContentService(postgresContentRepository())
  })
  afterAll(async () => {
    if (!allowed) return
    const db = database()
    if (ids.length) {
      await db
        .update(entities)
        .set({ publishedRevisionId: null })
        .where(inArray(entities.id, ids))
      await db.delete(revisions).where(inArray(revisions.entityId, ids))
      await db.delete(outbox).where(inArray(outbox.entityId, ids))
      await db.delete(auditLogs).where(inArray(auditLogs.targetId, ids))
      await db.delete(entities).where(inArray(entities.id, ids))
    }
    await db.delete(users).where(eq(users.organizationId, org))
    await db.delete(organizations).where(eq(organizations.id, org))
    await closeDatabase()
  })
  it('round-trips JSONB Unicode and filters literal text, taxonomy, location, status, numeric order and demo visibility', async () => {
    const a = await create(),
      b = await create({ ...body, demo: false, sortOrder: 2 })
    await publish(a.id)
    await publish(b.id)
    const repo = postgresContentRepository()
    const page = await repo.page({
      ...query,
      program: 'share-eat',
      lokasi: 'YOGYA',
      status: 'planning',
    })
    expect(page.items.map((x) => x.id)).toEqual([b.id, a.id])
    expect(page.items[0]?.paragraphs).toEqual(body.paragraphs)
    expect(
      (await repo.page({ ...query, q: '100%' })).items.some(
        (x) => x.id === a.id,
      ),
    ).toBe(true)
    expect((await repo.page({ ...query, q: '%_' + tag })).total).toBe(0)
    try {
      process.env.NUXT_APP_MODE = 'production'
      expect((await repo.page(query)).items.map((x) => x.id)).toEqual([b.id])
    } finally {
      process.env.NUXT_APP_MODE = 'demo'
    }
  })
  it('serializes concurrent edits with one success, one 409 and no extra revision or audit', async () => {
    const item = await create()
    const result = await Promise.allSettled([
      service.save(editor, item.id, 1, { ...body, title: 'Edit A ' + tag }),
      service.save(editor, item.id, 1, { ...body, title: 'Edit B ' + tag }),
    ])
    expect(result.filter((x) => x.status === 'fulfilled')).toHaveLength(1)
    const rejected = result.find(
      (x) => x.status === 'rejected',
    ) as PromiseRejectedResult
    expect(rejected.reason.statusCode).toBe(409)
    const saved = await postgresContentRepository().get(item.id)
    expect(saved?.version).toBe(2)
    expect(saved?.revisions).toHaveLength(2)
    expect(
      await database()
        .select()
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.targetId, item.id),
            eq(auditLogs.action, 'content.save'),
          ),
        ),
    ).toHaveLength(1)
  })
  it('rolls back publication, pointer, version and audit if media validation fails', async () => {
    const item = await create({
      ...body,
      imageId: randomUUID(),
      imageAlt: 'Contoh foto',
    })
    await service.transition(editor, item.id, 1, 'submit')
    await service.transition(reviewer, item.id, 2, 'review', {
      claims: true,
      media: true,
      privacy: true,
      seo: true,
      contact: true,
    })
    await expect(
      service.transition(reviewer, item.id, 3, 'publish'),
    ).rejects.toMatchObject({ statusCode: 422 })
    const saved = await postgresContentRepository().get(item.id)
    expect(saved?.version).toBe(3)
    expect(saved?.publishedRevisionId).toBeNull()
    expect(saved?.revisions.at(-1)?.status).toBe('reviewed')
    expect(
      await database()
        .select()
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.targetId, item.id),
            eq(auditLogs.action, 'content.publish'),
          ),
        ),
    ).toHaveLength(0)
  })
  it('enforces FK and uniqueness, preserves UTC milliseconds, and supports conflict updates and compare-and-swap returning', async () => {
    await expect(
      database()
        .insert(users)
        .values({
          id: randomUUID(),
          organizationId: randomUUID(),
          email: tag + '@invalid.example',
          passwordHash: 'x',
          mfaCipher: 'x',
          roles: [],
          createdAt: new Date(),
        }),
    ).rejects.toMatchObject({ cause: { code: '23503' } })
    await expect(
      database()
        .insert(organizations)
        .values({ id: randomUUID(), name: 'duplicate', slug: 'test-' + tag }),
    ).rejects.toMatchObject({ cause: { code: '23505' } })
    const config = await database().execute(
      sql`SELECT current_setting('TimeZone') timezone, current_setting('statement_timeout') statement, current_setting('lock_timeout') lock, current_setting('idle_in_transaction_session_timeout') idle`,
    )
    expect(config.rows[0]).toEqual({
      timezone: 'UTC',
      statement: '15s',
      lock: '10s',
      idle: '30s',
    })
    const date = new Date('2026-10-03T19:05:06.123+07:00')
    await database()
      .update(users)
      .set({ createdAt: date })
      .where(eq(users.id, editorId))
    const [user] = await database()
      .select()
      .from(users)
      .where(eq(users.id, editorId))
    expect(user?.createdAt.toISOString()).toBe('2026-10-03T12:05:06.123Z')
    const results = await Promise.all(
      [1, 2].map((step) =>
        database()
          .update(users)
          .set({ lastTotpStep: step })
          .where(and(eq(users.id, editorId), eq(users.lastTotpStep, 0)))
          .returning({ id: users.id }),
      ),
    )
    expect(results.map((x) => x.length).sort()).toEqual([0, 1])
    const key = 'integration-' + tag
    try {
      await database()
        .insert(settings)
        .values({ key, value: { text: '📚' }, version: 1 })
      await database()
        .insert(settings)
        .values({ key, value: { text: 'baru' } })
        .onConflictDoUpdate({
          target: settings.key,
          set: {
            value: { text: 'baru' },
            version: sql`${settings.version} + 1`,
          },
        })
      const [row] = await database()
        .select()
        .from(settings)
        .where(eq(settings.key, key))
      expect(row?.version).toBe(2)
      expect(row?.value).toEqual({ text: 'baru' })
    } finally {
      await database().delete(settings).where(eq(settings.key, key))
    }
  })
  it('limits simultaneous requests atomically without lost increments', async () => {
    const key = 'integration-' + tag,
      hash = digest((process.env.NUXT_ENCRYPTION_KEY ?? '') + key)
    try {
      const result = await Promise.allSettled(
        Array.from({ length: 8 }, () => rateLimit({} as H3Event, key, 3)),
      )
      expect(result.filter((x) => x.status === 'fulfilled')).toHaveLength(3)
      for (const r of result)
        if (r.status === 'rejected') expect(r.reason.statusCode).toBe(429)
      const [bucket] = await database()
        .select()
        .from(rateLimits)
        .where(eq(rateLimits.key, hash))
      expect(bucket?.count).toBe(3)
    } finally {
      await database().delete(rateLimits).where(eq(rateLimits.key, hash))
    }
  })
  it('serializes content creation with alias reservations even when a path has no row', async () => {
    const slug = 'alias-race-' + tag,
      path = '/inisiatif/' + slug
    let creation: Promise<unknown> | undefined
    let settled = false
    let result: PromiseSettledResult<unknown> | undefined
    try {
      await database().transaction(async (tx) => {
        await tx.execute(
          sql`SELECT pg_advisory_xact_lock(hashtext('shareat-content-slug'))`,
        )
        creation = service.create(editor, 'initiative', body, slug).then(
          (item) => {
            ids.push(item.id)
            result = { status: 'fulfilled', value: item }
            settled = true
          },
          (reason) => {
            result = { status: 'rejected', reason }
            settled = true
          },
        )
        const deadline = Date.now() + 2000
        while (!settled) {
          const wait = await database().execute(
            sql`SELECT EXISTS (SELECT 1 FROM pg_locks l JOIN pg_stat_activity a ON a.pid=l.pid WHERE l.locktype='advisory' AND NOT l.granted AND a.datname=current_database() AND a.application_name='shareat-r1') waiting`,
          )
          if (wait.rows[0]?.waiting) break
          if (Date.now() > deadline)
            throw new Error(
              'Creation did not settle or acquire the namespace lock',
            )
          await new Promise((resolve) => setTimeout(resolve, 10))
        }
        await tx.insert(redirects).values({
          fromPath: path,
          toPath: '/inisiatif/dapur-berbagi',
          createdAt: new Date(),
        })
      })
      await creation
      expect(result?.status).toBe('rejected')
      if (result?.status === 'rejected')
        expect(result.reason.statusCode).toBe(409)
    } finally {
      await creation
      await database().delete(redirects).where(eq(redirects.fromPath, path))
    }
  })
  it('serializes identity revocation before activation and scrubs only matching challenges', async () => {
    const challengeIds = [randomUUID(), randomUUID(), randomUUID()]
    let activation: Promise<void> | undefined
    let consumed: boolean | undefined
    const db = database()
    await db.insert(authChallenges).values(
      challengeIds.map((id, i) => ({
        id,
        tokenHash: digest(id),
        kind: i === 0 ? 'recovery' : 'invite',
        payload: {
          email:
            i === 1 ? editorId + '@shareat.example' : 'other@shareat.example',
          userId: i === 0 ? editorId : undefined,
          organizationId: i < 2 ? org : 'unrelated',
          mfaCipher: 'private-fixture',
          passwordHash: 'private-fixture',
        },
        expiresAt: new Date(Date.now() + 60000),
      })),
    )
    try {
      await db.transaction(async (tx) => {
        await lockIdentityLifecycle(tx)
        activation = db.transaction(async (other) => {
          await lockIdentityLifecycle(other)
          const [row] = await other
            .select()
            .from(authChallenges)
            .where(eq(authChallenges.id, challengeIds[0]!))
          consumed = row?.consumed
        })
        const deadline = Date.now() + 2000
        while (true) {
          const wait = await db.execute(
            sql`SELECT EXISTS (SELECT 1 FROM pg_locks l JOIN pg_stat_activity a ON a.pid=l.pid WHERE l.locktype='advisory' AND NOT l.granted AND a.datname=current_database() AND a.application_name='shareat-r1') waiting`,
          )
          if (wait.rows[0]?.waiting) break
          if (Date.now() > deadline)
            throw new Error(
              'Activation did not wait for identity lifecycle lock',
            )
          await new Promise((resolve) => setTimeout(resolve, 10))
        }
        await revokeUserChallenges(tx, editorId, editorId + '@shareat.example')
      })
      await activation
      expect(consumed).toBe(true)
      const rows = await db
        .select()
        .from(authChallenges)
        .where(inArray(authChallenges.id, challengeIds))
      for (const id of challengeIds.slice(0, 2)) {
        const row = rows.find((r) => r.id === id)!
        expect(row.consumed).toBe(true)
        expect(row.payload).toEqual({})
      }
      expect(rows.find((r) => r.id === challengeIds[2])?.consumed).toBe(false)
      await db.transaction(async (tx) => {
        await lockIdentityLifecycle(tx)
        await revokeOrganizationChallenges(tx, 'unrelated')
      })
      const [last] = await db
        .select()
        .from(authChallenges)
        .where(eq(authChallenges.id, challengeIds[2]!))
      expect(last?.consumed).toBe(true)
      expect(last?.payload).toEqual({})
    } finally {
      await activation
      await db
        .delete(authChallenges)
        .where(inArray(authChallenges.id, challengeIds))
    }
  })
  it('lets independent workers skip a locked outbox row', async () => {
    const item = await create(),
      jobIds = [randomUUID(), randomUUID()]
    await database()
      .insert(outbox)
      .values(
        jobIds.map((id) => ({
          id,
          type: 'publication',
          entityId: item.id,
          availableAt: new Date(),
        })),
      )
    await database().transaction(async (tx) => {
      const first = await tx
        .select()
        .from(outbox)
        .where(eq(outbox.id, jobIds[0]!))
        .for('update')
      const second = await database().transaction((tx2) =>
        tx2
          .select()
          .from(outbox)
          .where(inArray(outbox.id, jobIds))
          .for('update', { skipLocked: true }),
      )
      expect(first).toHaveLength(1)
      expect(second.map((x) => x.id)).toEqual([jobIds[1]])
    })
  })
})
