import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2026-10-03',
  modules: ['shadcn-nuxt', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  shadcn: { prefix: 'Ui', componentDir: './app/components/ui' },
  vite: { plugins: [tailwindcss()] },
  typescript: { strict: true },
  devtools: { enabled: false },
  runtimeConfig: {
    databaseUrl: '',
    encryptionKey: '',
    appMode: 'demo',
    siteUrl: 'http://localhost:3000',
    proxyTrusted: false,
    mediaRoot: '.data/media',
    scannerCommand: '',
    public: { siteName: 'Shareat' },
  },
  nitro: { preset: 'node-server' },
  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'Shareat — Ruang untuk berbagi',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  routeRules: {
    '/admin/**': {
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
    '/api/**': { headers: { 'Cache-Control': 'no-store' } },
  },
})
