<script setup lang="ts">
import { ArrowUpRight, ChevronRight, HeartHandshake } from '@lucide/vue'
withDefaults(
  defineProps<{
    title: string
    description: string
    eyebrow?: string
    current?: string
  }>(),
  { eyebrow: 'Ruang berbagi', current: undefined },
)
</script>
<template>
  <section class="page-intro">
    <div class="container relative">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink
        ><ChevronRight class="size-3" aria-hidden="true" /><span
          aria-current="page"
          >{{ current ?? title }}</span
        >
      </nav>
      <div class="grid items-center gap-8 md:grid-cols-[1fr_auto]">
        <div class="max-w-3xl">
          <span class="eyebrow">{{ eyebrow }}</span>
          <h1>{{ title }}</h1>
          <p class="mt-6 max-w-2xl text-muted-foreground">{{ description }}</p>
        </div>
        <div class="intro-emblem hidden md:grid" aria-hidden="true">
          <HeartHandshake class="size-16" :stroke-width="1.2" /><ArrowUpRight
            class="absolute right-3 top-3 size-5"
          />
        </div>
      </div>
      <slot />
    </div>
  </section>
</template>
