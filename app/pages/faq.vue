<script setup lang="ts">
const { data, error } = await useFetch('/api/v1/public/content', {
  query: { kind: 'faq' },
  key: 'faq-list',
})
if (error.value)
  throw createError({
    statusCode: 503,
    statusMessage: 'Informasi sementara tidak tersedia',
  })
const { data: settings } = await useSiteSettings()
usePublicSeo(
  'Pertanyaan umum',
  'Kenali cara berpartisipasi, status platform, dan kanal kontak Shareat.',
  {
    siteUrl: settings.value?.siteUrl ?? 'http://localhost:3000',
    demo: settings.value?.demo ?? true,
  },
)
</script>
<template>
  <section class="container section">
    <span class="eyebrow">Informasi & bantuan</span>
    <h1 class="text-4xl md:text-6xl">Pertanyaan umum.</h1>
    <p class="mb-12 mt-6 max-w-xl text-lg text-muted-foreground">
      Jawaban singkat untuk membantu kamu mengenal Shareat dan mulai berbagi
      dengan langkah yang jelas.
    </p>
    <div class="max-w-3xl"><FaqList :items="data?.items ?? []" /></div>
    <p class="mb-5 mt-12">Belum menemukan jawaban yang dibutuhkan?</p>
    <ContactButton />
  </section>
</template>
