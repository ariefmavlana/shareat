<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'
import { contactLink } from '~~/shared/contracts/web'
const props = withDefaults(
  defineProps<{ context?: string; label?: string; outline?: boolean }>(),
  { context: 'program Shareat', label: 'Hubungi melalui WhatsApp' },
)
const { data } = await useSiteSettings()
const link = computed(() =>
  data.value?.contact
    ? contactLink(data.value.contact.phone, props.context)
    : null,
)
</script>
<template>
  <UiButton
    v-if="link"
    as-child
    :variant="outline ? 'outline' : 'default'"
    class="min-h-12 px-5 text-base"
    ><a
      :href="link"
      target="_blank"
      rel="noopener noreferrer"
      aria-description="Membuka layanan eksternal WhatsApp. Anda meninjau dan mengirim pesan sendiri."
      >{{ label
      }}<ArrowUpRight class="size-4" aria-hidden="true" /></a></UiButton
  ><UiButton v-else disabled class="min-h-12 text-base"
    >Kontak sedang disiapkan</UiButton
  >
</template>
