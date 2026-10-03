<script setup lang="ts">
import type { ContentBody } from '~~/shared/contracts/content'
const props = defineProps<{ initial?: ContentBody; locked?: boolean }>()
const emit = defineEmits<{ save: [body: ContentBody] }>()
const { data: programs } = await useFetch('/api/v1/public/content', {
  query: { kind: 'program' },
  key: 'program-list',
})
const { data: settings } = await useSiteSettings()
const form = reactive({
  ...props.initial,
  title: props.initial?.title ?? '',
  summary: props.initial?.summary ?? '',
  activityStatus: props.initial?.activityStatus ?? 'planning',
  demo: props.initial?.demo ?? settings.value?.demo ?? true,
  sortOrder: props.initial?.sortOrder ?? 0,
})
const paragraphs = ref(props.initial?.paragraphs.join('\n\n') ?? '')
function submit() {
  const body = {
    ...form,
    sortOrder: Number(form.sortOrder),
    paragraphs: paragraphs.value
      .split(/\n\s*\n/)
      .map((x) => x.trim())
      .filter(Boolean),
  }
  for (const key of [
    'programSlug',
    'location',
    'responsible',
    'schedule',
    'author',
    'effectiveDate',
    'imageId',
    'imageAlt',
  ] as const)
    if (!body[key]) body[key] = undefined
  emit('save', body)
}
</script>
<template>
  <form class="grid gap-6" @submit.prevent="submit">
    <fieldset :disabled="locked" class="grid gap-6">
      <label class="field"
        >Judul<UiInput
          v-model="form.title"
          required
          minlength="3"
          maxlength="140"
          class="min-h-11" /></label
      ><label class="field"
        >Ringkasan<UiTextarea
          v-model="form.summary"
          required
          minlength="15"
          maxlength="320"
          rows="3" /></label
      ><label class="field"
        >Isi — pisahkan paragraf dengan baris kosong<UiTextarea
          v-model="paragraphs"
          required
          rows="10"
      /></label>
      <div class="grid gap-5 md:grid-cols-2">
        <label class="field"
          >Program terkait<select v-model="form.programSlug">
            <option :value="undefined">Tidak terkait program</option>
            <option v-for="p in programs?.items" :key="p.id" :value="p.slug">
              {{ p.title }}
            </option>
          </select></label
        ><label class="field"
          >Status kegiatan<select v-model="form.activityStatus">
            <option value="planning">Rencana kegiatan</option>
            <option value="ongoing">Sedang berjalan</option>
            <option value="completed">Selesai</option>
          </select></label
        ><label class="field"
          >Lokasi aman<UiInput
            v-model="form.location"
            maxlength="100"
            placeholder="Kota / kabupaten" /></label
        ><label class="field"
          >Penanggung jawab<UiInput
            v-model="form.responsible"
            maxlength="120" /></label
        ><label class="field"
          >Jadwal<UiInput
            v-model="form.schedule"
            maxlength="150"
            placeholder="Cantumkan zona waktu bila perlu" /></label
        ><label class="field"
          >Penulis<UiInput v-model="form.author" maxlength="120" /></label
        ><label class="field"
          >Tanggal berlaku / versi<UiInput
            v-model="form.effectiveDate"
            type="date" /></label
        ><label class="field"
          >Urutan tampil<UiInput
            v-model="form.sortOrder"
            type="number"
            min="0"
            max="1000" /></label
        ><label class="field"
          >ID media berizin<UiInput
            v-model="form.imageId"
            placeholder="UUID media yang sudah disetujui" /></label
        ><label class="field"
          >Deskripsi gambar<UiInput v-model="form.imageAlt" maxlength="200"
        /></label>
      </div>
      <label class="flex items-center gap-3 text-sm"
        ><input v-model="form.demo" type="checkbox" class="size-5" />Konten ini
        merupakan data demo</label
      >
    </fieldset>
    <UiButton
      type="submit"
      :disabled="locked"
      class="min-h-12 justify-self-start"
      >Simpan draft</UiButton
    >
  </form>
</template>
