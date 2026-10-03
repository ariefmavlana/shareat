import { sql } from 'drizzle-orm'
import type { database } from './client'
type Transaction = Parameters<
  Parameters<ReturnType<typeof database>['transaction']>[0]
>[0]
export async function lockContentSlugs(tx: Transaction) {
  // Reserve the namespace before row locks, including routes with no row yet.
  await tx.execute(
    sql`SELECT pg_advisory_xact_lock(hashtext('shareat-content-slug'))`,
  )
}
