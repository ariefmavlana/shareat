import { z } from 'zod'
import { eq, and, gt } from 'drizzle-orm'
import { verify } from 'otplib'
import { api, body, requireOrigin } from '../../../utils/http'
import { database } from '../../../db/client'
import { users, organizations, auditLogs } from '../../../db/schema'
import {
  decrypt,
  verifyPassword,
  hashPassword,
} from '../../../modules/identity/crypto'
import {
  rateLimit,
  networkKey,
  issueSession,
  endSession,
} from '../../../utils/auth'
import { randomUUID } from 'node:crypto'
const schema = z
  .object({
    email: z.email().max(254),
    password: z.string().min(1).max(200),
    totp: z.string().regex(/^\d{6}$/),
  })
  .strict()
let dummyHash: Promise<string> | undefined
export default api(async (event) => {
  requireOrigin(event)
  const input = await body(event, schema)
  const email = input.email.toLowerCase()
  await rateLimit(event, 'login-network:' + networkKey(event), 30)
  await rateLimit(event, 'login-account:' + email, 5)
  const db = database()
  const [row] = await db
    .select({ user: users, org: organizations })
    .from(users)
    .innerJoin(organizations, eq(users.organizationId, organizations.id))
    .where(eq(users.email, email))
  dummyHash ??= hashPassword('unused-random-account-padding-' + randomUUID())
  const validPassword = await verifyPassword(
    input.password,
    row?.user.passwordHash ?? (await dummyHash),
  )
  const valid =
    validPassword &&
    row &&
    !row.user.suspended &&
    !row.org.suspended &&
    row.org.verified
      ? await verify({
          secret: decrypt(row.user.mfaCipher),
          token: input.totp,
          epochTolerance: 30,
          afterTimeStep: row.user.lastTotpStep,
        })
      : { valid: false as const }
  if (!row || !valid.valid || !('timeStep' in valid))
    throw createError({
      statusCode: 401,
      statusMessage: 'Data masuk tidak valid',
    })
  const result = await db
    .update(users)
    .set({ lastTotpStep: valid.timeStep })
    .where(
      and(
        eq(users.id, row.user.id),
        gt(users.lastTotpStep, -1),
        eq(users.lastTotpStep, row.user.lastTotpStep),
      ),
    )
  if (result[0].affectedRows !== 1)
    throw createError({
      statusCode: 401,
      statusMessage: 'Data masuk tidak valid',
    })
  await endSession(event)
  const session = await issueSession(event, row.user.id)
  await db.insert(auditLogs).values({
    id: randomUUID(),
    actorId: row.user.id,
    action: 'auth.login',
    targetId: row.user.id,
    requestId: event.context.requestId,
    safeChange: {},
    createdAt: new Date(),
  })
  return {
    ...session,
    user: { id: row.user.id, email: row.user.email, roles: row.user.roles },
  }
})
