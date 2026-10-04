<script setup lang="ts">
import { MessageCircle, Clock, Copy, ArrowUpRight } from '@lucide/vue'
const { data: settings, error } = await useSiteSettings()
if (error.value)
  throw createError({
    statusCode: 503,
    statusMessage: 'Informasi kontak sementara tidak tersedia',
  })
const notice = ref('')
const topic = ref('program Shareat')
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
  <div>
    <PageIntro
      title="Kebaikan dimulai dari percakapan."
      description="Punya pertanyaan, ide kolaborasi, atau informasi yang perlu dikoreksi? Kami ingin mendengarnya."
      eyebrow="Mari terhubung"
      current="Kontak"
    />
    <section
      class="container section grid items-start gap-10 lg:grid-cols-[1.25fr_1fr]"
    >
      <div class="surface overflow-hidden">
        <div class="border-b bg-[#f0f8f5] p-6 sm:p-8">
          <span class="icon-tile mb-5 bg-white"
            ><MessageCircle class="size-7" aria-hidden="true"
          /></span>
          <h2 class="text-2xl">Sapa tim Shareat</h2>
          <p class="mt-3 text-sm text-muted-foreground">
            Pilih topik agar percakapanmu lebih terarah.
          </p>
        </div>
        <div class="p-6 sm:p-8">
          <template v-if="settings?.contact">
            <label class="field mb-6 text-sm"
              >Saya ingin membicarakan<select v-model="topic" class="min-h-12">
                <option value="program Shareat">Informasi program</option>
                <option value="peluang kolaborasi komunitas">
                  Kolaborasi komunitas
                </option>
                <option value="koreksi informasi di website">
                  Koreksi informasi
                </option>
                <option value="pertanyaan umum tentang Shareat">
                  Pertanyaan lainnya
                </option>
              </select></label
            >
            <div class="mb-6 rounded-xl bg-muted p-5">
              <p
                class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Nomor WhatsApp {{ settings.demo ? 'sementara · demo' : 'tim' }}
              </p>
              <p class="mt-2 break-all text-2xl font-extrabold tracking-tight">
                +{{ settings.contact.phone }}
              </p>
              <p
                class="mt-3 flex items-start gap-2 text-xs text-muted-foreground"
              >
                <Clock class="mt-0.5 size-4 shrink-0" aria-hidden="true" />{{
                  settings.contact.hours
                }}
              </p>
            </div>
            <div class="flex flex-wrap gap-3">
              <ContactButton :context="topic" label="Buka WhatsApp" /><UiButton
                variant="outline"
                class="min-h-12"
                @click="copy"
                ><Copy class="size-4" aria-hidden="true" />Salin nomor</UiButton
              >
            </div>
            <p
              role="status"
              aria-live="polite"
              class="mt-3 min-h-6 text-sm text-primary"
            >
              {{ notice }}
            </p>
            <p class="mt-3 text-xs leading-6 text-muted-foreground">
              Tautan membuka WhatsApp dengan pesan awal sesuai topik. Kamu dapat
              meninjau, mengubah, lalu mengirimnya sendiri.
            </p>
          </template>
          <div v-else class="empty-state">
            <h3>Kanal kontak sedang disiapkan.</h3>
            <p class="mt-3 text-sm text-muted-foreground">
              Nomor dan jam layanan akan tampil setelah dipublikasikan.
            </p>
          </div>
        </div>
      </div>
      <div>
        <span class="eyebrow">Sebelum memulai</span>
        <h2 class="text-2xl">
          Percakapan yang nyaman,<br />informasi yang terjaga.
        </h2>
        <ol class="mt-8 grid gap-6">
          <li
            v-for="(tip, index) in [
              {
                title: 'Ceritakan kebutuhanmu',
                text: 'Sebutkan program atau topik yang ingin kamu kenali. Pesan singkat sudah cukup untuk memulai.',
              },
              {
                title: 'Jaga informasi pribadi',
                text: 'Hindari mengirim dokumen identitas dan data pribadi penerima manfaat.',
              },
              {
                title: 'Perhatikan jam layanan',
                text: 'Membuka tautan belum berarti pesan terkirim atau tim sudah membalas. WhatsApp memiliki kebijakan layanan tersendiri.',
              },
            ]"
            :key="tip.title"
            class="flex gap-4"
          >
            <span class="step-number !size-9 shrink-0 text-xs">{{
              index + 1
            }}</span>
            <div>
              <h3 class="text-base tracking-normal">{{ tip.title }}</h3>
              <p class="mt-2 text-sm leading-7 text-muted-foreground">
                {{ tip.text }}
              </p>
            </div>
          </li>
        </ol>
        <div class="mt-8 rounded-xl border bg-sand p-5">
          <p class="text-sm font-bold">Menggunakan desktop?</p>
          <p class="mt-2 text-xs leading-6 text-muted-foreground">
            Jika aplikasi tidak terbuka, gunakan WhatsApp Web atau salin nomor
            di samping untuk memulai percakapan.
          </p>
          <a
            href="https://web.whatsapp.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-link mt-2 text-xs"
            >Buka WhatsApp Web<ArrowUpRight class="size-4" aria-hidden="true"
          /></a>
        </div>
        <p class="mt-5 text-xs leading-6 text-muted-foreground">
          Kanal ini bukan layanan darurat dan tidak menerima permintaan
          transfer.
        </p>
      </div>
    </section>
    <section class="border-t bg-muted">
      <div
        class="container flex flex-wrap items-center justify-between gap-5 py-8"
      >
        <div>
          <h2 class="text-xl">Mungkin jawabannya sudah tersedia.</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            Kenali program dan cara berpartisipasi melalui pertanyaan umum.
          </p>
        </div>
        <NuxtLink to="/faq" class="text-link"
          >Lihat pertanyaan umum<ArrowUpRight class="size-4" aria-hidden="true"
        /></NuxtLink>
      </div>
    </section>
  </div>
</template>
