<script setup lang="ts">
import { ArrowUpRight, MapPin, CalendarDays } from '@lucide/vue'
import type { PublicContent } from '~~/shared/contracts/content'
const props = withDefaults(
  defineProps<{ item: PublicContent; heading?: 'h2' | 'h3' }>(),
  { heading: 'h3' },
)
const paths = {
  program: 'program',
  initiative: 'inisiatif',
  story: 'cerita',
  page: '',
  faq: 'faq',
}
const path = computed(() =>
  ['', paths[props.item.kind], props.item.slug]
    .filter((part, index) => index === 0 || part)
    .join('/'),
)
const statuses = {
  planning: 'Rencana kegiatan',
  ongoing: 'Sedang berjalan',
  completed: 'Selesai',
}
const updated = computed(() =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(props.item.updatedAt)),
)
</script>
<template>
  <article class="content-card group">
    <NuxtLink
      :to="path"
      tabindex="-1"
      aria-hidden="true"
      class="block overflow-hidden"
      ><img
        v-if="item.imageId"
        :src="`/media/${item.imageId}/800.webp`"
        alt=""
        width="800"
        height="500"
        loading="lazy"
        class="card-art" /><ProgramArt
        v-else
        :program="item.kind === 'program' ? item.slug : item.programSlug"
        class="card-art"
    /></NuxtLink>
    <div class="card-body">
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <span class="card-tag">{{
          item.kind === 'initiative'
            ? statuses[item.activityStatus]
            : item.kind === 'story'
              ? 'Cerita berbagi'
              : 'Program Shareat'
        }}</span
        ><span v-if="item.demo" class="text-[10px] font-semibold text-[#80612d]"
          >Data contoh</span
        >
      </div>
      <component :is="heading" class="text-xl leading-snug">
        <NuxtLink :to="path" class="hover:text-primary">{{
          item.title
        }}</NuxtLink>
      </component>
      <p class="mb-5 mt-3 text-sm leading-7 text-muted-foreground">
        {{ item.summary }}
      </p>
      <div class="mt-auto">
        <NuxtLink :to="path" class="text-link justify-start"
          >{{
            item.kind === 'program'
              ? 'Kenali program'
              : item.kind === 'story'
                ? 'Baca cerita'
                : 'Lihat inisiatif'
          }}<ArrowUpRight class="size-4" aria-hidden="true" /><span
            class="sr-only"
            >: {{ item.title }}</span
          ></NuxtLink
        >
        <div class="card-meta">
          <span v-if="item.location" class="inline-flex items-center gap-1.5"
            ><MapPin class="size-3.5" aria-hidden="true" />{{
              item.location
            }}</span
          ><span class="inline-flex items-center gap-1.5"
            ><CalendarDays class="size-3.5" aria-hidden="true" /><time
              :datetime="item.updatedAt"
              >{{ updated }}</time
            ></span
          >
        </div>
      </div>
    </div>
  </article>
</template>
