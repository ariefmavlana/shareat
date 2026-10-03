import { and, eq, or, sql } from 'drizzle-orm'
import type { database } from '../../db/client'
import { authChallenges } from '../../db/schema'

type Transaction = Parameters<
  Parameters<ReturnType<typeof database>['transaction']>[0]
>[0]

// The caller must hold lockIdentityLifecycle until its transaction commits.
export async function revokeUserChallenges(
  tx: Transaction,
  userId: string,
  email: string,
) {
  await tx
    .update(authChallenges)
    .set({ consumed: true, payload: {} })
    .where(
      and(
        eq(authChallenges.consumed, false),
        or(
          sql`${authChallenges.payload}->>'userId' = ${userId}`,
          sql`${authChallenges.payload}->>'email' = ${email}`,
        ),
      ),
    )
}
export async function revokeOrganizationChallenges(
  tx: Transaction,
  organizationId: string,
) {
  await tx
    .update(authChallenges)
    .set({ consumed: true, payload: {} })
    .where(
      and(
        eq(authChallenges.consumed, false),
        sql`${authChallenges.payload}->>'organizationId' = ${organizationId}`,
      ),
    )
}
