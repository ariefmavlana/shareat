import { describe, expect, it } from 'vitest'
import { postgresPoolConfig } from '../../server/db/config'
describe('PostgreSQL configuration', () => {
  it('accepts only PostgreSQL and keeps a bounded connection pool', () => {
    const config = postgresPoolConfig(
      'postgresql://user:password@localhost/shareat',
      {},
    )
    expect(config.max).toBe(5)
    expect(config.connectionTimeoutMillis).toBe(10000)
    expect(config.ssl).toBe(false)
    expect(() =>
      postgresPoolConfig('mysql://user:password@localhost/shareat', {}),
    ).toThrow('PostgreSQL')
  })
  it('requires certificate validation for remote hosts and prevents URI TLS overrides', () => {
    expect(() =>
      postgresPoolConfig('postgres://user:password@remote.example/shareat', {}),
    ).toThrow('TLS')
    expect(() =>
      postgresPoolConfig('postgres://user:password@localhost/shareat', {
        NUXT_APP_MODE: 'production',
      }),
    ).toThrow('TLS')
    const config = postgresPoolConfig(
      'postgres://user:password@remote.example/shareat',
      { NUXT_DATABASE_TLS: 'true' },
    )
    expect(config.ssl).toEqual({ rejectUnauthorized: true, ca: undefined })
    for (const param of [
      'sslmode=disable',
      'sslmode=no-verify',
      'sslrootcert=foo',
      'sslnegotiation=direct',
    ])
      expect(() =>
        postgresPoolConfig(
          'postgres://user:password@remote.example/shareat?' + param,
          { NUXT_DATABASE_TLS: 'true' },
        ),
      ).toThrow('URI')
  })
})
