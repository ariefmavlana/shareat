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
  <div>
    <PageIntro
      title="Lebih jelas, lebih mudah."
      description="Jawaban untuk membantu kamu mengenal Shareat dan mulai berbagi dengan langkah yang jelas."
      eyebrow="Pertanyaan umum"
      current="FAQ"
    />
    <section
      class="container section grid items-start gap-10 lg:grid-cols-[.75fr_1.5fr]"
    >
      <aside class="surface p-6 lg:sticky lg:top-28">
        <span class="eyebrow">Kami siap mendengar</span>
        <h2 class="text-2xl">Masih ada pertanyaan?</h2>
        <p class="my-5 text-sm leading-7 text-muted-foreground">
          Ceritakan hal yang ingin kamu ketahui. Tim dapat membantu menjelaskan
          program dan peluang kolaborasi.
        </p>
        <NuxtLink to="/kontak" class="action-link">Hubungi tim</NuxtLink
        ><NuxtLink to="/transparansi" class="text-link mt-3"
          >Kenali transparansi kami</NuxtLink
        >
      </aside>
      <FaqList :items="data?.items ?? []" />
    </section>
    <JoinBanner />
  </div>
</template>
