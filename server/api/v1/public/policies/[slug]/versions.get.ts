import { api } from '../../../../../utils/http'
import { policyVersions } from '../../../../../modules/content/policies'
export default api(async (event) =>
  (await policyVersions(getRouterParam(event, 'slug') ?? '')).map((x) => ({
    id: x.id,
    title: x.title,
    effectiveDate: x.effectiveDate,
    updatedAt: x.updatedAt,
  })),
)
