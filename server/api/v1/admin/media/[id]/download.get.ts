import { api } from '../../../../../utils/http'
import { requireAuth } from '../../../../../utils/auth'
import { privateDownload } from '../../../../../modules/media/service'
export default api(async (event) => {
  const result = await privateDownload(
    await requireAuth(event),
    getRouterParam(event, 'id') ?? '',
  )
  setHeader(event, 'Content-Type', result.mime)
  setHeader(
    event,
    'Content-Disposition',
    'attachment; filename="private-evidence"',
  )
  return result.data
})
