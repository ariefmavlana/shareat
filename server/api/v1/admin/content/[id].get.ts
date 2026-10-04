import { inArray } from 'drizzle-orm'
import { api } from '../../../../utils/http'
import { requireAuth } from '../../../../utils/auth'
import { contentService } from '../../../../utils/content'
import { database } from '../../../../db/client'
import { users } from '../../../../db/schema'
export default api(async (event) => {
  const actor = await requireAuth(event)
  const id = getRouterParam(event, 'id') ?? ''
  const record = await contentService().privateDetail(actor, id)
  const ids = [
    ...new Set(
      record.revisions.flatMap((r) =>
        [r.authorId, r.reviewerId].filter((x): x is string => Boolean(x)),
      ),
    ),
  ]
  const people = ids.length
    ? await database()
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(inArray(users.id, ids))
    : []
  const emailById = new Map(people.map((p) => [p.id, p.email]))
  return {
    ...record,
    revisions: record.revisions.map((r) => ({
      ...r,
      authorEmail: emailById.get(r.authorId) ?? null,
      reviewerEmail: r.reviewerId
        ? (emailById.get(r.reviewerId) ?? null)
        : null,
    })),
  }
})
