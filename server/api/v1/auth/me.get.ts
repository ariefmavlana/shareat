import { api } from '../../../utils/http'
import { authentication } from '../../../utils/auth'
import { digest } from '../../../modules/identity/crypto'
export default api(async (event) => {
  const auth = await authentication(event)
  const csrf = getCookie(event, 'shareat_csrf') ?? ''
  return {
    user: { ...auth.actor, email: auth.email },
    csrf: digest(csrf) === auth.session.csrfHash ? csrf : '',
  }
})
