<script setup lang="ts">
import { LogOut, ArrowUpRight } from '@lucide/vue'
const { session, mutate } = useStaff()
const error = ref('')
async function logout() {
  try {
    await mutate('/api/v1/auth/logout', 'POST')
    session.value = null
    await navigateTo('/admin/login')
  } catch (e) {
    error.value = staffError(e)
  }
}
</script>
<template>
  <div class="min-h-screen bg-[#f2f6f6]">
    <header class="border-b bg-white">
      <div
        class="container flex flex-wrap items-center justify-between gap-4 py-5"
      >
        <div class="flex items-center gap-4">
          <BrandMark /><span class="rounded-full border px-3 py-1 text-xs"
            >Ruang tim</span
          >
        </div>
        <div class="flex items-center gap-3 text-sm">
          <NuxtLink to="/" class="inline-flex min-h-11 items-center gap-2"
            >Website<ArrowUpRight class="size-4" /></NuxtLink
          ><UiButton
            v-if="session"
            variant="outline"
            class="min-h-11"
            @click="logout"
            ><LogOut class="size-4" />Keluar</UiButton
          >
        </div>
      </div>
    </header>
    <nav
      v-if="session"
      aria-label="Navigasi CMS"
      class="container flex flex-wrap gap-6 border-b py-4 text-sm"
    >
      <NuxtLink to="/admin">Konten</NuxtLink
      ><NuxtLink to="/admin/media">Media</NuxtLink
      ><NuxtLink
        v-if="session.user.roles.some((x) => ['admin', 'operator'].includes(x))"
        to="/admin/settings"
        >Kontak</NuxtLink
      ><NuxtLink v-if="session.user.roles.includes('admin')" to="/admin/team"
        >Tim & mitra</NuxtLink
      ><NuxtLink
        v-if="session.user.roles.some((x) => ['admin', 'auditor'].includes(x))"
        to="/admin/audit"
        >Audit</NuxtLink
      ><span class="ml-auto text-xs text-muted-foreground">{{
        session.user.email
      }}</span>
    </nav>
    <p v-if="error" role="alert" class="container py-3 error">{{ error }}</p>
    <main class="container py-10"><slot /></main>
  </div>
</template>
