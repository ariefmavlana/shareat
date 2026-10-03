import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { eq, lt, and, or, isNull } from 'drizzle-orm'
import { database, closeDatabase } from '../server/db/client'
import {
  sessions,
  rateLimits,
  authChallenges,
  outbox,
} from '../server/db/schema'
const db = database(),
  owner = randomUUID(),
  now = new Date()
try {
  await db.transaction(async (tx) => {
    await tx
      .delete(sessions)
      .where(or(lt(sessions.expiresAt, now), lt(sessions.idleAt, now)))
    await tx.delete(rateLimits).where(lt(rateLimits.expiresAt, now))
    await tx.delete(authChallenges).where(lt(authChallenges.expiresAt, now))
    const jobs = await tx
      .select()
      .from(outbox)
      .where(
        and(
          eq(outbox.status, 'pending'),
          lt(outbox.availableAt, now),
          or(isNull(outbox.leaseUntil), lt(outbox.leaseUntil, now)),
        ),
      )
      .limit(100)
      .for('update', { skipLocked: true })
    for (const job of jobs) {
      await tx
        .update(outbox)
        .set({
          leaseOwner: owner,
          leaseUntil: new Date(Date.now() + 60000),
          attempts: job.attempts + 1,
        })
        .where(eq(outbox.id, job.id))
      if (job.type === 'publication_changed') {
        /* Public reads have no cache; the DB pointer is the sole publication source. */ await tx
          .update(outbox)
          .set({ status: 'completed', leaseUntil: null })
          .where(eq(outbox.id, job.id))
      } else {
        await tx
          .update(outbox)
          .set({ status: 'dead_letter', leaseUntil: null })
          .where(eq(outbox.id, job.id))
      }
    }
  })
  console.log(
    'Maintenance completed; expired access removed and publication notifications settled.',
  )
} finally {
  await closeDatabase()
}
