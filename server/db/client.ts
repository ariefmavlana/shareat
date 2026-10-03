import { createPool } from 'mysql2/promise'
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2'
import * as schema from './schema'
let pool: ReturnType<typeof createPool> | undefined
let db: MySql2Database<typeof schema> | undefined
export function database(url?: string): MySql2Database<typeof schema> {
  if (db) return db
  const uri = url ?? process.env.NUXT_DATABASE_URL
  if (!uri) throw new Error('Database belum dikonfigurasi')
  pool = createPool({
    uri,
    connectionLimit: 5,
    waitForConnections: true,
    queueLimit: 50,
    timezone: 'Z',
    connectTimeout: 10000,
    ssl:
      process.env.NUXT_DATABASE_TLS === 'true'
        ? {
            rejectUnauthorized: true,
            ca: process.env.NUXT_DATABASE_CA || undefined,
          }
        : undefined,
  })
  db = drizzle(pool, { schema, mode: 'default' })
  return db
}
export async function closeDatabase() {
  await pool?.end()
  db = undefined
  pool = undefined
}
