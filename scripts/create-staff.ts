import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { generateSecret, generateURI } from 'otplib'
import { database, closeDatabase } from '../server/db/client'
import { organizations, users, auditLogs } from '../server/db/schema'
import { encrypt, hashPassword } from '../server/modules/identity/crypto'
import { z } from 'zod'
const input = z
  .object({
    email: z.email(),
    password: z.string().min(16),
    name: z.string().min(3),
    roles: z
      .array(z.enum(['admin', 'editor', 'reviewer', 'operator', 'auditor']))
      .min(1),
  })
  .parse({
    email: process.env.STAFF_EMAIL,
    password: process.env.STAFF_PASSWORD,
    name: process.env.STAFF_TEAM_NAME,
    roles: (process.env.STAFF_ROLES ?? '').split(','),
  })
const db = database()
try {
  const [team] = await db
    .select()
    .from(organizations)
    .where((await import('drizzle-orm')).eq(organizations.type, 'team'))
  const organizationId = team?.id ?? randomUUID(),
    id = randomUUID(),
    secret = generateSecret()
  await db.transaction(async (tx) => {
    if (!team)
      await tx.insert(organizations).values({
        id: organizationId,
        type: 'team',
        name: input.name,
        slug: 'shareat-team',
        verified: true,
        evidence:
          'Private CLI bootstrap approved by owner; actual identity must be reviewed before public publication.',
      })
    await tx.insert(users).values({
      id,
      organizationId,
      email: input.email.toLowerCase(),
      roles: input.roles,
      passwordHash: await hashPassword(input.password),
      mfaCipher: encrypt(secret),
      createdAt: new Date(),
    })
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorId: id,
      action: 'staff.cli_bootstrap',
      targetId: id,
      requestId: randomUUID(),
      safeChange: { roles: input.roles },
      createdAt: new Date(),
    })
  })
  await mkdir('.data', { recursive: true })
  const path = '.data/enrollment-' + id + '.json'
  await writeFile(
    path,
    JSON.stringify({
      email: input.email,
      secret,
      uri: generateURI({ issuer: 'Shareat', label: input.email, secret }),
    }),
    { mode: 0o600 },
  )
  console.log(
    'Private enrollment written to ' +
      path +
      '; transfer privately, then remove after enrollment.',
  )
} finally {
  await closeDatabase()
}
