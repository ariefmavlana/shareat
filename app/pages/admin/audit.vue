<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'staff' })
const { data, error } = await useFetch('/api/v1/admin/audit')
</script>
<template>
  <section>
    <span class="eyebrow">Catatan kontrol</span>
    <h1 class="mb-8 text-3xl">Audit tindakan.</h1>
    <p v-if="error" role="alert" class="error">
      Akses audit tidak tersedia untuk akun ini.
    </p>
    <ol class="grid gap-3">
      <li
        v-for="entry in data"
        :key="entry.id"
        class="rounded-xl border bg-white p-5 text-sm"
      >
        <p class="font-semibold">{{ entry.action }}</p>
        <p class="mt-2 break-all text-xs text-muted-foreground">
          Target {{ entry.targetId }} · {{ entry.createdAt }}
        </p>
        <p v-if="entry.reason" class="mt-3">{{ entry.reason }}</p>
        <p class="mt-2 text-xs text-muted-foreground">
          Request {{ entry.requestId }}
        </p>
      </li>
    </ol>
  </section>
</template>
