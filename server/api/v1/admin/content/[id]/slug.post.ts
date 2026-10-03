import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { slugSchema } from '../../../../../../shared/contracts/content'
import { api, body } from '../../../../../utils/http'
import { requireAuth } from '../../../../../utils/auth'
import { database } from '../../../../../db/client'
import { lockContentSlugs } from '../../../../../db/locks'
import { entities, redirects, auditLogs } from '../../../../../db/schema'
const schema = z
  .object({
    slug: slugSchema,
    version: z.number().int().positive(),
    reason: z.string().min(5).max(500),
  })
  .strict()
export default api(async (event) => {
  const actor = await requireAuth(event, true, ['reviewer'])
  const input = await body(event, schema)
  return database().transaction(async (tx) => {
    await lockContentSlugs(tx)
    const [row] = await tx
      .select()
      .from(entities)
      .where(eq(entities.id, getRouterParam(event, 'id') ?? ''))
      .for('update')
    if (!row) throw createError({ statusCode: 404 })
    if (row.version !== input.version) throw createError({ statusCode: 409 })
    if (!['program', 'initiative', 'story'].includes(row.kind))
      throw createError({ statusCode: 422 })
    const base = (
      {
        program: '/program/',
        initiative: '/inisiatif/',
        story: '/cerita/',
      } as Record<string, string>
    )[row.kind]!
    const from = base + row.slug,
      to = base + input.slug
    if (from === to) throw createError({ statusCode: 422 })
    const [alias] = await tx
      .select()
      .from(redirects)
      .where(eq(redirects.fromPath, to))
    if (alias)
      throw createError({
        statusCode: 422,
        statusMessage: 'Slug tujuan sudah menjadi alias',
      })
    await tx
      .update(entities)
      .set({ slug: input.slug, version: row.version + 1 })
      .where(eq(entities.id, row.id))
    await tx
      .update(redirects)
      .set({ toPath: to })
      .where(eq(redirects.toPath, from))
    await tx
      .insert(redirects)
      .values({ fromPath: from, toPath: to, createdAt: new Date() })
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorId: actor.id,
      action: 'content.slug_change',
      targetId: row.id,
      requestId: event.context.requestId,
      reason: input.reason,
      safeChange: { from, to },
      createdAt: new Date(),
    })
    return { ok: true }
  })
})
