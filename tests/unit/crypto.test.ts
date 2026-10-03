import { describe, it, expect } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  encrypt,
  decrypt,
  digest,
} from '../../server/modules/identity/crypto'
describe('Identity primitives', () => {
  it('hashes passwords with independent salts and rejects a wrong password', async () => {
    const a = await hashPassword('a-long-test-password')
    const b = await hashPassword('a-long-test-password')
    expect(a).not.toBe(b)
    expect(await verifyPassword('a-long-test-password', a)).toBe(true)
    expect(await verifyPassword('wrong', a)).toBe(false)
  })
  it('authenticates encrypted MFA secrets and detects tampering', () => {
    process.env.NUXT_ENCRYPTION_KEY = 'ab'.repeat(32)
    const c = encrypt('not-a-real-secret')
    expect(decrypt(c)).toBe('not-a-real-secret')
    expect(() => decrypt(c.slice(0, -2) + 'ff')).toThrow()
    expect(digest('session-token')).not.toContain('session-token')
  })
})
