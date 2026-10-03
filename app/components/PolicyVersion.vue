<script setup lang="ts">
import type { PublicContent } from '~~/shared/contracts/content'
const props = defineProps<{ slug: string; id: string }>()
const { data, error } = await useFetch<PublicContent>(
  `/api/v1/public/policies/${props.slug}/${props.id}`,
)
if (error.value || !data.value)
  throw createError({
    statusCode: error.value?.statusCode ?? 404,
    statusMessage: 'Versi kebijakan tidak tersedia',
  })
const { data: settings } = await useSiteSettings()
usePublicSeo(data.value.title, data.value.summary, {
  siteUrl: settings.value?.siteUrl ?? 'http://localhost:3000',
  demo: settings.value?.demo ?? true,
  noindex: true,
})
</script>
<template>
  <article v-if="data" class="container section">
    <NuxtLink :to="'/' + slug" class="text-sm underline"
      >← Kembali ke versi terbaru</NuxtLink
    ><span class="eyebrow mt-9">Arsip versi yang sudah dipublikasikan</span>
    <h1 class="max-w-3xl text-4xl">{{ data.title }}</h1>
    <p class="my-6 text-muted-foreground">
      Versi {{ data.effectiveDate ?? data.updatedAt }}
    </p>
    <p v-if="data.demo" class="mb-8 rounded-xl bg-[#f3ecd9] p-5">
      Data contoh untuk review; bukan kebijakan produksi final.
    </p>
    <div class="prose">
      <p v-for="(text, index) in data.paragraphs" :key="index">{{ text }}</p>
    </div>
  </article>
</template>
