<script setup lang="ts">
import type { NuxtError } from '#app'
import { ArrowRight, Compass } from '@lucide/vue'
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
  <main class="min-h-screen bg-sand">
    <div class="container py-7"><BrandMark /></div>
    <section
      class="container grid min-h-[70vh] items-center gap-10 py-12 md:grid-cols-[1.2fr_1fr]"
    >
      <div class="max-w-xl">
        <span class="eyebrow">Mari temukan jalan kembali</span>
        <h1 class="text-4xl md:text-5xl">{{ title }}</h1>
        <p class="my-7 leading-8 text-muted-foreground">
          {{
            error.statusCode === 410
              ? 'Konten ini sudah tidak dipublikasikan. Silakan jelajahi informasi lain yang tersedia.'
              : error.statusCode === 404
                ? 'Tautan mungkin berubah atau halaman belum dipublikasikan. Masih ada ruang berbagi lain yang bisa kamu kenali.'
                : 'Coba muat ulang beberapa saat lagi untuk mendapatkan informasi terbaru.'
          }}
        </p>
        <div class="flex flex-wrap gap-3">
          <UiButton class="min-h-12" @click="clearError({ redirect: '/' })"
            >Kembali ke beranda<ArrowRight
              class="size-4"
              aria-hidden="true" /></UiButton
          ><UiButton
            variant="outline"
            class="min-h-12"
            @click="clearError({ redirect: '/program' })"
            >Jelajahi program</UiButton
          >
        </div>
      </div>
      <div
        class="grid aspect-square max-h-80 place-items-center rounded-full border border-[#c7ddd5] bg-[#e7f1e8]"
        aria-hidden="true"
      >
        <div class="text-center">
          <Compass
            class="mx-auto mb-4 size-14 text-primary"
            :stroke-width="1"
          /><span
            class="text-7xl font-extrabold tracking-tighter text-primary md:text-8xl"
            >{{ error.statusCode }}</span
          >
          <p
            class="mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            Setiap langkah punya arah
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
