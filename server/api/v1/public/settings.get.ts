import { api } from '../../../utils/http'
import { publicSettings } from '../../../modules/contact/service'
export default api(async () => publicSettings())
