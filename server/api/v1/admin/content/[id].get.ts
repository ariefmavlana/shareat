import { api } from '../../../../utils/http'
import { requireAuth } from '../../../../utils/auth'
import { contentService } from '../../../../utils/content'
export default api(async (event) =>
  contentService().privateDetail(
    await requireAuth(event),
    getRouterParam(event, 'id') ?? '',
  ),
)
