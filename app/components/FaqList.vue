<script setup lang="ts">
import type { PublicContent } from '~~/shared/contracts/content'
defineProps<{ items: PublicContent[] }>()
</script>
<template>
  <UiAccordion v-if="items.length" type="single" collapsible class="grid gap-3">
    <UiAccordionItem
      v-for="(item, index) in items"
      :key="item.id"
      :value="item.id"
      class="rounded-xl border bg-white px-5 data-[state=open]:border-primary/40"
    >
      <UiAccordionTrigger
        class="min-h-18 items-center py-5 text-left text-sm font-bold leading-6"
        ><span class="flex gap-4"
          ><span class="text-xs text-primary" aria-hidden="true">{{
            String(index + 1).padStart(2, '0')
          }}</span
          >{{ item.title }}</span
        ></UiAccordionTrigger
      >
      <UiAccordionContent class="text-sm leading-7 text-muted-foreground"
        ><p v-for="(paragraph, i) in item.paragraphs" :key="i" class="mb-3">
          {{ paragraph }}
        </p></UiAccordionContent
      >
    </UiAccordionItem>
  </UiAccordion>
  <div v-else class="empty-state">
    <p>Pertanyaan umum sedang disiapkan.</p>
    <NuxtLink to="/kontak" class="text-link mt-3"
      >Hubungi tim untuk bantuan</NuxtLink
    >
  </div>
</template>
