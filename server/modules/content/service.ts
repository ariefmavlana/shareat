import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import {
  contentBodySchema,
  reviewSchema,
} from '../../../shared/contracts/content'
import type {
  Actor,
  Checklist,
  ContentKind,
  ContentRecord,
  PublicContent,
} from '../../../shared/contracts/content'
import type { ContentRepository } from './repository'
const fail = (statusCode: number, statusMessage: string): never => {
  throw createError({ statusCode, statusMessage })
}
const has = (a: Actor, ...roles: string[]) =>
  roles.some((role) => a.roles.includes(role))
export const isAuditor = (a: Actor) => a.roles.includes('auditor')
const isFullTeamEditor = (a: Actor) => has(a, 'editor')
export function assertNotAuditor(actor: Actor) {
  if (isAuditor(actor) || actor.roles.includes('operator'))
    fail(403, 'Auditor dan operator bersifat baca saja')
}
export function assertEdit(actor: Actor, record?: ContentRecord) {
  assertNotAuditor(actor)
  if (!actor.verified || !has(actor, 'editor', 'partner_editor'))
    fail(403, 'Akses ditolak')
  if (
    actor.roles.includes('partner_editor') &&
    !actor.roles.includes('editor') &&
    record &&
    (record.organizationId !== actor.organizationId ||
      record.kind !== 'initiative')
  )
    fail(403, 'Akses ditolak')
}
export function publicDto(record: ContentRecord): PublicContent | null {
  const rev = record.revisions.find((r) => r.id === record.publishedRevisionId)
  if (
    !rev ||
    record.archived ||
    rev.status !== 'published' ||
    (process.env.NUXT_APP_MODE === 'production' && rev.body.demo)
  )
    return null
  const b = contentBodySchema.parse(rev.body)
  return {
    id: record.id,
    kind: record.kind,
    slug: record.slug,
    title: b.title,
    summary: b.summary,
    paragraphs: b.paragraphs,
    programSlug: b.programSlug,
    location: b.location,
    activityStatus: b.activityStatus,
    responsible: b.responsible,
    schedule: b.schedule,
    author: b.author,
    effectiveDate: b.effectiveDate,
    imageId: b.imageId,
    imageAlt: b.imageAlt,
    demo: b.demo,
    sortOrder: b.sortOrder,
    updatedAt: rev.createdAt,
  }
}
export class ContentService {
  constructor(private readonly repo: ContentRepository) {}
  async create(actor: Actor, kind: ContentKind, input: unknown, slug?: string) {
    assertEdit(actor)
    if (!isFullTeamEditor(actor) && kind !== 'initiative')
      fail(403, 'Editor mitra hanya dapat membuat inisiatif')
    const body = contentBodySchema.parse(input)
    if (
      kind === 'page' &&
      slug &&
      [
        'admin',
        'api',
        'program',
        'inisiatif',
        'cerita',
        'cari',
        'faq',
        'kontak',
        'media',
      ].includes(slug)
    )
      fail(422, 'Slug memakai route sistem')
    const record: ContentRecord = {
      id: randomUUID(),
      kind,
      slug:
        slug ??
        body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') +
          '-' +
          randomUUID().slice(0, 8),
      organizationId: actor.organizationId,
      version: 1,
      revisions: [
        {
          id: randomUUID(),
          body,
          status: 'draft',
          authorId: actor.id,
          reviewerId: null,
          checklist: null,
          createdAt: new Date().toISOString(),
        },
      ],
      publishedRevisionId: null,
      everPublished: false,
      archived: false,
    }
    await this.repo.create(record, actor)
    return record
  }
  async save(actor: Actor, id: string, version: number, input: unknown) {
    const body = contentBodySchema.parse(input)
    return this.repo.mutate(
      id,
      version,
      actor,
      'content.save',
      undefined,
      (record) => {
        assertEdit(actor, record)
        const last = record.revisions.at(-1)!
        if (['submitted', 'reviewed'].includes(last.status))
          fail(409, 'Selesaikan review sebelum mengedit')
        record.revisions.push({
          id: randomUUID(),
          body,
          status: 'draft',
          authorId: actor.id,
          reviewerId: null,
          checklist: null,
          createdAt: new Date().toISOString(),
        })
      },
    )
  }
  async transition(
    actor: Actor,
    id: string,
    version: number,
    action: string,
    checklist?: Checklist,
    reason?: string,
  ) {
    return this.repo.mutate(
      id,
      version,
      actor,
      'content.' + action,
      reason,
      (record) => {
        const rev = record.revisions.at(-1)!
        const reviewing =
          has(actor, 'reviewer') && actor.verified && !isAuditor(actor)
        if (action === 'submit') {
          assertEdit(actor, record)
          if (!['draft', 'changes_requested'].includes(rev.status))
            fail(409, 'Transisi tidak valid')
          rev.status = 'submitted'
        } else if (action === 'request_changes') {
          if (!reviewing || rev.authorId === actor.id)
            fail(403, 'Reviewer harus berbeda dari penulis')
          if (rev.status !== 'submitted' || !reason)
            fail(422, 'Alasan revisi diperlukan')
          rev.status = 'changes_requested'
          rev.reviewerId = actor.id
          rev.reviewNote = reason
          rev.reviewedAt = new Date().toISOString()
        } else if (action === 'review') {
          if (!reviewing || rev.authorId === actor.id)
            fail(403, 'Reviewer harus berbeda dari penulis')
          if (rev.status !== 'submitted') fail(409, 'Transisi tidak valid')
          const checks = reviewSchema.parse(checklist)
          if (!Object.values(checks).every(Boolean))
            fail(422, 'Checklist belum lengkap')
          rev.status = 'reviewed'
          rev.reviewerId = actor.id
          rev.checklist = checks
          rev.reviewNote = reason ?? null
          rev.reviewedAt = new Date().toISOString()
        } else if (action === 'publish') {
          if (!reviewing || rev.authorId === actor.id)
            fail(403, 'Reviewer harus berbeda dari penulis')
          if (rev.status !== 'reviewed' || rev.reviewerId !== actor.id)
            fail(409, 'Review belum disetujui identitas ini')
          if (
            record.kind === 'initiative' &&
            (!rev.body.programSlug || !rev.body.responsible?.trim())
          )
            fail(422, 'Program dan penanggung jawab diperlukan')
          if (record.kind === 'story' && !rev.body.author?.trim())
            fail(422, 'Penulis cerita diperlukan')
          if (
            record.kind === 'page' &&
            ['privasi', 'ketentuan'].includes(record.slug) &&
            !rev.body.effectiveDate
          )
            fail(422, 'Tanggal versi kebijakan diperlukan')
          rev.status = 'published'
          rev.createdAt = new Date().toISOString()
          record.publishedRevisionId = rev.id
          record.everPublished = true
          record.archived = false
        } else if (action === 'archive') {
          if (!reviewing) fail(403, 'Akses ditolak')
          if (!reason) fail(422, 'Alasan arsip diperlukan')
          rev.reviewNote = reason
          rev.reviewedAt = new Date().toISOString()
          record.archived = true
          record.publishedRevisionId = null
        } else fail(422, 'Aksi tidak valid')
      },
    )
  }
  async publicDetail(kind: ContentKind, slug: string) {
    const record = await this.repo.bySlug(kind, slug)
    if (!record) return fail(404, 'Konten tidak ditemukan')
    const dto = publicDto(record)
    if (!dto)
      return fail(
        record.everPublished && record.archived ? 410 : 404,
        'Konten tidak tersedia',
      )
    return dto
  }
  async publicPage(query: Parameters<ContentRepository['page']>[0]) {
    return this.repo.page(query)
  }
  async publicList() {
    return this.repo.published()
  }
  async privateDetail(actor: Actor, id: string) {
    const record = await this.repo.get(id)
    if (!record) return fail(404, 'Konten tidak ditemukan')
    if (!has(actor, 'reviewer', 'admin', 'editor', 'auditor', 'operator'))
      assertEdit(actor, record)
    return record
  }
  async privateList(
    actor: Actor,
    query: { page: number; kind?: ContentKind } = { page: 1 },
  ) {
    const unrestricted = has(
      actor,
      'reviewer',
      'admin',
      'editor',
      'auditor',
      'operator',
    )
    if (!unrestricted) assertEdit(actor)
    if (!unrestricted && query.kind && query.kind !== 'initiative')
      return { items: [], page: query.page, pages: 1, total: 0 }
    return this.repo.list({
      ...query,
      ...(!unrestricted
        ? { kind: 'initiative', organizationId: actor.organizationId }
        : {}),
    })
  }
}
