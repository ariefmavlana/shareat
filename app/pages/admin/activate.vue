<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const form = reactive({ token: '', password: '', totp: '' })
const secret = ref(''),
  error = ref(''),
  notice = ref(''),
  loading = ref(false)
async function enroll() {
  loading.value = true
  try {
    const data = await $fetch('/api/v1/auth/enroll', {
      method: 'POST',
      body: { token: form.token, password: form.password },
    })
    secret.value = data.secret
    form.password = ''
    notice.value =
      'Tambahkan secret ini pada authenticator. Selesaikan dalam 5 menit.'
  } catch (e) {
    error.value = staffError(e)
  } finally {
    loading.value = false
  }
}
async function activate() {
  loading.value = true
  try {
    await $fetch('/api/v1/auth/activate', {
      method: 'POST',
      body: { token: form.token, totp: form.totp },
    })
    secret.value = ''
    form.token = ''
    notice.value =
      'Aktivasi selesai. Gunakan kode authenticator berikutnya untuk masuk.'
  } catch (e) {
    error.value = staffError(e)
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <section class="mx-auto max-w-xl rounded-2xl border bg-white p-8">
    <span class="eyebrow">Undangan privat</span>
    <h1 class="mb-6 text-3xl">Aktifkan akun tim.</h1>
    <p v-if="error" role="alert" class="mb-5 error">{{ error }}</p>
    <p v-if="notice" role="status" class="mb-5">{{ notice }}</p>
    <form v-if="!secret" class="grid gap-5" @submit.prevent="enroll">
      <label class="field"
        >Token undangan<UiInput
          v-model="form.token"
          autocomplete="off"
          required
          maxlength="64" /></label
      ><label class="field"
        >Kata sandi baru (minimum 12 karakter)<UiInput
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          minlength="12"
          maxlength="200"
          required /></label
      ><UiButton type="submit" :disabled="loading" class="min-h-12"
        >Siapkan authenticator</UiButton
      >
    </form>
    <form v-else class="grid gap-5" @submit.prevent="activate">
      <p class="break-all rounded-xl bg-muted p-5 font-mono text-sm">
        {{ secret }}
      </p>
      <p class="text-xs">
        Simpan secret hanya di authenticator. Jangan bagikan atau mengambil
        tangkapan layar untuk publik.
      </p>
      <label class="field"
        >Kode authenticator<UiInput
          v-model="form.totp"
          required
          pattern="[0-9]{6}"
          inputmode="numeric"
          maxlength="6" /></label
      ><UiButton type="submit" :disabled="loading" class="min-h-12"
        >Selesaikan aktivasi</UiButton
      >
    </form>
    <NuxtLink to="/admin/login" class="mt-6 inline-block underline"
      >Kembali ke halaman masuk</NuxtLink
    >
  </section>
</template>
