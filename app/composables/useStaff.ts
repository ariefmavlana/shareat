import { ofetch } from 'ofetch'
import type { Actor } from '~~/shared/contracts/content'
interface StaffSession {
  user: Actor & { email: string }
  csrf: string
}
export function useStaff() {
  const session = useState<StaffSession | null>('staff-session', () => null)
  async function load() {
    session.value = await useRequestFetch()<StaffSession>('/api/v1/auth/me')
    return session.value
  }
  async function mutate<T>(
    url: string,
    method: 'POST' | 'PUT',
    body?: unknown,
  ): Promise<T> {
    if (!session.value) await load()
    return ofetch<T>(url, {
      method,
      body: body as Record<string, unknown>,
      headers: { 'x-csrf-token': session.value!.csrf },
    })
  }
  return { session, load, mutate }
}
export function staffError(error: unknown) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = error.data as { statusMessage?: string }
    if (data?.statusMessage) return data.statusMessage
  }
  return 'Permintaan belum berhasil. Periksa data lalu coba lagi.'
}
