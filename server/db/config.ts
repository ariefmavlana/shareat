import type { PoolConfig } from 'pg'
export function postgresPoolConfig(
  uri: string,
  env: NodeJS.ProcessEnv = process.env,
): PoolConfig {
  const parsed = new URL(uri)
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol))
    throw new Error('Database harus menggunakan PostgreSQL')
  if (
    [...parsed.searchParams.keys()].some((key) =>
      key.toLowerCase().startsWith('ssl'),
    )
  )
    throw new Error('Atur TLS melalui environment, bukan parameter URI')
  const local = ['localhost', '127.0.0.1', '[::1]', 'postgres'].includes(
    parsed.hostname,
  )
  const tls = env.NUXT_DATABASE_TLS === 'true'
  if ((!local || env.NUXT_APP_MODE === 'production') && !tls)
    throw new Error('Koneksi PostgreSQL memerlukan TLS terverifikasi')
  return {
    connectionString: uri,
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    statement_timeout: 15000,
    lock_timeout: 10000,
    idle_in_transaction_session_timeout: 30000,
    application_name: 'shareat-r1',
    options: '-c timezone=UTC',
    ssl: tls
      ? { rejectUnauthorized: true, ca: env.NUXT_DATABASE_CA || undefined }
      : false,
  }
}
