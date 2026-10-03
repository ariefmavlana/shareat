import 'dotenv/config'
import { z } from 'zod'
import { stat, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
const path = process.env.BACKUP_MANIFEST_PATH
if (!path)
  throw new Error(
    'Set BACKUP_MANIFEST_PATH to the verified offsite backup manifest',
  )
const manifest = z
  .object({
    createdAt: z.iso.datetime(),
    files: z
      .array(
        z.object({
          path: z.string().min(1),
          sha256: z.string().regex(/^[a-f0-9]{64}$/),
        }),
      )
      .min(1),
    offsiteVerified: z.literal(true),
  })
  .strict()
  .parse(JSON.parse(await readFile(path, 'utf8')))
if (
  new Date(manifest.createdAt).getTime() > Date.now() + 60000 ||
  Date.now() - new Date(manifest.createdAt).getTime() > 24 * 3600000 ||
  !manifest.files.length
)
  throw new Error('Backup missing, stale, or offsite copy unverified')
for (const file of manifest.files) {
  await stat(file.path)
  if (
    createHash('sha256')
      .update(await readFile(file.path))
      .digest('hex') !== file.sha256
  )
    throw new Error('Backup checksum mismatch')
}
console.log(
  'Backup freshness and manifest integrity passed. Restore timing must be tested separately.',
)
