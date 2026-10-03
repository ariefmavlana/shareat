import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { api, body } from '../../../../utils/http'
import { requireAuth } from '../../../../utils/auth'
import { database } from '../../../../db/client'
import { users, proposals, auditLogs } from '../../../../db/schema'
const schema = z
  .object({ userId: z.uuid(), reason: z.string().trim().min(20).max(1000) })
  .strict()
export default api(async (event) => {
  const actor = await requireAuth(event, true, ['admin'])
  const input = await body(event, schema)
  if (input.userId === actor.id)
    throw createError({
      statusCode: 403,
      statusMessage: 'Pemulihan tidak dapat diusulkan untuk diri sendiri',
    })
  const [user] = await database()
    .select()
    .from(users)
    .where(eq(users.id, input.userId))
  if (!user) throw createError({ statusCode: 404 })
  const id = randomUUID()
  await database().transaction(async (tx) => {
    await tx.insert(proposals).values({
      id,
      kind: 'recovery',
      makerId: actor.id,
      payload: input,
      createdAt: new Date(),
    })
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorId: actor.id,
      action: 'staff.recovery_propose',
      targetId: input.userId,
      requestId: event.context.requestId,
      reason: input.reason,
      safeChange: {},
      createdAt: new Date(),
    })
  })
  return { id }
})
