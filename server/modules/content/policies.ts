import { createError } from 'h3'
import { mysqlContentRepository } from './mysql-repository'
import { publicDto } from './service'
export async function policyVersions(slug: string) {
  if (!['privasi', 'ketentuan'].includes(slug))
    throw createError({ statusCode: 404 })
  const record = await mysqlContentRepository().bySlug('page', slug)
  if (!record || record.archived || !record.everPublished)
    throw createError({ statusCode: 404 })
  return record.revisions
    .filter((r) => r.status === 'published')
    .map((r) => {
      const dto = publicDto({ ...record, publishedRevisionId: r.id })
      return dto ? { ...dto, id: r.id } : null
    })
    .filter((x) => x !== null)
}
