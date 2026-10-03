<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'staff' })
const { data, refresh } = await useFetch('/api/v1/admin/settings')
const { mutate } = useStaff()
const form = reactive({ phone: '', hours: '', ownershipVerified: false })
const error = ref(''),
  notice = ref('')
async function propose() {
  try {
    await mutate('/api/v1/admin/settings/contact', 'POST', form)
    notice.value = 'Usulan disimpan. Nomor publik belum berubah.'
    await refresh()
  } catch (e) {
    error.value = staffError(e)
  }
}
async function approve(id: string) {
  try {
    const result = await mutate<{ recoveryToken?: string }>(
      '/api/v1/admin/settings/' + id + '/approve',
      'POST',
    )
    notice.value = result.recoveryToken
      ? 'Token pemulihan privat (sampaikan lewat kanal terverifikasi): ' +
        result.recoveryToken
      : 'Perubahan disetujui oleh identitas kedua.'
    await refresh()
    await refreshNuxtData('site-settings')
  } catch (e) {
    error.value = staffError(e)
  }
}
</script>
<template>
  <section>
    <span class="eyebrow">Pengaturan kontak</span>
    <h1 class="mb-7 text-3xl">Kanal yang dapat dipercaya.</h1>
    <p class="mb-7 text-muted-foreground">
      Perubahan nomor publik memerlukan pengusul dan penyetuju yang berbeda.
    </p>
    <p v-if="error" role="alert" class="mb-5 error">{{ error }}</p>
    <p v-if="notice" role="status" class="mb-5">{{ notice }}</p>
    <div class="grid items-start gap-8 lg:grid-cols-2">
      <form
        class="grid gap-5 rounded-2xl border bg-white p-7"
        @submit.prevent="propose"
      >
        <label class="field"
          >Nomor internasional tanpa +<UiInput
            v-model="form.phone"
            pattern="628[0-9]{8,11}"
            required
            placeholder="628…" /></label
        ><label class="field"
          >Jam layanan dan zona waktu<UiInput
            v-model="form.hours"
            minlength="5"
            maxlength="150"
            required /></label
        ><label class="flex items-start gap-3 text-sm"
          ><input
            v-model="form.ownershipVerified"
            type="checkbox"
            required
            class="mt-1 size-5"
          />Kepemilikan kanal dan operator sudah diperiksa.</label
        ><UiButton type="submit" class="min-h-12">Usulkan perubahan</UiButton>
      </form>
      <div class="grid gap-5">
        <article
          v-for="p in data?.proposals"
          :key="p.id"
          class="rounded-2xl border bg-white p-6"
        >
          <h2 class="text-xl">Usulan {{ p.kind }}</h2>
          <pre class="my-5 whitespace-pre-wrap break-all text-sm">{{
            JSON.stringify(p.payload, null, 2)
          }}</pre>
          <UiButton class="min-h-11" @click="approve(p.id)"
            >Setujui sebagai pemeriksa</UiButton
          >
        </article>
        <p v-if="!data?.proposals.length">Tidak ada usulan yang menunggu.</p>
      </div>
    </div>
  </section>
</template>
