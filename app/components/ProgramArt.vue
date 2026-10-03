<script setup lang="ts">
import { BookOpen, Utensils, Sparkles, GraduationCap, Heart } from '@lucide/vue'
defineProps<{ program?: string; large?: boolean }>()
</script>
<template>
  <div
    class="relative isolate grid overflow-hidden place-items-center"
    :class="[
      large ? 'min-h-72' : 'aspect-[16/10]',
      program === 'share-book'
        ? 'bg-[#e9e4f4] text-[#554476]'
        : program === 'share-knowledge'
          ? 'bg-[#f4dec9] text-[#995220]'
          : 'bg-[#dfe9ca] text-[#365535]',
    ]"
    aria-hidden="true"
  >
    <div
      class="absolute size-64 rounded-full border border-current opacity-15 -right-16 -top-24"
    />
    <div
      class="absolute size-44 rounded-full border border-current opacity-15 -left-10 -bottom-20"
    />
    <div
      class="relative grid size-28 rotate-[-8deg] place-items-center rounded-[2rem] bg-white/75 shadow-[8px_10px_0_0_rgba(0,0,0,.04)]"
    >
      <BookOpen
        v-if="program === 'share-book'"
        class="size-14"
        :stroke-width="1.4"
      /><GraduationCap
        v-else-if="program === 'share-knowledge'"
        class="size-14"
        :stroke-width="1.4"
      /><Utensils v-else class="size-14" :stroke-width="1.4" />
    </div>
    <Sparkles
      class="absolute top-[20%] left-[18%] size-6"
      :stroke-width="1.3"
    /><Heart
      class="absolute bottom-[20%] right-[20%] size-5"
      :stroke-width="1.3"
    />
  </div>
</template>
