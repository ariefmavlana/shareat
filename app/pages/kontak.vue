<script setup lang="ts">
import { MessageCircle, Clock, Copy, ArrowUpRight } from '@lucide/vue'
const { data: settings, error } = await useSiteSettings()
if (error.value)
  throw createError({
    statusCode: 503,
    statusMessage: 'Informasi kontak sementara tidak tersedia',
  })
const notice = ref('')
async function copy() {
  try {
    await navigator.clipboard.writeText(settings.value?.contact?.phone ?? '')
    notice.value = 'Nomor berhasil disalin.'
  } catch {
    notice.value = 'Salin nomor yang ditampilkan di halaman ini.'
  }
}
usePublicSeo(
  'Mari buka percakapan.',
  'Kenali nomor WhatsApp, jam layanan, dan cara menghubungi tim Shareat untuk pertanyaan serta kolaborasi.',
  {
    siteUrl: settings.value?.siteUrl ?? 'http://localhost:3000',
    demo: settings.value?.demo ?? true,
  },
)
</script>
<template>
  <section class="container section">
    <span class="eyebrow">Terhubung dengan tim</span>
    <h1 class="max-w-3xl text-4xl md:text-6xl">
      Kebaikan dimulai<br />dari percakapan.
    </h1>
    <p class="mt-6 max-w-xl text-lg text-muted-foreground">
      Ada pertanyaan, ide kolaborasi, atau informasi yang perlu dikoreksi? Kami
      menyediakan kanal untuk membicarakannya bersama.
    </p>
    <div class="mt-12 grid gap-8 md:grid-cols-2">
      <div class="rounded-2xl border bg-white p-8">
        <MessageCircle class="mb-6 size-8 text-primary" aria-hidden="true" />
        <h2 class="text-2xl">WhatsApp tim Shareat</h2>
        <template v-if="settings?.contact"
          ><p class="my-5 text-2xl font-medium">
            +{{ settings.contact.phone }}
          </p>
          <div class="flex flex-wrap gap-3">
            <ContactButton label="Buka WhatsApp" /><UiButton
              variant="outline"
              class="min-h-12"
              @click="copy"
              ><Copy class="size-4" aria-hidden="true" />Salin nomor</UiButton
            >
          </div>
          <p role="status" class="mt-3 text-sm">{{ notice }}</p>
          <p class="mt-6 flex gap-2 text-sm text-muted-foreground">
            <Clock class="mt-1 size-4 shrink-0" aria-hidden="true" />{{
              settings.contact.hours
            }}
          </p></template
        >
        <p v-else class="mt-6">
          Nomor dan jam layanan sedang disiapkan. Kanal kontak belum
          dipublikasikan.
        </p>
      </div>
      <div class="rounded-2xl bg-[#e6edda] p-8">
        <h2 class="text-2xl">Sebelum menghubungi</h2>
        <ol
          class="mt-6 list-decimal space-y-4 pl-5 text-sm text-muted-foreground"
        >
          <li>
            WhatsApp merupakan layanan eksternal dengan kebijakan tersendiri.
          </li>
          <li>
            Tinjau pesan awal, tambahkan pertanyaan seperlunya, lalu kirim
            sendiri.
          </li>
          <li>
            Hindari membagikan dokumen identitas atau data pribadi penerima
            manfaat.
          </li>
          <li>
            Klik tautan tidak memastikan pesan terkirim atau tim sudah membalas.
          </li>
        </ol>
        <p class="mt-7 text-sm font-medium">
          Kanal ini bukan layanan darurat dan tidak menerima permintaan
          transfer.
        </p>
      </div>
    </div>
    <div class="mt-10 max-w-2xl">
      <h2 class="text-2xl">Menggunakan desktop?</h2>
      <p class="mt-4 text-muted-foreground">
        Tautan dapat dibuka melalui WhatsApp Web. Jika aplikasi tidak terbuka,
        salin nomor di atas dan mulai percakapan melalui akun WhatsApp Anda.
      </p>
      <a
        href="https://web.whatsapp.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-4 inline-flex min-h-11 items-center gap-2 underline underline-offset-4"
        >Buka WhatsApp Web<ArrowUpRight class="size-4" aria-hidden="true"
      /></a>
    </div>
  </section>
</template>
