import 'dotenv/config'
import { z } from 'zod'
import { eq, and, sql } from 'drizzle-orm'
import { database, closeDatabase } from '../server/db/client'
import { users, organizations, entities, revisions } from '../server/db/schema'
import { publicSettings } from '../server/modules/contact/service'
const config = z
  .object({
    mode: z.literal('production'),
    url: z.url().startsWith('https://'),
    key: z.string().regex(/^[a-f0-9]{64}$/),
    scanner: z.string().min(1),
  })
  .safeParse({
    mode: process.env.NUXT_APP_MODE,
    url: process.env.NUXT_SITE_URL,
    key: process.env.NUXT_ENCRYPTION_KEY,
    scanner: process.env.NUXT_SCANNER_COMMAND,
  })
if (!config.success) {
  console.error(
    'BLOCKED: production HTTPS, mode, encryption, and scanner configuration required.',
  )
  process.exitCode = 1
} else
  try {
    const problems: string[] = []
    const demo = await database()
      .select({ id: entities.id })
      .from(entities)
      .innerJoin(revisions, eq(entities.publishedRevisionId, revisions.id))
      .where(
        and(
          eq(entities.archived, false),
          sql`${revisions.body}->>'demo' = 'true'`,
        ),
      )
      .limit(1)
    if (demo.length) problems.push('Published demo content remains')
    const publicConfig = await publicSettings()
    if (!publicConfig.contact) problems.push('Approved contact unavailable')
    const accounts = await database()
      .select({ user: users, org: organizations })
      .from(users)
      .innerJoin(organizations, eq(users.organizationId, organizations.id))
    const editors = accounts.filter(
      (x) =>
        !x.user.suspended && x.org.verified && x.user.roles.includes('editor'),
    )
    const reviewers = accounts.filter(
      (x) =>
        !x.user.suspended &&
        x.org.verified &&
        x.user.roles.includes('reviewer'),
    )
    if (!editors.some((a) => reviewers.some((b) => a.user.id !== b.user.id)))
      problems.push('Independent editor and reviewer required')
    if (problems.length) {
      console.error('BLOCKED: ' + problems.join('; '))
      process.exitCode = 1
    } else
      console.log(
        'Technical preflight passed. External release gates still require actual evidence in docs/DECISIONS.md.',
      )
  } finally {
    await closeDatabase()
  }
