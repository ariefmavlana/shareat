<script setup lang="ts">
import { ArrowUpRight, MapPin } from '@lucide/vue'
import type { PublicContent } from '~~/shared/contracts/content'
const props = defineProps<{ item: PublicContent }>()
const paths = {
  program: 'program',
  initiative: 'inisiatif',
  story: 'cerita',
  page: '',
  faq: 'faq',
}
const path = computed(
  () => '/' + paths[props.item.kind] + '/' + props.item.slug,
)
const statuses = {
  planning: 'Rencana kegiatan',
  ongoing: 'Sedang berjalan',
  completed: 'Selesai',
}
</script>
<template>
  <article class="group overflow-hidden rounded-2xl border bg-white">
    <NuxtLink :to="path" tabindex="-1" aria-hidden="true"
      ><ProgramArt
        :program="item.kind === 'program' ? item.slug : item.programSlug"
    /></NuxtLink>
    <div class="p-6">
      <div class="mb-4 flex flex-wrap gap-2 text-xs">
        <UiBadge v-if="item.demo" variant="outline">Contoh</UiBadge
        ><span
          v-if="item.kind === 'initiative'"
          class="rounded-full bg-muted px-3 py-1"
          >{{ statuses[item.activityStatus] }}</span
        ><span v-else class="rounded-full bg-muted px-3 py-1">{{
          item.kind === 'story' ? 'Cerita berbagi' : 'Ruang berbagi'
        }}</span>
      </div>
      <h3 class="text-xl leading-snug">
        <NuxtLink
          :to="path"
          class="flex justify-between gap-4 hover:text-primary"
          >{{ item.title
          }}<ArrowUpRight class="mt-1 size-5 shrink-0" aria-hidden="true"
        /></NuxtLink>
      </h3>
      <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
        {{ item.summary }}
      </p>
      <p
        v-if="item.location"
        class="mt-5 flex items-center gap-2 text-xs text-muted-foreground"
      >
        <MapPin class="size-3.5" aria-hidden="true" />{{ item.location }}
      </p>
    </div>
  </article>
</template>
