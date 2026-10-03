import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import { inspectMedia, mediaPath } from '../../server/modules/media/service'
describe('Media quarantine boundaries', () => {
  it('rejects SVG/HTML masquerading as images and path traversal', async () => {
    await expect(
      inspectMedia(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')),
    ).rejects.toMatchObject({ statusCode: 422 })
    expect(() => mediaPath('../../private')).toThrow()
  })
  it('allows a real bounded image and private PDF', async () => {
    const data = await sharp({
      create: { width: 100, height: 80, channels: 3, background: '#ffffff' },
    })
      .png()
      .toBuffer()
    expect(await inspectMedia(data)).toMatchObject({
      mime: 'image/png',
      width: 100,
      height: 80,
    })
    expect(await inspectMedia(Buffer.from('%PDF-1.7 example'))).toMatchObject({
      mime: 'application/pdf',
    })
  })
  it('enforces the upload size ceiling', async () => {
    await expect(
      inspectMedia(Buffer.alloc(11 * 1024 * 1024)),
    ).rejects.toMatchObject({ statusCode: 413 })
  })
})
