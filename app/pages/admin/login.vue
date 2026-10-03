<script setup lang="ts">
import { ShieldCheck } from '@lucide/vue'
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Masuk ruang tim | Shareat', robots: 'noindex, nofollow' })
const form = reactive({ email: '', password: '', totp: '' })
const loading = ref(false),
  error = ref('')
async function login() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/v1/auth/login', { method: 'POST', body: form })
    form.password = ''
    form.totp = ''
    await useStaff().load()
    await navigateTo('/admin')
  } catch (e) {
    error.value = staffError(e)
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <section class="mx-auto max-w-lg rounded-2xl border bg-white p-8">
    <ShieldCheck class="mb-6 size-9 text-primary" aria-hidden="true" /><span
      class="eyebrow"
      >Akses privat</span
    >
    <h1 class="text-3xl">Masuk ruang tim.</h1>
    <p class="my-5 text-sm text-muted-foreground">
      Gunakan akun undangan dan kode authenticator. Semua tindakan publikasi
      serta perubahan konfigurasi dicatat.
    </p>
    <form class="grid gap-5" @submit.prevent="login">
      <label class="field"
        >Email<UiInput
          v-model="form.email"
          type="email"
          autocomplete="username"
          required
          class="min-h-12" /></label
      ><label class="field"
        >Kata sandi<UiInput
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          required
          maxlength="200"
          class="min-h-12" /></label
      ><label class="field"
        >Kode authenticator<UiInput
          v-model="form.totp"
          inputmode="numeric"
          autocomplete="one-time-code"
          pattern="[0-9]{6}"
          minlength="6"
          maxlength="6"
          required
          class="min-h-12"
      /></label>
      <p v-if="error" role="alert" class="error text-sm">{{ error }}</p>
      <UiButton type="submit" :disabled="loading" class="min-h-12 text-base">{{
        loading ? 'Memeriksa akses…' : 'Masuk dengan MFA'
      }}</UiButton>
    </form>
    <NuxtLink
      to="/admin/activate"
      class="mt-5 inline-block text-sm underline underline-offset-4"
      >Aktivasi undangan akun</NuxtLink
    >
    <p class="mt-5 text-xs text-muted-foreground">
      Jika akses bermasalah, hubungi operator melalui kanal privat yang sudah
      diverifikasi. Pemulihan memerlukan dua penanggung jawab.
    </p>
  </section>
</template>
