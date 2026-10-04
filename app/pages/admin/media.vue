<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'staff' })
interface MediaRow {
  id: string
  mime: string
  bytes: number
  width: number | null
  height: number | null
  scanStatus: string
  rightsStatus: string
  organizationId: string
  createdAt: string
  uploadedByEmail: string | null
  usedBy: Array<{
    id: string
    kind: string
    slug: string
    title: string
    published: boolean
  }>
}
const { data, refresh } = await useFetch<MediaRow[]>('/api/v1/admin/media')
const { session, load, mutate } = useStaff()
const canUpload = computed(() =>
  (session.value?.user.roles ?? []).some((r) =>
    ['editor', 'partner_editor', 'reviewer'].includes(r),
  ),
)
const canApprove = computed(() =>
  (session.value?.user.roles ?? []).includes('reviewer'),
)
const error = ref(''),
  notice = ref(''),
  file = ref<File | null>(null),
  loading = ref(false)
function select(event: Event) {
  file.value = (event.target as HTMLInputElement).files?.[0] ?? null
}
async function upload() {
  if (!file.value) return
  loading.value = true
  try {
    if (!session.value) await load()
    const result = await $fetch('/api/v1/admin/media', {
      method: 'POST',
      body: file.value,
      headers: {
        'x-csrf-token': session.value!.csrf,
        'content-type': 'application/octet-stream',
      },
    })
    notice.value =
      'Berkas disimpan secara privat. Status scan: ' + result.scanStatus
    await refresh()
  } catch (e) {
    error.value = staffError(e)
  } finally {
    loading.value = false
  }
}
async function approve(id: string) {
  const reason = window.prompt(
    'Sumber hak media, bukti izin, dan konteks publikasi (minimum 20 karakter):',
  )
  if (!reason) return
  try {
    await mutate('/api/v1/admin/media/' + id + '/approve', 'POST', { reason })
    await refresh()
  } catch (e) {
    error.value = staffError(e)
  }
}
</script>
<template>
  <section>
    <span class="eyebrow">Media & hak publikasi</span>
    <h1 class="mb-6 text-3xl">Privat sebelum disetujui.</h1>
    <p class="mb-8 max-w-3xl text-muted-foreground">
      Gambar maksimum 8 MB / 24 MP; PDF privat maksimum 10 MB. SVG dan HTML
      ditolak. Tanpa scanner yang dikonfigurasi, berkas tetap dikarantina dan
      tidak dapat dibuka atau dipublikasikan.
    </p>
    <p v-if="error" role="alert" class="mb-5 error">{{ error }}</p>
    <p v-if="notice" role="status" class="mb-5">{{ notice }}</p>
    <form
      v-if="canUpload"
      class="mb-8 flex flex-wrap items-end gap-5 rounded-2xl border bg-white p-6"
      @submit.prevent="upload"
    >
      <label class="field"
        >Pilih berkas<input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required
          @change="select" /></label
      ><UiButton type="submit" :disabled="loading" class="min-h-11">{{
        loading ? 'Mengunggah…' : 'Unggah ke penyimpanan privat'
      }}</UiButton>
    </form>
    <p v-else class="mb-8 rounded-xl border bg-white p-5 text-sm">
      Peran kamu tidak mengunggah media. Editor, editor mitra, dan reviewer yang
      dapat menambah berkas.
    </p>
    <div class="grid gap-4">
      <article
        v-for="item in data"
        :key="item.id"
        class="rounded-xl border bg-white p-5"
      >
        <p class="break-all font-mono text-xs">{{ item.id }}</p>
        <div class="my-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span>{{ item.mime }}</span>
          <span>· {{ item.bytes }} byte</span>
          <span
            >·
            {{
              item.width && item.height
                ? item.width + '×' + item.height + ' px'
                : 'tanpa dimensi'
            }}</span
          >
          <span>· scan {{ item.scanStatus }}</span>
          <span>· hak {{ item.rightsStatus }}</span>
        </div>
        <p class="mb-3 text-xs text-muted-foreground">
          Diunggah oleh {{ item.uploadedByEmail ?? item.organizationId }} ·
          {{
            new Date(item.createdAt).toLocaleDateString('id-ID', {
              dateStyle: 'medium',
            })
          }}
        </p>
        <div class="mb-3 text-xs">
          <template v-if="item.usedBy.length">
            <p class="font-bold">
              Dipakai oleh {{ item.usedBy.length }} konten:
            </p>
            <ul class="mt-1 grid gap-1">
              <li v-for="usage in item.usedBy" :key="usage.id">
                {{ usage.kind }} · {{ usage.title }}
                <span class="text-muted-foreground"
                  >({{
                    usage.published ? 'sudah terbit' : 'belum terbit'
                  }})</span
                >
              </li>
            </ul>
          </template>
          <p v-else class="text-muted-foreground">
            Belum dipakai konten mana pun.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UiButton
            v-if="canApprove && item.rightsStatus !== 'approved'"
            variant="outline"
            class="min-h-11"
            @click="approve(item.id)"
            >Tinjau hak media</UiButton
          ><a
            v-if="item.scanStatus === 'clean'"
            :href="'/api/v1/admin/media/' + item.id + '/download'"
            class="inline-flex min-h-11 items-center text-sm underline"
            >Unduh privat (diaudit)</a
          >
        </div>
      </article>
      <p v-if="data && !data.length" class="rounded-xl border bg-white p-8">
        Belum ada berkas media dalam cakupan akunmu.
      </p>
    </div>
  </section>
</template>
