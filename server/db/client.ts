import { Pool } from 'pg'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { postgresPoolConfig } from './config'
import * as schema from './schema'
let pool: Pool | undefined
let db: NodePgDatabase<typeof schema> | undefined
export function database(url?: string): NodePgDatabase<typeof schema> {
  if (db) return db
  const uri = url ?? process.env.NUXT_DATABASE_URL
  if (!uri) throw new Error('Database belum dikonfigurasi')
  pool = new Pool(postgresPoolConfig(uri))
  pool.on('error', () =>
    console.error(
      JSON.stringify({ level: 'error', event: 'database_pool_error' }),
    ),
  )
  db = drizzle(pool, { schema })
  return db
}
export async function closeDatabase() {
  await pool?.end()
  db = undefined
  pool = undefined
}
