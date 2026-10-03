<script setup lang="ts">
import { MapPin, CalendarDays, UserRound } from '@lucide/vue'
import type { ContentKind } from '~~/shared/contracts/content'
const props = defineProps<{ kind: ContentKind; slug: string }>()
const { data, error } = await useFetch(
  `/api/v1/public/${props.kind}/${props.slug}`,
  { key: props.kind + '-' + props.slug },
)
if (error.value || !data.value)
  throw createError({
    statusCode: error.value?.statusCode ?? 404,
    statusMessage:
      error.value?.statusCode === 410
        ? 'Konten telah ditarik dari publikasi'
        : 'Halaman tidak tersedia',
  })
const item = data.value
const { data: settings } = await useSiteSettings()
const { data: related } = await useFetch('/api/v1/public/content', {
  query: {
    kind: props.kind === 'program' ? 'initiative' : 'story',
    program: props.kind === 'program' ? props.slug : (item.programSlug ?? ''),
  },
  key: 'related-' + props.kind + '-' + props.slug,
})
const { data: versions } = await useFetch<
  Array<{
    id: string
    title: string
    effectiveDate?: string
    updatedAt: string
  }>
>(`/api/v1/public/policies/${props.slug}/versions`, {
  immediate:
    props.kind === 'page' && ['privasi', 'ketentuan'].includes(props.slug),
  key: 'policy-versions-' + props.slug,
})
const url = usePublicSeo(item.title, item.summary, {
  siteUrl: settings.value?.siteUrl ?? 'http://localhost:3000',
  demo: settings.value?.demo ?? true,
  article: props.kind === 'story',
  updatedAt: item.updatedAt,
})
const statuses = {
  planning: 'Rencana kegiatan',
  ongoing: 'Sedang berjalan',
  completed: 'Selesai',
}
const updated = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'long',
  timeZone: 'Asia/Jakarta',
}).format(new Date(item.updatedAt))
</script>
<template>
  <article class="container section">
    <nav
      class="mb-8 flex flex-wrap gap-2 text-xs text-muted-foreground"
      aria-label="Breadcrumb"
    >
      <NuxtLink to="/">Beranda</NuxtLink><span>/</span
      ><NuxtLink
        :to="
          kind === 'program'
            ? '/program'
            : kind === 'initiative'
              ? '/inisiatif'
              : kind === 'story'
                ? '/cerita'
                : '/' + slug
        "
        >{{
          kind === 'program'
            ? 'Program'
            : kind === 'initiative'
              ? 'Inisiatif'
              : kind === 'story'
                ? 'Cerita'
                : 'Informasi'
        }}</NuxtLink
      ><span>/ {{ item.title }}</span>
    </nav>
    <div class="mb-6 flex gap-2">
      <UiBadge v-if="item.demo" variant="outline">Data contoh</UiBadge
      ><UiBadge v-if="kind === 'initiative'" variant="outline">{{
        statuses[item.activityStatus]
      }}</UiBadge>
    </div>
    <h1 class="max-w-4xl text-4xl md:text-6xl">{{ item.title }}</h1>
    <p class="mb-10 mt-6 max-w-3xl text-lg text-muted-foreground">
      {{ item.summary }}
    </p>
    <div class="grid items-start gap-10 lg:grid-cols-[1.7fr_1fr]">
      <div>
        <img
          v-if="item.imageId"
          :src="`/media/${item.imageId}/1200.webp`"
          :alt="item.imageAlt ?? ''"
          width="1200"
          height="750"
          class="mb-9 rounded-2xl"
        /><ProgramArt
          v-else-if="kind !== 'page'"
          :program="kind === 'program' ? item.slug : item.programSlug"
          large
          class="mb-9 rounded-2xl"
        />
        <div
          v-if="item.demo"
          class="mb-8 rounded-xl border border-[#d2c7a8] bg-[#f3ecd9] p-5 text-sm"
        >
          Halaman ini memakai data demo. Kegiatan, identitas, lokasi, dan cerita
          belum menyatakan fakta kegiatan nyata.
        </div>
        <div class="prose text-lg text-muted-foreground">
          <p v-for="(paragraph, index) in item.paragraphs" :key="index">
            {{ paragraph }}
          </p>
        </div>
        <div class="mt-10 border-t pt-6 text-xs text-muted-foreground">
          <p>Diperbarui {{ updated }}</p>
          <p v-if="item.author" class="mt-2">Penulis: {{ item.author }}</p>
          <p v-if="item.effectiveDate" class="mt-2">
            Tanggal versi {{ item.effectiveDate }}
          </p>
        </div>
        <nav
          v-if="versions?.length"
          class="mt-6 rounded-xl border p-5 text-sm"
          aria-label="Arsip kebijakan"
        >
          <h2 class="mb-3 text-lg">Versi kebijakan</h2>
          <ul class="grid gap-2">
            <li v-for="version in versions" :key="version.id">
              <NuxtLink
                :to="'/' + slug + '/versi/' + version.id"
                class="inline-block min-h-11 py-2 underline underline-offset-4"
                >{{ version.effectiveDate ?? version.updatedAt.slice(0, 10) }} —
                {{ version.title }}</NuxtLink
              >
            </li>
          </ul>
        </nav>
        <div class="mt-6"><ShareLink :title="item.title" :url="url" /></div>
      </div>
      <aside class="rounded-2xl border bg-white p-7">
        <span class="eyebrow">Mari mengenal lebih jauh</span>
        <h2 class="text-2xl">Percakapan adalah<br />langkah pertama.</h2>
        <dl class="my-6 grid gap-4 text-sm">
          <div v-if="item.location" class="flex gap-3">
            <MapPin class="mt-1 size-4 text-primary" aria-hidden="true" />
            <div>
              <dt class="text-xs text-muted-foreground">Lokasi</dt>
              <dd>{{ item.location }}</dd>
            </div>
          </div>
          <div v-if="item.schedule" class="flex gap-3">
            <CalendarDays class="mt-1 size-4 text-primary" aria-hidden="true" />
            <div>
              <dt class="text-xs text-muted-foreground">Jadwal</dt>
              <dd>{{ item.schedule }}</dd>
            </div>
          </div>
          <div v-if="item.responsible" class="flex gap-3">
            <UserRound class="mt-1 size-4 text-primary" aria-hidden="true" />
            <div>
              <dt class="text-xs text-muted-foreground">Penanggung jawab</dt>
              <dd>{{ item.responsible }}</dd>
            </div>
          </div>
        </dl>
        <p class="mb-6 text-sm text-muted-foreground">
          Bicarakan pertanyaan dan peluang kolaborasi dengan tim melalui
          WhatsApp.
        </p>
        <ContactButton :context="item.title" />
        <p class="mt-4 text-xs text-muted-foreground">
          WhatsApp adalah layanan eksternal. Kamu meninjau dan mengirim pesan
          sendiri.
        </p>
        <NuxtLink
          to="/kontak"
          class="mt-4 inline-block min-h-11 py-2 text-sm underline underline-offset-4"
          >Detail kanal & jam layanan</NuxtLink
        >
      </aside>
    </div>
    <section
      v-if="related?.items.length && kind !== 'page'"
      class="section mt-8 border-t"
    >
      <span class="eyebrow">Jelajahi juga</span>
      <h2 class="mb-8">
        {{
          kind === 'program' ? 'Inisiatif dalam program ini' : 'Cerita berbagi'
        }}
      </h2>
      <div class="grid gap-6 md:grid-cols-3">
        <ContentCard
          v-for="entry in related.items.slice(0, 3)"
          :key="entry.id"
          :item="entry"
        />
      </div>
    </section>
  </article>
</template>
