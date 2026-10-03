<script setup lang="ts">
import { Search, ArrowLeft, ArrowRight } from '@lucide/vue'
import type { ContentKind } from '~~/shared/contracts/content'
const props = defineProps<{
  kind: ContentKind
  title: string
  description: string
  filterable?: boolean
}>()
const route = useRoute()
const router = useRouter()
const query = computed(() => ({
  kind: props.kind,
  page: String(route.query.page ?? '1'),
  q: String(route.query.q ?? ''),
  program: String(route.query.program ?? ''),
  lokasi: String(route.query.lokasi ?? ''),
  status: String(route.query.status ?? ''),
}))
const { data, error, status, refresh } = await useFetch(
  '/api/v1/public/content',
  { query, key: 'collection-' + props.kind },
)
if (error.value)
  throw createError({
    statusCode:
      error.value.statusCode === 422 ? 404 : (error.value.statusCode ?? 503),
    statusMessage: 'Daftar tidak tersedia',
  })
const { data: programs } = await useFetch('/api/v1/public/content', {
  query: { kind: 'program' },
  key: 'program-list',
})
const { data: settings } = await useSiteSettings()
const filtered = computed(() =>
  Boolean(
    route.query.q ||
    route.query.program ||
    route.query.lokasi ||
    route.query.status,
  ),
)
usePublicSeo(props.title, props.description, {
  siteUrl: settings.value?.siteUrl ?? 'http://localhost:3000',
  demo: settings.value?.demo ?? true,
  noindex: filtered,
})
const filters = reactive({
  q: String(route.query.q ?? ''),
  program: String(route.query.program ?? ''),
  lokasi: String(route.query.lokasi ?? ''),
  status: String(route.query.status ?? ''),
})
function apply() {
  router.push({
    path: route.path,
    query: Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
  })
}
function reset() {
  Object.assign(filters, { q: '', program: '', lokasi: '', status: '' })
  router.push(route.path)
}
function pageLink(page: number) {
  return {
    path: route.path,
    query: { ...route.query, page: page === 1 ? undefined : String(page) },
  }
}
</script>
<template>
  <section class="container section">
    <nav class="mb-8 text-xs text-muted-foreground" aria-label="Breadcrumb">
      <NuxtLink to="/">Beranda</NuxtLink> / {{ title }}
    </nav>
    <span class="eyebrow">Ruang berbagi</span>
    <h1 class="max-w-3xl text-4xl md:text-6xl">{{ title }}</h1>
    <p class="mb-12 mt-6 max-w-2xl text-lg text-muted-foreground">
      {{ description }}
    </p>
    <form
      v-if="filterable"
      class="mb-10 grid items-end gap-4 rounded-2xl border bg-white p-5 sm:grid-cols-2 lg:grid-cols-5"
      @submit.prevent="apply"
    >
      <label class="field text-sm"
        >Cari inisiatif<UiInput
          v-model="filters.q"
          maxlength="120"
          placeholder="Judul atau kata kunci"
          class="min-h-11" /></label
      ><label class="field text-sm"
        >Program<select v-model="filters.program" class="min-h-11">
          <option value="">Semua program</option>
          <option v-for="p in programs?.items" :key="p.id" :value="p.slug">
            {{ p.title }}
          </option>
        </select></label
      ><label class="field text-sm"
        >Kota / kabupaten<UiInput
          v-model="filters.lokasi"
          maxlength="100"
          placeholder="Contoh: Bandung"
          class="min-h-11" /></label
      ><label class="field text-sm"
        >Status kegiatan<select v-model="filters.status" class="min-h-11">
          <option value="">Semua status</option>
          <option value="planning">Rencana kegiatan</option>
          <option value="ongoing">Sedang berjalan</option>
          <option value="completed">Selesai</option>
        </select></label
      >
      <div class="flex gap-2">
        <UiButton type="submit" class="min-h-11"
          ><Search class="size-4" />Terapkan</UiButton
        ><UiButton type="button" variant="ghost" class="min-h-11" @click="reset"
          >Reset</UiButton
        >
      </div>
    </form>
    <p role="status" class="mb-6 text-sm text-muted-foreground">
      {{
        status === 'pending'
          ? 'Memuat informasi…'
          : `${data?.total ?? 0} ${kind === 'initiative' ? 'inisiatif' : kind === 'program' ? 'program' : 'cerita'} ditemukan`
      }}
    </p>
    <div v-if="error" role="alert" class="rounded-xl border p-8">
      <p>Informasi sementara tidak tersedia.</p>
      <UiButton class="mt-4 min-h-11" @click="refresh">Coba lagi</UiButton>
    </div>
    <div
      v-else-if="data?.items.length"
      class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <ContentCard v-for="item in data.items" :key="item.id" :item="item" />
    </div>
    <div v-else class="rounded-2xl border bg-white p-10 text-center">
      <h2 class="text-2xl">Belum ada informasi yang cocok.</h2>
      <p class="mt-3 text-muted-foreground">
        Coba kata kunci lain atau reset filter untuk menjelajahi semua
        informasi.
      </p>
      <UiButton class="mt-6 min-h-11" variant="outline" @click="reset"
        >Reset filter</UiButton
      >
    </div>
    <nav
      v-if="data && data.pages > 1"
      class="mt-12 flex items-center justify-center gap-6"
      aria-label="Pagination"
    >
      <NuxtLink
        v-if="data.page > 1"
        :to="pageLink(data.page - 1)"
        class="inline-flex min-h-11 items-center gap-2"
        ><ArrowLeft class="size-4" />Sebelumnya</NuxtLink
      ><span class="text-sm">Halaman {{ data.page }} dari {{ data.pages }}</span
      ><NuxtLink
        v-if="data.page < data.pages"
        :to="pageLink(data.page + 1)"
        class="inline-flex min-h-11 items-center gap-2"
        >Berikutnya<ArrowRight class="size-4"
      /></NuxtLink>
    </nav>
  </section>
</template>
