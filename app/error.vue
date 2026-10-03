<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
useSeoMeta({
  title: 'Halaman tidak tersedia | Shareat',
  robots: 'noindex, nofollow',
})
const title = computed(() =>
  props.error.statusCode === 410
    ? 'Informasi ini telah ditarik.'
    : props.error.statusCode === 404
      ? 'Halaman belum ditemukan.'
      : 'Informasi sementara tidak tersedia.',
)
</script>
<template>
  <main class="container section min-h-screen">
    <BrandMark />
    <div class="mt-24 max-w-xl">
      <span class="eyebrow">{{ error.statusCode }}</span>
      <h1 class="text-4xl">{{ title }}</h1>
      <p class="my-7 text-muted-foreground">
        {{
          error.statusCode === 410
            ? 'Konten ini sudah tidak dipublikasikan. Silakan jelajahi informasi lain yang tersedia.'
            : error.statusCode === 404
              ? 'Tautan mungkin berubah atau halaman belum dipublikasikan.'
              : 'Coba muat ulang beberapa saat lagi. Tim akan memeriksa gangguan layanan.'
        }}
      </p>
      <UiButton class="min-h-12" @click="clearError({ redirect: '/' })"
        >Kembali ke beranda</UiButton
      >
    </div>
  </main>
</template>
