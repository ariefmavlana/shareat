import 'dotenv/config'
import { test, expect, request as apiRequest } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { generate } from 'otplib'
import { eq } from 'drizzle-orm'
import { database, closeDatabase } from '../../server/db/client'
import { users, rateLimits } from '../../server/db/schema'
interface Access {
  email: string
  password: string
  totpSecret: string
}
const baseURL = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3001'
let editor: APIRequestContext,
  reviewer: APIRequestContext,
  partner: APIRequestContext
let editorCsrf = '',
  reviewerCsrf = '',
  partnerCsrf = '',
  editorOtp = ''
let credentials: Access[]
let record: { id: string; slug: string; version: number }
const demoBody = {
  title: 'Inisiatif uji publikasi',
  summary:
    'Data demo untuk membuktikan snapshot, izin, dan publikasi yang atomik.',
  paragraphs: ['Contoh pengujian editorial; bukan kegiatan nyata.'],
  programSlug: 'share-eat',
  responsible: 'Tim demo pengujian',
  activityStatus: 'planning',
  demo: true,
}
async function login(email: string) {
  const context = await apiRequest.newContext({ baseURL })
  const access = credentials.find((x) => x.email === email)!
  const usedOtp = await generate({ secret: access.totpSecret })
  const response = await context.post('/api/v1/auth/login', {
    headers: { origin: baseURL },
    data: {
      email: access.email,
      password: access.password,
      totp: usedOtp,
    },
  })
  expect(response.status()).toBe(200)
  return { context, csrf: (await response.json()).csrf as string, usedOtp }
}
test.describe
  .serial('CMS with real PostgreSQL, MFA and separate identities', () => {
  test.beforeAll(async () => {
    if (
      process.env.NUXT_APP_MODE !== 'demo' ||
      !['127.0.0.1', 'localhost'].includes(new URL(baseURL).hostname)
    )
      throw new Error('Tests require isolated local demo')
    credentials = JSON.parse(await readFile('.data/demo-access.json', 'utf8'))
    for (const access of credentials)
      await database()
        .update(users)
        .set({ lastTotpStep: 0 })
        .where(eq(users.email, access.email))
    await database().delete(rateLimits)
    const a = await login('editor@shareat.example'),
      b = await login('reviewer@shareat.example'),
      c = await login('mitra@shareat.example')
    editor = a.context
    editorCsrf = a.csrf
    editorOtp = a.usedOtp
    reviewer = b.context
    reviewerCsrf = b.csrf
    partner = c.context
    partnerCsrf = c.csrf
  })
  test.afterAll(async () => {
    await editor?.dispose()
    await reviewer?.dispose()
    await partner?.dispose()
    await closeDatabase()
  })
  test('auth rejects replay, CSRF, and unknown financial fields', async () => {
    const access = credentials.find(
      (x) => x.email === 'editor@shareat.example',
    )!
    const replay = await editor.post('/api/v1/auth/login', {
      headers: { origin: baseURL },
      data: {
        email: access.email,
        password: access.password,
        totp: editorOtp,
      },
    })
    expect(replay.status()).toBe(401)
    expect(
      (
        await editor.post('/api/v1/admin/content', {
          headers: { origin: baseURL },
          data: { kind: 'initiative', body: demoBody },
        })
      ).status(),
    ).toBe(403)
    expect(
      (
        await editor.post('/api/v1/admin/content', {
          headers: {
            origin: 'https://evil.example',
            'x-csrf-token': editorCsrf,
          },
          data: { kind: 'initiative', body: demoBody },
        })
      ).status(),
    ).toBe(403)
    expect(
      (
        await editor.post('/api/v1/admin/content', {
          headers: { origin: baseURL, 'x-csrf-token': editorCsrf },
          data: {
            kind: 'initiative',
            body: { ...demoBody, targetIdr: 100000 },
          },
        })
      ).status(),
    ).toBe(422)
  })
  test('CMS SQL pagination bounds pages and scopes partners', async () => {
    const response = await editor.get('/api/v1/admin/content')
    expect(response.status()).toBe(200)
    const result = await response.json()
    expect(result.items.length).toBeLessThanOrEqual(20)
    expect(result.total).toBeGreaterThan(17)
    expect(
      (await editor.get('/api/v1/admin/content?page=10000')).status(),
    ).toBe(404)
    expect((await editor.get('/api/v1/admin/content?page=0')).status()).toBe(
      422,
    )
    const scoped = await (await partner.get('/api/v1/admin/content')).json()
    expect(
      scoped.items.every((r: { kind: string }) => r.kind === 'initiative'),
    ).toBe(true)
  })
  test('unique slugs and reserved page routes cannot create misleading public URLs', async () => {
    const headers = { origin: baseURL, 'x-csrf-token': editorCsrf }
    expect(
      (
        await editor.post('/api/v1/admin/content', {
          headers,
          data: { kind: 'program', slug: 'share-eat', body: demoBody },
        })
      ).status(),
    ).toBe(409)
    expect(
      (
        await editor.post('/api/v1/admin/content', {
          headers,
          data: { kind: 'page', slug: 'admin', body: demoBody },
        })
      ).status(),
    ).toBe(422)
  })
  test('draft privacy, organization isolation, review, snapshot, and version conflict', async () => {
    const headers = { origin: baseURL, 'x-csrf-token': editorCsrf }
    const created = await editor.post('/api/v1/admin/content', {
      headers,
      data: { kind: 'initiative', body: demoBody },
    })
    expect(created.status()).toBe(200)
    record = await created.json()
    expect(
      (await partner.get('/api/v1/admin/content/' + record.id)).status(),
    ).toBe(403)
    expect(
      (await editor.get('/api/v1/public/initiative/' + record.slug)).status(),
    ).toBe(404)
    expect(
      (
        await editor.post(
          '/api/v1/admin/content/' + record.id + '/transition',
          { headers, data: { version: 1, action: 'submit' } },
        )
      ).status(),
    ).toBe(200)
    expect(
      (
        await editor.put('/api/v1/admin/content/' + record.id, {
          headers,
          data: { version: 1, body: demoBody },
        })
      ).status(),
    ).toBe(409)
    const checks = {
        claims: true,
        media: true,
        privacy: true,
        seo: true,
        contact: true,
      },
      reviewHeaders = { origin: baseURL, 'x-csrf-token': reviewerCsrf }
    expect(
      (
        await reviewer.post(
          '/api/v1/admin/content/' + record.id + '/transition',
          {
            headers: reviewHeaders,
            data: {
              version: 2,
              action: 'review',
              checklist: { ...checks, privacy: false },
            },
          },
        )
      ).status(),
    ).toBe(422)
    expect(
      (
        await reviewer.post(
          '/api/v1/admin/content/' + record.id + '/transition',
          {
            headers: reviewHeaders,
            data: { version: 2, action: 'review', checklist: checks },
          },
        )
      ).status(),
    ).toBe(200)
    expect(
      (
        await reviewer.post(
          '/api/v1/admin/content/' + record.id + '/transition',
          { headers: reviewHeaders, data: { version: 3, action: 'publish' } },
        )
      ).status(),
    ).toBe(200)
    expect(
      (await editor.get('/api/v1/public/initiative/' + record.slug)).status(),
    ).toBe(200)
    expect(
      (
        await editor.put('/api/v1/admin/content/' + record.id, {
          headers,
          data: {
            version: 4,
            body: { ...demoBody, title: 'Draft yang tidak boleh bocor' },
          },
        })
      ).status(),
    ).toBe(200)
    const dto = await (
      await editor.get('/api/v1/public/initiative/' + record.slug)
    ).json()
    expect(dto.title).toBe(demoBody.title)
    expect(
      (
        await reviewer.post(
          '/api/v1/admin/content/' + record.id + '/transition',
          {
            headers: reviewHeaders,
            data: {
              version: 5,
              action: 'archive',
              reason: 'Penarikan data pengujian',
            },
          },
        )
      ).status(),
    ).toBe(200)
    expect(
      (await editor.get('/api/v1/public/initiative/' + record.slug)).status(),
    ).toBe(410)
    expect((await editor.get('/inisiatif/' + record.slug)).status()).toBe(410)
  })
  test('contact approval requires different identities; raw media remains quarantined', async () => {
    const headers = { origin: baseURL, 'x-csrf-token': editorCsrf }
    const settings = await (await editor.get('/api/v1/public/settings')).json()
    const proposed = await editor.post('/api/v1/admin/settings/contact', {
      headers,
      data: { ...settings.contact, ownershipVerified: true },
    })
    expect(proposed.status()).toBe(200)
    const change = await proposed.json()
    expect(
      (
        await editor.post('/api/v1/admin/settings/' + change.id + '/approve', {
          headers,
        })
      ).status(),
    ).toBe(403)
    expect(
      (
        await reviewer.post(
          '/api/v1/admin/settings/' + change.id + '/approve',
          { headers: { origin: baseURL, 'x-csrf-token': reviewerCsrf } },
        )
      ).status(),
    ).toBe(200)
    expect(
      (
        await partner.post('/api/v1/admin/settings/contact', {
          headers: { origin: baseURL, 'x-csrf-token': partnerCsrf },
          data: { ...settings.contact, ownershipVerified: true },
        })
      ).status(),
    ).toBe(403)
    expect(
      (
        await editor.post('/api/v1/admin/media', {
          headers: { ...headers, 'content-type': 'application/octet-stream' },
          data: Buffer.from('<svg/>'),
        })
      ).status(),
    ).toBe(422)
    const upload = await editor.post('/api/v1/admin/media', {
      headers: { ...headers, 'content-type': 'application/octet-stream' },
      data: Buffer.from('%PDF-1.7 demo'),
    })
    expect(upload.status()).toBe(200)
    const asset = await upload.json()
    expect(asset.scanStatus).toBe('quarantine')
    expect(
      (
        await editor.get('/api/v1/admin/media/' + asset.id + '/download')
      ).status(),
    ).toBe(404)
  })
  test('partner verification, private invitation, activation and suspension are enforced', async () => {
    const headers = { origin: baseURL, 'x-csrf-token': editorCsrf },
      checkHeaders = { origin: baseURL, 'x-csrf-token': reviewerCsrf }
    const team = await (await editor.get('/api/v1/admin/team')).json()
    const existingPartner = team.organizations.find(
      (o: { type: string }) => o.type === 'partner',
    )
    expect(
      (
        await editor.post('/api/v1/admin/team/invite', {
          headers,
          data: {
            email: 'invalid-role@shareat.example',
            organizationId: existingPartner.id,
            roles: ['reviewer'],
          },
        })
      ).status(),
    ).toBe(422)
    const suffix = Date.now().toString()
    const proposal = await editor.post('/api/v1/admin/team/organization', {
      headers,
      data: {
        name: 'Mitra pengujian ' + suffix,
        slug: 'e2e-' + suffix,
        evidence:
          'Contoh bukti untuk pengujian; bukan verifikasi organisasi nyata.',
      },
    })
    expect(proposal.status()).toBe(200)
    const change = await proposal.json()
    expect(
      (
        await editor.post('/api/v1/admin/settings/' + change.id + '/approve', {
          headers,
        })
      ).status(),
    ).toBe(403)
    expect(
      (
        await reviewer.post(
          '/api/v1/admin/settings/' + change.id + '/approve',
          { headers: checkHeaders },
        )
      ).status(),
    ).toBe(200)
    const orgs = await (await editor.get('/api/v1/admin/team')).json()
    const org = orgs.organizations.find(
      (o: { slug: string }) => o.slug === 'e2e-' + suffix,
    )
    const invited = await editor.post('/api/v1/admin/team/invite', {
      headers,
      data: {
        email: 'e2e-' + suffix + '@shareat.example',
        organizationId: org.id,
        roles: ['partner_editor'],
      },
    })
    expect(invited.status()).toBe(200)
    const invite = await invited.json()
    const guest = await apiRequest.newContext({ baseURL })
    expect((await guest.get('/api/v1/auth/me')).status()).toBe(401)
    const enrolled = await guest.post('/api/v1/auth/enroll', {
      headers: { origin: baseURL },
      data: { token: invite.token, password: 'only-for-local-tests-123' },
    })
    expect(enrolled.status()).toBe(200)
    const enrollment = await enrolled.json()
    const activated = await guest.post('/api/v1/auth/activate', {
      headers: { origin: baseURL },
      data: {
        token: invite.token,
        totp: await generate({ secret: enrollment.secret }),
      },
    })
    expect(activated.status()).toBe(200)
    expect(
      (
        await guest.post('/api/v1/auth/activate', {
          headers: { origin: baseURL },
          data: {
            token: invite.token,
            totp: await generate({ secret: enrollment.secret }),
          },
        })
      ).status(),
    ).toBe(400)
    const loginResult = await guest.post('/api/v1/auth/login', {
      headers: { origin: baseURL },
      data: {
        email: 'e2e-' + suffix + '@shareat.example',
        password: 'only-for-local-tests-123',
        totp: await generate({
          secret: enrollment.secret,
          epoch: Math.floor(Date.now() / 1000) + 30,
        }),
      },
    })
    expect(loginResult.status()).toBe(200)
    expect(
      (await guest.get('/api/v1/admin/content/' + record.id)).status(),
    ).toBe(403)
    expect(
      (
        await editor.post('/api/v1/admin/team/suspend', {
          headers,
          data: {
            type: 'organization',
            id: org.id,
            reason: 'Penutupan fixture pengujian',
          },
        })
      ).status(),
    ).toBe(200)
    expect((await guest.get('/api/v1/auth/me')).status()).toBe(401)
    await guest.dispose()
  })
  test('slug changes keep one-hop redirects and concurrent writes cannot overwrite', async () => {
    const editorHeaders = { origin: baseURL, 'x-csrf-token': editorCsrf },
      reviewerHeaders = { origin: baseURL, 'x-csrf-token': reviewerCsrf }
    const response = await editor.post('/api/v1/admin/content', {
      headers: editorHeaders,
      data: { kind: 'initiative', body: demoBody },
    })
    expect(response.status()).toBe(200)
    const draft = await response.json()
    const attempts = await Promise.all([
      editor.put('/api/v1/admin/content/' + draft.id, {
        headers: editorHeaders,
        data: { version: 1, body: { ...demoBody, title: 'Concurrent A' } },
      }),
      editor.put('/api/v1/admin/content/' + draft.id, {
        headers: editorHeaders,
        data: { version: 1, body: { ...demoBody, title: 'Concurrent B' } },
      }),
    ])
    expect(attempts.map((r) => r.status()).sort()).toEqual([200, 409])
    const slug = 'e2e-rename-' + Date.now()
    expect(
      (
        await reviewer.post('/api/v1/admin/content/' + draft.id + '/slug', {
          headers: reviewerHeaders,
          data: { version: 2, slug, reason: 'Contoh koreksi URL' },
        })
      ).status(),
    ).toBe(200)
    const alias = await editor.get('/inisiatif/' + draft.slug, {
      maxRedirects: 0,
    })
    expect(alias.status()).toBe(301)
    expect(alias.headers().location).toBe('/inisiatif/' + slug)
    expect(
      (
        await reviewer.post('/api/v1/admin/content/' + draft.id + '/slug', {
          headers: reviewerHeaders,
          data: {
            version: 3,
            slug: slug + '-baru',
            reason: 'Contoh koreksi URL kedua',
          },
        })
      ).status(),
    ).toBe(200)
    const original = await editor.get('/inisiatif/' + draft.slug, {
      maxRedirects: 0,
    })
    expect(original.status()).toBe(301)
    expect(original.headers().location).toBe('/inisiatif/' + slug + '-baru')
  })
  test('supervised recovery requires independent operators and revokes access before enrollment', async () => {
    const headers = { origin: baseURL, 'x-csrf-token': editorCsrf },
      reviewHeaders = { origin: baseURL, 'x-csrf-token': reviewerCsrf }
    const team = await (await editor.get('/api/v1/admin/team')).json()
    const organization = team.organizations.find(
      (o: { type: string }) => o.type === 'team',
    )
    const email = 'recovery-' + Date.now() + '@shareat.example'
    const invited = await editor.post('/api/v1/admin/team/invite', {
      headers,
      data: { email, organizationId: organization.id, roles: ['editor'] },
    })
    expect(invited.status()).toBe(200)
    const invite = await invited.json()
    const guest = await apiRequest.newContext({ baseURL })
    const enrollment = await (
      await guest.post('/api/v1/auth/enroll', {
        headers: { origin: baseURL },
        data: { token: invite.token, password: 'initial-local-password-123' },
      })
    ).json()
    expect(
      (
        await guest.post('/api/v1/auth/activate', {
          headers: { origin: baseURL },
          data: {
            token: invite.token,
            totp: await generate({ secret: enrollment.secret }),
          },
        })
      ).status(),
    ).toBe(200)
    expect(
      (
        await guest.post('/api/v1/auth/login', {
          headers: { origin: baseURL },
          data: {
            email,
            password: 'initial-local-password-123',
            totp: await generate({
              secret: enrollment.secret,
              epoch: Math.floor(Date.now() / 1000) + 30,
            }),
          },
        })
      ).status(),
    ).toBe(200)
    const people = await (await editor.get('/api/v1/admin/team')).json()
    const user = people.users.find((u: { email: string }) => u.email === email)
    const proposal = await editor.post('/api/v1/admin/team/recovery', {
      headers,
      data: {
        userId: user.id,
        reason:
          'Vérifikasi identitas contoh dan kehilangan perangkat authenticator.',
      },
    })
    expect(proposal.status()).toBe(200)
    const change = await proposal.json()
    expect(
      (
        await editor.post('/api/v1/admin/settings/' + change.id + '/approve', {
          headers,
        })
      ).status(),
    ).toBe(403)
    const approved = await reviewer.post(
      '/api/v1/admin/settings/' + change.id + '/approve',
      { headers: reviewHeaders },
    )
    expect(approved.status()).toBe(200)
    const recovery = await approved.json()
    expect(recovery.recoveryToken).toMatch(/^[a-f0-9]{64}$/)
    expect((await guest.get('/api/v1/auth/me')).status()).toBe(401)
    const enrolled = await guest.post('/api/v1/auth/enroll', {
      headers: { origin: baseURL },
      data: {
        token: recovery.recoveryToken,
        password: 'replacement-local-password-456',
      },
    })
    expect(enrolled.status()).toBe(200)
    const replacement = await enrolled.json()
    expect(
      (
        await guest.post('/api/v1/auth/activate', {
          headers: { origin: baseURL },
          data: {
            token: recovery.recoveryToken,
            totp: await generate({ secret: replacement.secret }),
          },
        })
      ).status(),
    ).toBe(200)
    expect((await guest.get('/api/v1/auth/me')).status()).toBe(401)
    await guest.dispose()
  })
  test('CMS renders scoped lists and private editor without runtime errors', async ({
    page,
  }) => {
    await page.context().addCookies((await editor.storageState()).cookies)
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    await page.goto('/admin')
    await expect(
      page.getByRole('heading', { name: 'Kelola ruang berbagi.' }),
    ).toBeVisible()
    await page.goto('/admin/content/' + record.id)
    await expect(
      page.getByRole('heading', {
        name: 'Draft yang tidak boleh bocor',
        exact: true,
      }),
    ).toBeVisible()
    expect(errors).toEqual([])
  })
})
