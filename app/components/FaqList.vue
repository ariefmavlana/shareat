<script setup lang="ts">
import type { PublicContent } from '~~/shared/contracts/content'
defineProps<{ items: PublicContent[] }>()
</script>
<template>
  <UiAccordion type="single" collapsible
    ><UiAccordionItem v-for="item in items" :key="item.id" :value="item.id"
      ><UiAccordionTrigger class="py-6 text-left text-base">{{
        item.title
      }}</UiAccordionTrigger
      ><UiAccordionContent
        class="text-base leading-relaxed text-muted-foreground"
        ><p
          v-for="(paragraph, index) in item.paragraphs"
          :key="index"
          class="mb-3"
        >
          {{ paragraph }}
        </p></UiAccordionContent
      ></UiAccordionItem
    ></UiAccordion
  >
</template>
