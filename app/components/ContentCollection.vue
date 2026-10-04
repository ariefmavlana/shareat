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
watch(
  () => route.query,
  () => {
    Object.assign(filters, {
      q: String(route.query.q ?? ''),
      program: String(route.query.program ?? ''),
      lokasi: String(route.query.lokasi ?? ''),
      status: String(route.query.status ?? ''),
    })
  },
)
function chooseProgram(slug: string) {
  filters.program = slug
  apply()
}
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
  <div>
    <PageIntro
      :title="title"
      :description="description"
      :current="
        kind === 'program'
          ? 'Program'
          : kind === 'story'
            ? 'Cerita'
            : 'Inisiatif'
      "
      :eyebrow="
        kind === 'story'
          ? 'Catatan & pembelajaran'
          : kind === 'program'
            ? 'Program Shareat'
            : 'Temukan ruang berbagimu'
      "
    />
    <section class="container section !pt-9" :aria-label="title">
      <form
        v-if="filterable"
        class="filter-panel mb-8 grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"
        @submit.prevent="apply"
      >
        <label class="field text-xs"
          >Cari inisiatif<UiInput
            v-model="filters.q"
            maxlength="120"
            placeholder="Judul atau kata kunci"
            class="min-h-12"
        /></label>
        <label class="field text-xs"
          >Program<select v-model="filters.program" class="min-h-12">
            <option value="">Semua program</option>
            <option v-for="p in programs?.items" :key="p.id" :value="p.slug">
              {{ p.title }}
            </option>
          </select></label
        >
        <label class="field text-xs"
          >Kota / kabupaten<UiInput
            v-model="filters.lokasi"
            maxlength="100"
            placeholder="Contoh: Bandung"
            class="min-h-12"
        /></label>
        <label class="field text-xs"
          >Status kegiatan<select v-model="filters.status" class="min-h-12">
            <option value="">Semua status</option>
            <option value="planning">Rencana kegiatan</option>
            <option value="ongoing">Sedang berjalan</option>
            <option value="completed">Selesai</option>
          </select></label
        >
        <div class="flex gap-2">
          <UiButton
            type="submit"
            :disabled="status === 'pending'"
            class="min-h-12"
            ><Search class="size-4" aria-hidden="true" />Terapkan</UiButton
          ><UiButton
            type="button"
            variant="ghost"
            class="min-h-12"
            @click="reset"
            >Reset</UiButton
          >
        </div>
      </form>
      <div
        v-if="filterable"
        class="mb-8 flex flex-wrap gap-2"
        role="group"
        aria-label="Pilih program"
      >
        <button
          type="button"
          :aria-pressed="!route.query.program"
          class="min-h-11 rounded-full border border-[#6f868c] px-4 text-xs font-bold aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-white"
          @click="chooseProgram('')"
        >
          Semua program
        </button>
        <button
          v-for="program in programs?.items"
          :key="program.id"
          type="button"
          :aria-pressed="route.query.program === program.slug"
          class="min-h-11 rounded-full border border-[#6f868c] px-4 text-xs font-bold aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-white"
          @click="chooseProgram(program.slug)"
        >
          {{ program.title }}
        </button>
      </div>
      <div
        class="mb-7 flex flex-wrap items-center justify-between gap-3 border-b pb-5"
      >
        <p role="status" aria-live="polite" class="text-sm font-semibold">
          {{
            status === 'pending'
              ? 'Memuat informasi…'
              : `${data?.total ?? 0} ${kind === 'initiative' ? 'inisiatif' : kind === 'program' ? 'program' : 'cerita'} ditemukan`
          }}
        </p>
        <span class="text-xs text-muted-foreground">{{
          filtered
            ? 'Menampilkan hasil pilihanmu'
            : 'Kenali, pahami, lalu mulai percakapan.'
        }}</span>
      </div>
      <div v-if="error" role="alert" class="empty-state">
        <h2 class="text-2xl">Informasi sementara tidak tersedia.</h2>
        <p class="mt-3 text-sm text-muted-foreground">
          Coba muat informasi kembali beberapa saat lagi.
        </p>
        <UiButton class="mt-5 min-h-11" @click="refresh">Coba lagi</UiButton>
      </div>
      <div
        v-else-if="data?.items.length"
        class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        :aria-busy="status === 'pending'"
      >
        <ContentCard
          v-for="item in data.items"
          :key="item.id"
          :item="item"
          heading="h2"
        />
      </div>
      <div v-else class="empty-state">
        <Search
          class="mx-auto mb-5 size-10 text-primary"
          :stroke-width="1.3"
          aria-hidden="true"
        />
        <h2 class="text-2xl">Belum ada informasi yang cocok.</h2>
        <p class="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Coba kata kunci lain atau reset filter untuk menjelajahi semua
          informasi.
        </p>
        <UiButton class="mt-6 min-h-11" variant="outline" @click="reset"
          >Reset filter</UiButton
        >
      </div>
      <nav
        v-if="data && data.pages > 1"
        class="mt-12 flex flex-wrap items-center justify-center gap-6"
        aria-label="Pagination"
      >
        <NuxtLink
          v-if="data.page > 1"
          :to="pageLink(data.page - 1)"
          class="text-link"
          ><ArrowLeft class="size-4" aria-hidden="true" />Sebelumnya</NuxtLink
        ><span class="text-sm"
          >Halaman {{ data.page }} dari {{ data.pages }}</span
        ><NuxtLink
          v-if="data.page < data.pages"
          :to="pageLink(data.page + 1)"
          class="text-link"
          >Berikutnya<ArrowRight class="size-4" aria-hidden="true"
        /></NuxtLink>
      </nav>
    </section>
    <JoinBanner />
  </div>
</template>
