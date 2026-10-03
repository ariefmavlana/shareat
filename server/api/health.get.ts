import { api } from '../utils/http'
import { database } from '../db/client'
import { sql } from 'drizzle-orm'
export default api(async () => {
  await database().execute(sql`SELECT 1`)
  return { status: 'ok', release: 'R1' }
})
