import { eq } from 'drizzle-orm'
import { api } from '../../../../utils/http'
import { requireAuth } from '../../../../utils/auth'
import { database } from '../../../../db/client'
import { assets, users } from '../../../../db/schema'
import { assetUsage } from '../../../../modules/media/service'

const columns = {
  id: assets.id,
  mime: assets.mime,
  bytes: assets.bytes,
  width: assets.width,
  height: assets.height,
  scanStatus: assets.scanStatus,
  rightsStatus: assets.rightsStatus,
  organizationId: assets.organizationId,
  createdAt: assets.createdAt,
  uploadedByEmail: users.email,
}

export default api(async (event) => {
  const actor = await requireAuth(event)
  const fullRead = actor.roles.some((r) =>
    ['admin', 'editor', 'reviewer', 'auditor'].includes(r),
  )
  const rows = await database()
    .select(columns)
    .from(assets)
    .leftJoin(users, eq(users.id, assets.uploadedBy))
    .where(
      fullRead ? undefined : eq(assets.organizationId, actor.organizationId),
    )
    .limit(200)
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      usedBy: fullRead ? await assetUsage(row.id) : [],
    })),
  )
})
