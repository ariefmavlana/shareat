import { describe, it, expect } from 'vitest'
import { createMemoryRepository } from '../support/memory-repository'
import { ContentService } from '../../server/modules/content/service'
import { contentBodySchema } from '../../shared/contracts/content'
const editor = {
  id: 'editor',
  roles: ['editor'],
  organizationId: 'org',
  verified: true,
}
const reviewer = {
  id: 'reviewer',
  roles: ['reviewer'],
  organizationId: 'team',
  verified: true,
}
const body = {
  title: 'Kegiatan contoh',
  summary: 'Contoh rencana kegiatan yang belum berlangsung.',
  paragraphs: ['Ini data demo, bukan kegiatan nyata.'],
  programSlug: 'share-eat',
  location: 'Bandung',
  activityStatus: 'planning',
  responsible: 'Tim demo',
  demo: true,
}
const checklist = {
  claims: true,
  media: true,
  privacy: true,
  seo: true,
  contact: true,
}
describe('Editorial policy', () => {
  it('rejects financial and unknown fields in R1', () => {
    expect(
      contentBodySchema.safeParse({ ...body, targetIdr: 100000 }).success,
    ).toBe(false)
  })
  it('keeps the approved snapshot when a new draft is saved', async () => {
    const service = new ContentService(createMemoryRepository())
    const item = await service.create(editor, 'initiative', body)
    await service.transition(editor, item.id, 1, 'submit')
    await service.transition(reviewer, item.id, 2, 'review', checklist)
    await service.transition(reviewer, item.id, 3, 'publish')
    await service.save(editor, item.id, 4, { ...body, title: 'Draft rahasia' })
    expect((await service.publicDetail('initiative', item.slug)).title).toBe(
      body.title,
    )
  })
  it('rejects self review, stale edits, and cross-organization writes', async () => {
    const service = new ContentService(createMemoryRepository())
    const item = await service.create(editor, 'initiative', body)
    await service.transition(editor, item.id, 1, 'submit')
    await expect(
      service.transition(
        { ...editor, roles: ['reviewer'] },
        item.id,
        2,
        'review',
        checklist,
      ),
    ).rejects.toMatchObject({ statusCode: 403 })
    await expect(service.save(editor, item.id, 1, body)).rejects.toMatchObject({
      statusCode: 409,
    })
    await expect(
      service.save(
        {
          ...editor,
          id: 'other',
          organizationId: 'other',
          roles: ['partner_editor'],
        },
        item.id,
        2,
        body,
      ),
    ).rejects.toMatchObject({ statusCode: 403 })
  })
  it('blocks suspended partners and requires every review check', async () => {
    const service = new ContentService(createMemoryRepository())
    await expect(
      service.create(
        { ...editor, roles: ['partner_editor'], verified: false },
        'initiative',
        body,
      ),
    ).rejects.toMatchObject({ statusCode: 403 })
    const item = await service.create(editor, 'initiative', body)
    await service.transition(editor, item.id, 1, 'submit')
    await expect(
      service.transition(reviewer, item.id, 2, 'review', {
        ...checklist,
        privacy: false,
      }),
    ).rejects.toMatchObject({ statusCode: 422 })
  })
  it('withdraws publication immediately and returns 410, with no private DTO fields', async () => {
    const service = new ContentService(createMemoryRepository())
    const item = await service.create(editor, 'initiative', body)
    await service.transition(editor, item.id, 1, 'submit')
    await service.transition(reviewer, item.id, 2, 'review', checklist)
    await service.transition(reviewer, item.id, 3, 'publish')
    const dto = await service.publicDetail('initiative', item.slug)
    expect(dto).not.toHaveProperty('authorId')
    expect(dto).not.toHaveProperty('organizationId')
    await service.transition(
      reviewer,
      item.id,
      4,
      'archive',
      undefined,
      'Koreksi privasi',
    )
    await expect(
      service.publicDetail('initiative', item.slug),
    ).rejects.toMatchObject({ statusCode: 410 })
  })
  it('paginates CMS records and scopes partners before reading', async () => {
    const service = new ContentService(createMemoryRepository())
    for (let i = 0; i < 21; i++)
      await service.create(editor, 'initiative', body)
    await service.create(
      { ...editor, organizationId: 'other' },
      'initiative',
      body,
    )
    const first = await service.privateList(editor, { page: 1 })
    expect(first.items).toHaveLength(20)
    expect(first.total).toBe(22)
    expect(first.pages).toBe(2)
    expect((await service.privateList(editor, { page: 2 })).items).toHaveLength(
      2,
    )
    const own = await service.privateList(
      { ...editor, roles: ['partner_editor'] },
      { page: 1 },
    )
    expect(own.total).toBe(21)
    expect(own.items.every((r) => r.organizationId === 'org')).toBe(true)
  })
  it('rejects publication with missing initiative responsibility, story author or policy date', async () => {
    for (const [kind, slug, input] of [
      ['initiative', 'incomplete', { ...body, responsible: undefined }],
      ['story', 'story-test', { ...body, author: undefined }],
      ['page', 'privasi', { ...body, effectiveDate: undefined }],
    ] as const) {
      const service = new ContentService(createMemoryRepository())
      const record = await service.create(editor, kind, input, slug)
      await service.transition(editor, record.id, 1, 'submit')
      await service.transition(reviewer, record.id, 2, 'review', checklist)
      await expect(
        service.transition(reviewer, record.id, 3, 'publish'),
      ).rejects.toMatchObject({ statusCode: 422 })
    }
  })
})
