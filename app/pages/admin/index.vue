<script setup lang="ts">
import { Plus, ArrowUpRight } from '@lucide/vue'
import type { ContentKind } from '~~/shared/contracts/content'
definePageMeta({ layout: 'admin', middleware: 'staff' })
const filter = ref('all')
const currentPage = ref(1)
watch(filter, () => {
  currentPage.value = 1
})
const query = computed(() => ({
  page: currentPage.value,
  ...(filter.value === 'all' ? {} : { kind: filter.value as ContentKind }),
}))
const { data, error, refresh } = await useFetch('/api/v1/admin/content', {
  query,
  key: 'admin-content',
})
const { session } = useStaff()
const names: Record<ContentKind, string> = {
  program: 'Program',
  initiative: 'Inisiatif',
  story: 'Cerita',
  page: 'Halaman',
  faq: 'FAQ',
}
const rows = computed(() => data.value?.items ?? [])
</script>
<template>
  <section>
    <div class="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div>
        <span class="eyebrow">CMS & publikasi</span>
        <h1 class="text-4xl">Kelola ruang berbagi.</h1>
        <p class="mt-4 text-muted-foreground">
          Draft tetap privat. Publikasi memerlukan review dari identitas lain.
        </p>
      </div>
      <UiButton
        v-if="
          session?.user.roles.some((x) =>
            ['editor', 'partner_editor'].includes(x),
          )
        "
        as-child
        class="min-h-12"
        ><NuxtLink to="/admin/content/new"
          ><Plus class="size-4" />Buat konten</NuxtLink
        ></UiButton
      >
    </div>
    <label class="field mb-6 max-w-xs text-sm"
      >Jenis konten<select v-model="filter">
        <option value="all">Semua konten</option>
        <option v-for="(name, kind) in names" :key="kind" :value="kind">
          {{ name }}
        </option>
      </select></label
    >
    <div v-if="error" role="alert">
      <p>CMS sementara tidak tersedia.</p>
      <UiButton class="mt-4" @click="refresh">Coba lagi</UiButton>
    </div>
    <div v-else class="grid gap-4">
      <article
        v-for="row in rows"
        :key="row.id"
        class="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5"
      >
        <div>
          <div class="mb-2 flex gap-2 text-xs text-muted-foreground">
            <span>{{ names[row.kind] }}</span
            ><span>· versi {{ row.version }}</span
            ><span
              >·
              {{
                row.archived ? 'diarsipkan' : row.revisions.at(-1)?.status
              }}</span
            >
          </div>
          <h2 class="text-xl">{{ row.revisions.at(-1)?.body.title }}</h2>
          <p class="mt-2 text-xs text-muted-foreground">
            {{
              row.publishedRevisionId
                ? 'Snapshot publik tersedia'
                : 'Belum dipublikasikan'
            }}
          </p>
        </div>
        <NuxtLink
          :to="'/admin/content/' + row.id"
          class="inline-flex min-h-11 items-center gap-2 text-sm font-medium"
          >Buka konten<ArrowUpRight class="size-4"
        /></NuxtLink>
      </article>
      <p v-if="!rows.length" class="rounded-xl border bg-white p-8">
        Belum ada konten dalam daftar ini.
      </p>
    </div>
    <nav
      v-if="data"
      class="mt-8 flex flex-wrap items-center gap-4"
      aria-label="Halaman CMS"
    >
      <UiButton
        variant="outline"
        :disabled="currentPage <= 1"
        @click="currentPage--"
        >Sebelumnya</UiButton
      >
      <p class="text-sm">
        Halaman {{ data.page }} dari {{ data.pages }} · {{ data.total }} konten
      </p>
      <UiButton
        variant="outline"
        :disabled="currentPage >= data.pages"
        @click="currentPage++"
        >Berikutnya</UiButton
      >
    </nav>
  </section>
</template>
