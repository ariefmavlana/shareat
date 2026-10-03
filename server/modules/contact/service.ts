import { eq } from 'drizzle-orm'
import { database } from '../../db/client'
import { settings } from '../../db/schema'
import { contactSchema } from '../../../shared/contracts/web'
export async function publicSettings() {
  const [row] = await database()
    .select()
    .from(settings)
    .where(eq(settings.key, 'contact'))
  const config = contactSchema.safeParse(row?.value)
  const production = process.env.NUXT_APP_MODE === 'production'
  if (production && config.success && /contoh|demo/i.test(config.data.hours))
    return {
      name: 'Shareat',
      demo: false,
      siteUrl: process.env.NUXT_SITE_URL ?? '',
      contact: null,
    }
  return {
    name: 'Shareat',
    demo: process.env.NUXT_APP_MODE !== 'production',
    siteUrl: process.env.NUXT_SITE_URL ?? 'http://localhost:3000',
    contact: config.success
      ? { phone: config.data.phone, hours: config.data.hours }
      : null,
  }
}
