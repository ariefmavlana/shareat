import { token, digest } from '../../../../../modules/identity/crypto'
import { randomUUID } from 'node:crypto'
import { eq, sql } from 'drizzle-orm'
import { api } from '../../../../../utils/http'
import { requireAuth } from '../../../../../utils/auth'
import { database } from '../../../../../db/client'
import {
  proposals,
  settings,
  auditLogs,
  organizations,
  users,
  sessions,
  authChallenges,
} from '../../../../../db/schema'
import { organizationSchema } from '../../../../../../shared/contracts/identity'
import { contactSchema } from '../../../../../../shared/contracts/web'
export default api(async (event) => {
  const actor = await requireAuth(event, true, ['admin'])
  const id = getRouterParam(event, 'id') ?? ''
  return database().transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(proposals)
      .where(eq(proposals.id, id))
      .for('update')
    if (!row || row.status !== 'pending') throw createError({ statusCode: 404 })
    if (row.makerId === actor.id)
      throw createError({
        statusCode: 403,
        statusMessage: 'Penyetuju harus berbeda dari pengusul',
      })
    let recoveryToken: string | undefined
    if (row.kind === 'contact') {
      const value = contactSchema.parse(row.payload)
      await tx
        .insert(settings)
        .values({ key: 'contact', value, version: 1 })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value, version: sql`${settings.version} + 1` },
        })
    } else if (row.kind === 'organization') {
      const value = organizationSchema.parse(row.payload)
      await tx
        .insert(organizations)
        .values({ id: randomUUID(), ...value, verified: true })
    } else if (row.kind === 'recovery') {
      const userId = String(row.payload.userId ?? '')
      if (userId === actor.id)
        throw createError({
          statusCode: 403,
          statusMessage:
            'Pemulihan tidak dapat disetujui oleh akun yang dipulihkan',
        })
      const [user] = await tx.select().from(users).where(eq(users.id, userId))
      if (!user) throw createError({ statusCode: 404 })
      recoveryToken = token()
      await tx.delete(sessions).where(eq(sessions.userId, user.id))
      await tx
        .update(users)
        .set({ suspended: true })
        .where(eq(users.id, user.id))
      await tx.insert(authChallenges).values({
        id: randomUUID(),
        kind: 'recovery',
        tokenHash: digest(recoveryToken),
        payload: {
          userId: user.id,
          email: user.email,
          organizationId: user.organizationId,
          roles: user.roles,
        },
        expiresAt: new Date(Date.now() + 24 * 3600000),
      })
    } else throw createError({ statusCode: 422 })
    await tx
      .update(proposals)
      .set({ status: 'approved', checkerId: actor.id })
      .where(eq(proposals.id, id))
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorId: actor.id,
      action: row.kind + '.approve',
      targetId: id,
      requestId: event.context.requestId,
      safeChange: { kind: row.kind },
      createdAt: new Date(),
    })
    return { ok: true, recoveryToken }
  })
})
