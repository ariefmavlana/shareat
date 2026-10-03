<script setup lang="ts">
import type {
  ContentBody,
  ContentKind,
  ContentRecord,
} from '~~/shared/contracts/content'
definePageMeta({ layout: 'admin', middleware: 'staff' })
const { mutate, session } = useStaff()
const error = ref(''),
  loading = ref(false),
  kind = ref<ContentKind>('initiative'),
  slug = ref('')
const allowed = computed(() =>
  session.value?.user.roles.includes('partner_editor') &&
  !session.value.user.roles.includes('editor')
    ? ['initiative']
    : ['program', 'initiative', 'story', 'page', 'faq'],
)
async function create(body: ContentBody) {
  loading.value = true
  error.value = ''
  try {
    const record = await mutate<ContentRecord>(
      '/api/v1/admin/content',
      'POST',
      { kind: kind.value, slug: slug.value || undefined, body },
    )
    await navigateTo('/admin/content/' + record.id)
  } catch (e) {
    error.value = staffError(e)
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <section class="max-w-4xl">
    <NuxtLink to="/admin" class="text-sm underline">← Daftar konten</NuxtLink>
    <h1 class="mb-8 mt-6 text-3xl">Buat draft baru.</h1>
    <div class="mb-6 grid gap-5 md:grid-cols-2">
      <label class="field"
        >Jenis konten<select v-model="kind">
          <option v-for="k in allowed" :key="k" :value="k">{{ k }}</option>
        </select></label
      ><label class="field"
        >Slug URL (opsional)<UiInput
          v-model="slug"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          maxlength="100"
          placeholder="rencana-kegiatan"
      /></label>
    </div>
    <p v-if="error" role="alert" class="mb-5 error">{{ error }}</p>
    <div class="rounded-2xl border bg-white p-7">
      <AdminContentForm :locked="loading" @save="create" />
    </div>
  </section>
</template>
