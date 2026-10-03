import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { api, body } from '../../../../utils/http'
import { requireAuth } from '../../../../utils/auth'
import { database } from '../../../../db/client'
import { lockIdentityLifecycle } from '../../../../db/locks'
import {
  organizations,
  users,
  authChallenges,
  auditLogs,
} from '../../../../db/schema'
import { inviteSchema } from '../../../../../shared/contracts/identity'
import { token, digest } from '../../../../modules/identity/crypto'
export default api(async (event) => {
  const actor = await requireAuth(event, true, ['admin'])
  const input = await body(event, inviteSchema)
  const [org] = await database()
    .select()
    .from(organizations)
    .where(eq(organizations.id, input.organizationId))
  if (!org?.verified || org.suspended)
    throw createError({
      statusCode: 422,
      statusMessage: 'Organisasi belum terverifikasi aktif',
    })
  if (
    org.type === 'partner' &&
    input.roles.some((role) => role !== 'partner_editor')
  )
    throw createError({
      statusCode: 422,
      statusMessage: 'Mitra hanya dapat diberikan peran editor mitra',
    })
  const [existing] = await database()
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
  if (existing)
    throw createError({
      statusCode: 409,
      statusMessage: 'Akun sudah tersedia. Gunakan alur pengelolaan akses.',
    })
  const value = token(),
    id = randomUUID()
  await database().transaction(async (tx) => {
    await lockIdentityLifecycle(tx)
    const [currentOrg] = await tx
      .select()
      .from(organizations)
      .where(eq(organizations.id, input.organizationId))
    if (!currentOrg?.verified || currentOrg.suspended)
      throw createError({ statusCode: 422 })
    await tx.insert(authChallenges).values({
      id,
      tokenHash: digest(value),
      kind: 'invite',
      payload: {
        ...input,
        email: input.email.toLowerCase(),
        invitedBy: actor.id,
      },
      expiresAt: new Date(Date.now() + 86400000),
    })
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorId: actor.id,
      action: 'staff.invite',
      targetId: id,
      requestId: event.context.requestId,
      safeChange: { roles: input.roles },
      createdAt: new Date(),
    })
  })
  return { token: value, expiresInHours: 24 }
})
