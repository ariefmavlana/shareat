<script setup lang="ts">
import { Share2, Link } from '@lucide/vue'
const props = defineProps<{ title: string; url: string }>()
const notice = ref('')
async function copy() {
  try {
    await navigator.clipboard.writeText(props.url)
    notice.value = 'Tautan berhasil disalin.'
  } catch {
    notice.value = 'Salin tautan berikut: ' + props.url
  }
}
async function share() {
  try {
    if (navigator.share)
      await navigator.share({ title: props.title, url: props.url })
    else await copy()
  } catch {
    notice.value = 'Berbagi dibatalkan. Anda tetap dapat menyalin tautan.'
  }
}
</script>
<template>
  <div>
    <div class="flex flex-wrap gap-3">
      <UiButton variant="outline" class="min-h-11" @click="share"
        ><Share2 aria-hidden="true" class="size-4" />Bagikan</UiButton
      ><UiButton variant="ghost" class="min-h-11" @click="copy"
        ><Link aria-hidden="true" class="size-4" />Salin tautan</UiButton
      >
    </div>
    <p role="status" class="mt-2 break-all text-xs">{{ notice }}</p>
  </div>
</template>
