<script setup lang="ts">
import { ArrowUpRight, HeartHandshake } from '@lucide/vue'
</script>
<template>
  <section class="join-banner">
    <div
      class="container relative z-1 flex flex-wrap items-center justify-between gap-8"
    >
      <div class="flex items-start gap-5">
        <HeartHandshake
          class="mt-1 hidden size-12 shrink-0 text-primary sm:block"
          :stroke-width="1.3"
          aria-hidden="true"
        />
        <div>
          <span class="eyebrow">Setiap langkah punya arti</span>
          <h2 class="text-3xl md:text-4xl">
            Ada kebaikan yang ingin kamu bagikan?
          </h2>
          <p class="mt-3 max-w-xl text-sm text-muted-foreground">
            Bawa ide, waktu, atau pengetahuanmu. Mari temukan ruang untuk
            bertumbuh bersama.
          </p>
        </div>
      </div>
      <NuxtLink to="/kontak" class="action-link"
        >Mari berbincang<ArrowUpRight class="size-4" aria-hidden="true"
      /></NuxtLink>
    </div>
  </section>
</template>
