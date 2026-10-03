import { createHash, randomUUID } from 'node:crypto'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import sharp from 'sharp'
import { createError } from 'h3'
import { eq } from 'drizzle-orm'
import { database } from '../../db/client'
import { assets, auditLogs } from '../../db/schema'
import type { Actor } from '../../../shared/contracts/content'
const execute = promisify(execFile)
export function mediaPath(key: string) {
  if (!/^[a-f0-9-]{36}(?:-(?:400|800|1200|1600)\.webp)?$/.test(key))
    throw createError({ statusCode: 422 })
  const root = resolve(process.env.NUXT_MEDIA_ROOT ?? '.data/media')
  return resolve(root, key)
}
export async function inspectMedia(data: Buffer) {
  if (data.length > 10 * 1024 * 1024)
    throw createError({
      statusCode: 413,
      statusMessage: 'Berkas terlalu besar',
    })
  const pdf = data.subarray(0, 5).toString() === '%PDF-'
  if (pdf) return { mime: 'application/pdf', width: null, height: null }
  if (data.length > 8 * 1024 * 1024)
    throw createError({
      statusCode: 413,
      statusMessage: 'Gambar maksimum 8 MB',
    })
  const metadata = await sharp(data, { limitInputPixels: 24000000 })
    .metadata()
    .catch(() => null)
  if (
    !metadata ||
    !['jpeg', 'png', 'webp'].includes(metadata.format ?? '') ||
    !metadata.width ||
    !metadata.height
  )
    throw createError({
      statusCode: 422,
      statusMessage: 'Hanya JPEG, PNG, WebP, atau PDF privat yang diterima',
    })
  if (metadata.pages && metadata.pages > 1)
    throw createError({
      statusCode: 422,
      statusMessage: 'Gambar animasi tidak didukung',
    })
  return {
    mime: 'image/' + (metadata.format === 'jpeg' ? 'jpeg' : metadata.format),
    width: metadata.width,
    height: metadata.height,
  }
}
export async function upload(actor: Actor, data: Buffer) {
  if (
    !actor.verified ||
    !actor.roles.some((r) =>
      ['editor', 'partner_editor', 'reviewer'].includes(r),
    )
  )
    throw createError({ statusCode: 403 })
  const meta = await inspectMedia(data),
    id = randomUUID(),
    key = id
  await mkdir(resolve(process.env.NUXT_MEDIA_ROOT ?? '.data/media'), {
    recursive: true,
  })
  await writeFile(mediaPath(key), data, { mode: 0o600 })
  let scanStatus = 'quarantine'
  if (process.env.NUXT_SCANNER_COMMAND) {
    try {
      await execute(process.env.NUXT_SCANNER_COMMAND, [mediaPath(key)], {
        timeout: 30000,
      })
      scanStatus = 'clean'
    } catch {
      scanStatus = 'blocked'
    }
  }
  if (scanStatus === 'clean' && meta.mime !== 'application/pdf')
    for (const width of [400, 800, 1200, 1600])
      await sharp(data, { limitInputPixels: 24000000 })
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(mediaPath(`${id}-${width}.webp`))
  await database().transaction(async (tx) => {
    await tx.insert(assets).values({
      id,
      organizationId: actor.organizationId,
      key,
      ...meta,
      bytes: data.length,
      sha256: createHash('sha256').update(data).digest('hex'),
      scanStatus,
      uploadedBy: actor.id,
      createdAt: new Date(),
    })
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorId: actor.id,
      action: 'media.upload',
      targetId: id,
      requestId: actor.requestId ?? randomUUID(),
      safeChange: { mime: meta.mime, bytes: data.length, scanStatus },
      createdAt: new Date(),
    })
  })
  return { id, scanStatus }
}
export async function privateDownload(actor: Actor, id: string) {
  const [asset] = await database()
    .select()
    .from(assets)
    .where(eq(assets.id, id))
  if (!asset || asset.scanStatus !== 'clean')
    throw createError({
      statusCode: 404,
      statusMessage: 'Berkas belum tersedia',
    })
  if (
    asset.organizationId !== actor.organizationId &&
    !actor.roles.some((r) => ['reviewer', 'admin', 'auditor'].includes(r))
  )
    throw createError({ statusCode: 403 })
  await database()
    .insert(auditLogs)
    .values({
      id: randomUUID(),
      actorId: actor.id,
      action: 'media.private_download',
      targetId: id,
      requestId: actor.requestId ?? randomUUID(),
      safeChange: {},
      createdAt: new Date(),
    })
  return { data: await readFile(mediaPath(asset.key)), mime: asset.mime }
}
