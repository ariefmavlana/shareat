import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { verify } from 'otplib'
import { api, body, requireOrigin } from '../../../utils/http'
import { rateLimit, networkKey } from '../../../utils/auth'
import { database } from '../../../db/client'
import { lockIdentityLifecycle } from '../../../db/locks'
import {
  authChallenges,
  users,
  organizations,
  auditLogs,
} from '../../../db/schema'
import { digest, decrypt } from '../../../modules/identity/crypto'
import { inviteSchema } from '../../../../shared/contracts/identity'
const schema = z
  .object({
    token: z.string().regex(/^[a-f0-9]{64}$/),
    totp: z.string().regex(/^\d{6}$/),
  })
  .strict()
export default api(async (event) => {
  requireOrigin(event)
  await rateLimit(event, 'activate:' + networkKey(event), 10)
  const input = await body(event, schema)
  return database().transaction(async (tx) => {
    await lockIdentityLifecycle(tx)
    const [row] = await tx
      .select()
      .from(authChallenges)
      .where(eq(authChallenges.tokenHash, digest(input.token)))
      .for('update')
    if (
      !row ||
      row.consumed ||
      row.expiresAt.getTime() < Date.now() ||
      !['invite', 'recovery'].includes(row.kind)
    )
      throw createError({
        statusCode: 400,
        statusMessage: 'Undangan tidak valid',
      })
    const account = inviteSchema.parse({
      email: row.payload.email,
      organizationId: row.payload.organizationId,
      roles: row.payload.roles,
    })
    const [org] = await tx
      .select()
      .from(organizations)
      .where(eq(organizations.id, account.organizationId))
    if (!org?.verified || org.suspended) throw createError({ statusCode: 403 })
    if (
      org.type === 'partner' &&
      account.roles.some((role) => role !== 'partner_editor')
    )
      throw createError({ statusCode: 403 })
    const mfaCipher = String(row.payload.mfaCipher ?? ''),
      passwordHash = String(row.payload.passwordHash ?? '')
    if (!mfaCipher || !passwordHash) throw createError({ statusCode: 400 })
    const otp = await verify({
      secret: decrypt(mfaCipher),
      token: input.totp,
      epochTolerance: 30,
    })
    if (!otp.valid || !('timeStep' in otp))
      throw createError({
        statusCode: 400,
        statusMessage: 'Kode authenticator tidak valid',
      })
    const id =
      row.kind === 'recovery' ? String(row.payload.userId) : randomUUID()
    if (row.kind === 'recovery') {
      await tx
        .update(users)
        .set({
          passwordHash,
          mfaCipher,
          lastTotpStep: otp.timeStep,
          suspended: false,
        })
        .where(eq(users.id, id))
    } else {
      await tx.insert(users).values({
        ...account,
        id,
        passwordHash,
        mfaCipher,
        lastTotpStep: otp.timeStep,
        createdAt: new Date(),
      })
    }
    await tx
      .update(authChallenges)
      .set({
        consumed: true,
        payload: {
          email: account.email,
          organizationId: account.organizationId,
          roles: account.roles,
        },
      })
      .where(eq(authChallenges.id, row.id))
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorId: id,
      action: 'staff.activate',
      targetId: id,
      requestId: event.context.requestId,
      safeChange: { roles: account.roles },
      createdAt: new Date(),
    })
    return { ok: true }
  })
})
