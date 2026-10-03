import { canonical, jsonLd } from '~~/shared/contracts/web'
export function usePublicSeo(
  title: MaybeRef<string>,
  description: MaybeRef<string>,
  options: {
    siteUrl: string
    demo: boolean
    noindex?: MaybeRef<boolean>
    article?: boolean
    updatedAt?: string
  },
) {
  const route = useRoute()
  const url = computed(() => {
    const base = canonical(options.siteUrl, route.path)
    if (!['/inisiatif', '/cerita', '/program', '/cari'].includes(route.path))
      return base
    const params = new URLSearchParams()
    for (const key of ['program', 'lokasi', 'status', 'q']) {
      const value = route.query[key]
      if (typeof value === 'string' && value.trim())
        params.set(key, value.trim())
    }
    const page = Number(route.query.page)
    if (Number.isInteger(page) && page > 1 && page <= 500)
      params.set('page', String(page))
    return base + (params.size ? '?' + params.toString() : '')
  })
  const hidden = computed(
    () =>
      options.demo ||
      unref(options.noindex) ||
      route.path.startsWith('/admin') ||
      route.path === '/cari',
  )
  useSeoMeta({
    title: () => unref(title) + ' | Shareat',
    description: () => unref(description),
    ogTitle: () => unref(title),
    ogDescription: () => unref(description),
    ogUrl: () => url.value,
    ogType: options.article ? 'article' : 'website',
    ogLocale: 'id_ID',
    ogImage: canonical(options.siteUrl, '/og-shareat.png'),
    ogImageWidth: 1200,
    ogImageHeight: 630,
    twitterImage: canonical(options.siteUrl, '/og-shareat.png'),
    twitterCard: 'summary_large_image',
    robots: () => (hidden.value ? 'noindex, nofollow' : 'index, follow'),
  })
  useHead(() => ({
    link: [{ rel: 'canonical', href: url.value }],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: jsonLd({
          '@context': 'https://schema.org',
          '@type': options.article ? 'Article' : 'WebPage',
          name: unref(title),
          description: unref(description),
          url: url.value,
          inLanguage: 'id',
          ...(options.updatedAt ? { dateModified: options.updatedAt } : {}),
        }),
      },
    ],
  }))
  return url
}
