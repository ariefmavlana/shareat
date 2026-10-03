import { z } from 'zod'
import { eq, and, gt } from 'drizzle-orm'
import { generateSecret, generateURI } from 'otplib'
import { api, body, requireOrigin } from '../../../utils/http'
import { rateLimit, networkKey } from '../../../utils/auth'
import { database } from '../../../db/client'
import { authChallenges } from '../../../db/schema'
import { digest, encrypt, hashPassword } from '../../../modules/identity/crypto'
const schema = z
  .object({
    token: z.string().regex(/^[a-f0-9]{64}$/),
    password: z.string().min(12).max(200),
  })
  .strict()
export default api(async (event) => {
  requireOrigin(event)
  await rateLimit(event, 'enroll:' + networkKey(event), 10)
  const input = await body(event, schema)
  const [row] = await database()
    .select()
    .from(authChallenges)
    .where(
      and(
        eq(authChallenges.tokenHash, digest(input.token)),
        eq(authChallenges.consumed, false),
        gt(authChallenges.expiresAt, new Date()),
      ),
    )
  if (!row || !['invite', 'recovery'].includes(row.kind))
    throw createError({
      statusCode: 400,
      statusMessage: 'Undangan tidak valid atau sudah kedaluwarsa',
    })
  const secret = generateSecret(),
    passwordHash = await hashPassword(input.password)
  await database()
    .update(authChallenges)
    .set({
      payload: { ...row.payload, mfaCipher: encrypt(secret), passwordHash },
      expiresAt: new Date(Date.now() + 5 * 60000),
    })
    .where(eq(authChallenges.id, row.id))
  return {
    secret,
    uri: generateURI({
      issuer: 'Shareat',
      label: String(row.payload.email),
      secret,
    }),
  }
})
