import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { api, body } from '../../../../utils/http'
import { requireAuth } from '../../../../utils/auth'
import { database } from '../../../../db/client'
import { lockIdentityLifecycle } from '../../../../db/locks'
import {
  revokeUserChallenges,
  revokeOrganizationChallenges,
} from '../../../../modules/identity/lifecycle'
import {
  users,
  organizations,
  sessions,
  auditLogs,
} from '../../../../db/schema'
const schema = z
  .object({
    type: z.enum(['user', 'organization']),
    id: z.uuid(),
    reason: z.string().trim().min(5).max(500),
  })
  .strict()
export default api(async (event) => {
  const actor = await requireAuth(event, true, ['admin'])
  const input = await body(event, schema)
  if (input.id === actor.id || input.id === actor.organizationId)
    throw createError({
      statusCode: 422,
      statusMessage: 'Tidak dapat menangguhkan akses sendiri',
    })
  await database().transaction(async (tx) => {
    await lockIdentityLifecycle(tx)
    if (input.type === 'user') {
      const [user] = await tx.select().from(users).where(eq(users.id, input.id))
      if (!user) throw createError({ statusCode: 404 })
      await revokeUserChallenges(tx, user.id, user.email)
      await tx
        .update(users)
        .set({ suspended: true })
        .where(eq(users.id, input.id))
      await tx.delete(sessions).where(eq(sessions.userId, input.id))
    } else {
      const [org] = await tx
        .select()
        .from(organizations)
        .where(eq(organizations.id, input.id))
      if (!org) throw createError({ statusCode: 404 })
      await revokeOrganizationChallenges(tx, org.id)
      await tx
        .update(organizations)
        .set({ suspended: true, verified: false })
        .where(eq(organizations.id, input.id))
      const affected = await tx
        .select()
        .from(users)
        .where(eq(users.organizationId, input.id))
      for (const user of affected)
        await tx.delete(sessions).where(eq(sessions.userId, user.id))
    }
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorId: actor.id,
      action: input.type + '.suspend',
      targetId: input.id,
      requestId: event.context.requestId,
      reason: input.reason,
      safeChange: { suspended: true },
      createdAt: new Date(),
    })
  })
  return { ok: true }
})
