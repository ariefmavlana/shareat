import { api } from '../../../../../utils/http'
import { policyVersions } from '../../../../../modules/content/policies'
export default api(async (event) => {
  const versions = await policyVersions(getRouterParam(event, 'slug') ?? '')
  const dto = versions.find((x) => x.id === getRouterParam(event, 'id'))
  if (!dto) throw createError({ statusCode: 404 })
  return dto
})
