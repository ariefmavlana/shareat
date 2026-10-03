import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  createCipheriv,
  createDecipheriv,
} from 'node:crypto'
export const token = () => randomBytes(32).toString('hex')
export const digest = (value: string) =>
  createHash('sha256').update(value).digest('hex')
let activeHashes = 0
async function derive(password: string, salt: string) {
  if (activeHashes >= 2) throw new Error('AUTH_BUSY')
  activeHashes++
  try {
    return await new Promise<Buffer>((resolve, reject) =>
      scryptCallback(
        password,
        salt,
        64,
        { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 },
        (error, key) => (error ? reject(error) : resolve(key)),
      ),
    )
  } finally {
    activeHashes--
  }
}
export async function hashPassword(password: string) {
  const salt = token()
  return `scrypt$${salt}$${(await derive(password, salt)).toString('hex')}`
}
export async function verifyPassword(password: string, encoded: string) {
  const [, salt, hash] = encoded.split('$')
  if (!salt || !hash || hash.length !== 128) return false
  const actual = await derive(password, salt)
  return timingSafeEqual(actual, Buffer.from(hash, 'hex'))
}
function key() {
  const value = process.env.NUXT_ENCRYPTION_KEY ?? ''
  if (!/^[a-f0-9]{64}$/.test(value))
    throw new Error('Encryption key must be 32 bytes of hex')
  return Buffer.from(value, 'hex')
}
export function encrypt(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return [
    iv.toString('hex'),
    cipher.getAuthTag().toString('hex'),
    data.toString('hex'),
  ].join('.')
}
export function decrypt(value: string) {
  const [iv, tag, data] = value.split('.')
  if (!iv || !tag || !data) throw new Error('Invalid ciphertext')
  const cipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'hex'))
  cipher.setAuthTag(Buffer.from(tag, 'hex'))
  return Buffer.concat([
    cipher.update(Buffer.from(data, 'hex')),
    cipher.final(),
  ]).toString('utf8')
}
