import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { api, body } from '../../../../../utils/http'
import { requireAuth } from '../../../../../utils/auth'
import { database } from '../../../../../db/client'
import { assets, auditLogs } from '../../../../../db/schema'
const schema = z
  .object({ reason: z.string().trim().min(20).max(2000) })
  .strict()
export default api(async (event) => {
  const actor = await requireAuth(event, true, ['reviewer'])
  if (actor.roles.includes('auditor') || actor.roles.includes('operator'))
    throw createError({
      statusCode: 403,
      statusMessage: 'Auditor dan operator bersifat baca saja',
    })
  const data = await body(event, schema)
  const id = getRouterParam(event, 'id') ?? ''
  return database().transaction(async (tx) => {
    const [asset] = await tx
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .for('update')
    if (!asset) throw createError({ statusCode: 404 })
    if (asset.uploadedBy === actor.id)
      throw createError({
        statusCode: 403,
        statusMessage: 'Pemeriksa hak media harus berbeda dari pengunggah',
      })
    if (asset.scanStatus !== 'clean')
      throw createError({
        statusCode: 422,
        statusMessage: 'Scan bersih diperlukan sebelum persetujuan',
      })
    await tx
      .update(assets)
      .set({
        rightsStatus: 'approved',
        rightsReason: data.reason,
        approvedBy: actor.id,
      })
      .where(eq(assets.id, id))
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorId: actor.id,
      action: 'media.rights_approve',
      targetId: id,
      requestId: event.context.requestId,
      reason: data.reason,
      safeChange: { rightsStatus: 'approved' },
      createdAt: new Date(),
    })
    return { ok: true }
  })
})
