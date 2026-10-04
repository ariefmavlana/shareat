<script setup lang="ts">
import type {
  Checklist,
  ContentBody,
  ContentRecord,
  Revision,
} from '~~/shared/contracts/content'
definePageMeta({ layout: 'admin', middleware: 'staff' })
const route = useRoute()
const id = String(route.params.id)
type DetailedRevision = Revision & {
  authorEmail?: string | null
  reviewerEmail?: string | null
}
type DetailedRecord = Omit<ContentRecord, 'revisions'> & {
  revisions: DetailedRevision[]
}
const {
  data: record,
  error: fetchError,
  refresh,
} = await useFetch<DetailedRecord>('/api/v1/admin/content/' + id, {
  key: 'admin-record-' + id,
})
if (fetchError.value)
  throw createError({
    statusCode: fetchError.value.statusCode ?? 503,
    statusMessage: 'Konten tidak tersedia',
  })
const { session, mutate } = useStaff()
const error = ref(''),
  notice = ref(''),
  loading = ref(false),
  reason = ref('')
const newSlug = ref('')
async function rename() {
  await act(
    () =>
      mutate('/api/v1/admin/content/' + id + '/slug', 'POST', {
        version: record.value?.version,
        slug: newSlug.value,
        reason: reason.value,
      }),
    'Slug diperbarui. URL lama mengarah 301 langsung ke URL baru.',
  )
}
const checks = reactive<Checklist>({
  claims: false,
  media: false,
  privacy: false,
  seo: false,
  contact: false,
})
const labels = {
  claims: 'Klaim, identitas, dan sumber sudah diperiksa',
  media: 'Hak media dan izin konteks sudah diperiksa',
  privacy: 'Tidak ada data pribadi yang tidak semestinya',
  seo: 'Judul, ringkasan, URL, dan konteks jelas',
  contact: 'Kanal kontak dan tujuan percakapan sesuai R1',
}
const latest = computed(() => record.value?.revisions.at(-1))
const roles = computed(() => session.value?.user.roles ?? [])
const isAuditor = computed(() => roles.value.includes('auditor'))
const canEdit = computed(
  () =>
    !isAuditor.value &&
    roles.value.some((x) => ['editor', 'partner_editor'].includes(x)),
)
const canReview = computed(
  () => !isAuditor.value && roles.value.includes('reviewer'),
)
const canPublish = computed(
  () => canReview.value && latest.value?.reviewerId === session.value?.user.id,
)
const canArchive = computed(
  () =>
    canReview.value &&
    Boolean(record.value?.publishedRevisionId) &&
    !record.value?.archived,
)
const reviewContext = computed(() =>
  [...(record.value?.revisions ?? [])]
    .reverse()
    .find((r) => r.reviewNote || r.reviewedAt || r.checklist),
)
async function save(body: ContentBody) {
  await act(
    () =>
      mutate('/api/v1/admin/content/' + id, 'PUT', {
        version: record.value?.version,
        body,
      }),
    'Draft disimpan. Snapshot publik tetap mengikuti versi yang disetujui.',
  )
}
async function transition(action: string) {
  await act(
    () =>
      mutate('/api/v1/admin/content/' + id + '/transition', 'POST', {
        version: record.value?.version,
        action,
        checklist: checks,
        reason: reason.value || undefined,
      }),
    'Status konten diperbarui.',
  )
}
async function act(fn: () => Promise<unknown>, message: string) {
  loading.value = true
  error.value = ''
  notice.value = ''
  try {
    await fn()
    await refresh()
    notice.value = message
  } catch (e) {
    error.value = staffError(e)
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <section v-if="record && latest">
    <NuxtLink to="/admin" class="text-sm underline">← Daftar konten</NuxtLink>
    <div class="my-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        <span class="eyebrow"
          >{{ record.kind }} · versi {{ record.version }} ·
          {{ latest.status }}</span
        >
        <h1 class="max-w-3xl text-3xl">{{ latest.body.title }}</h1>
      </div>
      <UiButton as-child variant="outline" class="min-h-11"
        ><NuxtLink :to="'/admin/preview/' + id"
          >Preview privat</NuxtLink
        ></UiButton
      >
    </div>
    <p
      v-if="error"
      role="alert"
      class="mb-5 rounded-xl border bg-white p-4 error"
    >
      {{ error }}
    </p>
    <p v-if="notice" role="status" class="mb-5 rounded-xl bg-[#e4edda] p-4">
      {{ notice }}
    </p>
    <div class="grid items-start gap-7 lg:grid-cols-[1.5fr_1fr]">
      <div class="rounded-2xl border bg-white p-7">
        <AdminContentForm
          :key="record.version"
          :initial="latest.body"
          :locked="
            loading ||
            !canEdit ||
            ['submitted', 'reviewed'].includes(latest.status)
          "
          @save="save"
        />
      </div>
      <aside class="grid gap-7">
        <form
          v-if="
            canReview &&
            ['program', 'initiative', 'story'].includes(record.kind)
          "
          class="rounded-2xl border bg-white p-7"
          @submit.prevent="rename"
        >
          <h2 class="mb-5 text-xl">Ubah slug URL</h2>
          <label class="field text-sm"
            >Slug baru<UiInput
              v-model="newSlug"
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              required
              maxlength="100"
          /></label>
          <p class="my-4 text-xs text-muted-foreground">
            Isi alasan perubahan di kolom review. Alias lama tetap diarahkan ke
            URL baru tanpa rantai.
          </p>
          <UiButton
            type="submit"
            variant="outline"
            class="min-h-11"
            :disabled="loading"
            >Simpan slug & redirect</UiButton
          >
        </form>
        <div class="rounded-2xl border bg-white p-7">
          <h2 class="mb-5 text-xl">Review & publikasi</h2>
          <p class="mb-5 text-sm text-muted-foreground">
            Penulis dan reviewer harus berbeda identitas. Lima pemeriksaan wajib
            sebelum publikasi.
          </p>
          <div
            v-if="isAuditor"
            class="mb-5 rounded-xl border bg-muted p-4 text-sm"
            role="note"
          >
            Peran auditor bersifat baca saja. Perubahan konten hanya dapat
            dilakukan oleh editor dan reviewer.
          </div>
          <div
            v-if="reviewContext"
            class="mb-6 rounded-xl border bg-muted p-4 text-sm"
          >
            <h3 class="text-base">Catatan review terakhir</h3>
            <p class="mt-2 text-xs text-muted-foreground">
              Status revisi {{ reviewContext.status }}
              <template v-if="reviewContext.reviewedAt">
                ·
                {{ new Date(reviewContext.reviewedAt).toLocaleString('id-ID') }}
              </template>
              <template v-if="reviewContext.reviewerEmail">
                · peninjau {{ reviewContext.reviewerEmail }}
              </template>
            </p>
            <p v-if="reviewContext.reviewNote" class="mt-3 whitespace-pre-wrap">
              {{ reviewContext.reviewNote }}
            </p>
            <p v-else class="mt-3 text-xs text-muted-foreground">
              Belum ada catatan tertulis pada revisi ini.
            </p>
          </div>
          <div v-if="canReview" class="mb-6 grid gap-4">
            <label
              v-for="(label, key) in labels"
              :key="key"
              class="flex items-start gap-3 text-sm"
              ><input
                v-model="checks[key]"
                type="checkbox"
                class="mt-1 size-5 shrink-0"
              />{{ label }}</label
            >
          </div>
          <label v-if="canEdit || canReview" class="field mb-5 text-sm"
            >Alasan revisi / arsip<UiTextarea
              v-model="reason"
              maxlength="500"
              rows="3"
          /></label>
          <div class="flex flex-wrap gap-3">
            <UiButton
              v-if="
                canEdit &&
                ['draft', 'changes_requested'].includes(latest.status)
              "
              :disabled="loading"
              class="min-h-11"
              @click="transition('submit')"
              >Ajukan review</UiButton
            ><template v-if="canReview"
              ><UiButton
                v-if="latest.status === 'submitted'"
                :disabled="loading"
                class="min-h-11"
                @click="transition('review')"
                >Setujui review</UiButton
              ><UiButton
                v-if="latest.status === 'submitted'"
                :disabled="loading"
                variant="outline"
                class="min-h-11"
                @click="transition('request_changes')"
                >Minta revisi</UiButton
              ><UiButton
                v-if="latest.status === 'reviewed' && canPublish"
                :disabled="loading"
                class="min-h-11"
                @click="transition('publish')"
                >Publikasikan snapshot</UiButton
              ><UiButton
                v-if="canArchive"
                :disabled="loading"
                variant="outline"
                class="min-h-11"
                @click="transition('archive')"
                >Tarik / arsipkan</UiButton
              ></template
            >
          </div>
        </div>
        <div class="rounded-2xl border bg-white p-7">
          <h2 class="mb-5 text-xl">Riwayat revisi</h2>
          <ol class="grid gap-4 text-sm">
            <li
              v-for="(rev, index) in [...record.revisions].reverse()"
              :key="rev.id"
              class="border-b pb-3"
            >
              <strong>Revisi {{ record.revisions.length - index }}</strong> ·
              {{ rev.status }}
              <p class="mt-1 text-muted-foreground">{{ rev.body.title }}</p>
            </li>
          </ol>
        </div>
      </aside>
    </div>
  </section>
</template>
