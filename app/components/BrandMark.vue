<script setup lang="ts">
defineProps<{ inverse?: boolean }>()
</script>
<template>
  <NuxtLink
    to="/"
    aria-label="Shareat, beranda"
    class="inline-flex shrink-0 items-center gap-2.5"
  >
    <span
      class="grid size-10 place-items-center rounded-xl bg-primary text-white"
      aria-hidden="true"
      ><svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 13c3-6 6-6 8 0 2-6 5-6 8 0M4 13c1 4 5 7 8 8 3-1 7-4 8-8"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        />
        <path
          d="M12 3v3M4 5l2 2M20 5l-2 2"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        /></svg
    ></span>
    <span
      class="text-[1.75rem] font-extrabold tracking-[-.07em]"
      :class="inverse ? 'text-white' : 'text-foreground'"
      >shareat<span :class="inverse ? 'text-aqua' : 'text-primary'"
        >.</span
      ></span
    >
  </NuxtLink>
</template>
