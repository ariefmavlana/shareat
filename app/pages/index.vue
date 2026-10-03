<script setup lang="ts">
import {
  ArrowUpRight,
  ArrowRight,
  Heart,
  BookOpen,
  Utensils,
  GraduationCap,
  Check,
} from '@lucide/vue'
const { data: settings } = await useSiteSettings()
const { data, error } = await useFetch('/api/v1/public/home', {
  key: 'home-content',
})
if (error.value)
  throw createError({
    statusCode: error.value.statusCode ?? 503,
    statusMessage: 'Informasi sedang tidak tersedia',
  })
const programs = computed(() => data.value?.programs ?? [])
const initiatives = computed(() => data.value?.initiatives ?? [])
const stories = computed(() => data.value?.stories ?? [])
const faqs = computed(() => data.value?.faqs ?? [])
usePublicSeo(
  'Bersama, berbagi lebih berarti.',
  'Kenali Share Eat, Share Knowledge, dan Share Book. Jelajahi rencana kegiatan dan buka percakapan kolaborasi bersama Shareat.',
  {
    siteUrl: settings.value?.siteUrl ?? 'http://localhost:3000',
    demo: settings.value?.demo ?? true,
  },
)
</script>
<template>
  <div>
    <section
      class="container grid items-center gap-14 pb-16 pt-14 lg:grid-cols-[1.15fr_1fr] lg:pb-24 lg:pt-20"
    >
      <div>
        <span class="eyebrow">Ruang berbagi untuk Indonesia</span>
        <h1 class="max-w-2xl">
          Bersama,<br />berbagi lebih<br /><span class="text-primary"
            >berarti.</span
          >
        </h1>
        <p class="mt-7 max-w-md text-lg text-muted-foreground">
          Dari sepiring makanan, ilmu yang dibagikan, hingga buku yang membuka
          harapan. Kebaikan punya banyak cara untuk dimulai.
        </p>
        <div class="mt-9 flex flex-wrap gap-3">
          <UiButton as-child class="min-h-13 rounded-full px-7 text-base"
            ><NuxtLink to="/program"
              >Temukan ruang berbagi<ArrowUpRight
                class="size-5" /></NuxtLink></UiButton
          ><UiButton
            as-child
            variant="ghost"
            class="min-h-13 rounded-full px-6 text-base"
            ><NuxtLink to="/tentang"
              >Kenali Shareat<ArrowRight class="size-4" /></NuxtLink
          ></UiButton>
        </div>
        <p class="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <span class="grid size-5 place-items-center rounded-full bg-[#e3eadb]"
            ><Check class="size-3" /></span
          >Informasi yang jelas. Langkah yang sederhana.
        </p>
      </div>
      <div class="relative mx-auto w-full max-w-lg">
        <div
          class="mb-4 flex items-center justify-between text-xs font-medium text-muted-foreground"
        >
          <span>KECIL LANGKAHNYA. LUAS MAKNA BERBAGINYA.</span
          ><Heart class="size-4 text-primary" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div
            class="relative flex min-h-60 flex-col justify-between rounded-[2.5rem_2.5rem_.7rem_2.5rem] bg-[#dce8c6] p-5 sm:p-7"
          >
            <Utensils
              class="size-14 text-[#42643c]"
              :stroke-width="1.1"
              aria-hidden="true"
            />
            <div>
              <span class="text-xs text-[#42643c]">01 / PANGAN</span>
              <p
                class="mt-2 text-2xl sm:text-3xl font-semibold leading-tight tracking-tight"
              >
                Hangatnya<br />berbagi.
              </p>
            </div>
          </div>
          <div
            class="relative mt-12 flex min-h-60 flex-col justify-between rounded-[2.5rem_.7rem_2.5rem_2.5rem] bg-[#efcfb2] p-5 sm:p-7"
          >
            <GraduationCap
              class="size-14 text-[#754218]"
              :stroke-width="1.1"
              aria-hidden="true"
            />
            <div>
              <span class="text-xs text-[#754218]">02 / PENGETAHUAN</span>
              <p
                class="mt-2 text-2xl sm:text-3xl font-semibold leading-tight tracking-tight"
              >
                Belajar.<br />Bertumbuh.
              </p>
            </div>
          </div>
          <div
            class="-mt-8 flex min-h-52 flex-col justify-between rounded-[2.5rem_.7rem_2.5rem_2.5rem] bg-[#e3def0] p-5 sm:p-7"
          >
            <BookOpen
              class="size-14 text-[#665184]"
              :stroke-width="1.1"
              aria-hidden="true"
            />
            <div>
              <span class="text-xs text-[#665184]">03 / LITERASI</span>
              <p class="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                Buka dunia.
              </p>
            </div>
          </div>
          <div class="flex items-center justify-center p-5">
            <div class="text-center">
              <div
                class="mx-auto mb-4 grid size-18 place-items-center rounded-full border border-[#b6c7b0]"
              >
                <Heart
                  class="size-7 text-primary"
                  :stroke-width="1.2"
                  aria-hidden="true"
                />
              </div>
              <p class="text-sm text-muted-foreground">
                Berawal dari peduli.<br />Berlanjut bersama.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="border-y bg-[#eef1e9]">
      <div
        class="container flex flex-wrap items-center justify-between gap-6 py-7 text-sm"
      >
        <p class="font-medium">Setiap bentuk kepedulian punya tempat.</p>
        <div class="flex flex-wrap gap-x-7 gap-y-3 text-muted-foreground">
          <span>Berbagi waktu</span><span>Berbagi pengetahuan</span
          ><span>Berbagi jejaring</span>
        </div>
      </div>
    </section>
    <section class="container section">
      <div class="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <span class="eyebrow">Tiga cara untuk memulai</span>
          <h2>Temukan yang dekat<br />dengan kepedulianmu.</h2>
        </div>
        <p class="max-w-sm text-muted-foreground">
          Mengenal kebutuhan menjadi langkah pertama. Pilih program yang ingin
          kamu pahami lebih jauh.
        </p>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <ContentCard v-for="item in programs" :key="item.id" :item="item" />
      </div>
      <p v-if="!programs.length" class="rounded-xl border p-6">
        Informasi program sedang disiapkan.
      </p>
    </section>
    <section class="bg-white">
      <div class="container section">
        <div class="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span class="eyebrow">Inisiatif & rencana kegiatan</span>
            <h2>Kebaikan yang<br />bisa kita bicarakan.</h2>
          </div>
          <NuxtLink
            to="/inisiatif"
            class="inline-flex items-center gap-2 border-b pb-2 text-sm font-semibold"
            >Lihat semua inisiatif<ArrowUpRight class="size-4"
          /></NuxtLink>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <ContentCard
            v-for="item in initiatives"
            :key="item.id"
            :item="item"
          />
        </div>
        <p v-if="!initiatives.length" class="rounded-xl border p-6">
          Belum ada inisiatif yang dipublikasikan. Kenali program atau hubungi
          tim untuk informasi.
        </p>
      </div>
    </section>
    <section class="container section grid gap-12 lg:grid-cols-2">
      <div>
        <span class="eyebrow">Langkah sederhana</span>
        <h2>
          Mulai dari ingin tahu.<br />Lanjutkan dengan<br /><span
            class="text-primary"
            >percakapan.</span
          >
        </h2>
        <p class="mt-6 max-w-md text-muted-foreground">
          Tak perlu memulai dengan hal besar. Pahami programnya, temukan
          kecocokannya, dan bicarakan bersama tim.
        </p>
      </div>
      <ol class="grid gap-7">
        <li
          v-for="(step, index) in [
            {
              title: 'Kenali ruang berbaginya',
              text: 'Jelajahi program dan baca konteks rencana kegiatannya.',
            },
            {
              title: 'Temukan peran yang sesuai',
              text: 'Pikirkan waktu, pengetahuan, atau jejaring yang ingin kamu bagikan.',
            },
            {
              title: 'Buka percakapan bersama tim',
              text: 'Hubungi melalui WhatsApp. Tinjau pesan, lalu kirim sendiri.',
            },
          ]"
          :key="step.title"
          class="flex gap-5 border-b pb-7"
        >
          <span
            class="grid size-11 shrink-0 place-items-center rounded-full border text-sm"
            >0{{ index + 1 }}</span
          >
          <div>
            <h3 class="text-xl">{{ step.title }}</h3>
            <p class="mt-2 text-sm text-muted-foreground">{{ step.text }}</p>
          </div>
        </li>
      </ol>
    </section>
    <section class="container">
      <div
        class="grid gap-10 rounded-3xl bg-[#173f32] px-7 py-12 text-white md:grid-cols-[1.4fr_1fr] md:px-12"
      >
        <div>
          <span class="eyebrow !text-[#cde0b3]"
            >Keterbukaan sebagai fondasi</span
          >
          <h2 class="text-3xl md:text-4xl">
            Kepercayaan tumbuh<br />dari informasi yang jelas.
          </h2>
        </div>
        <div>
          <p class="text-sm leading-relaxed text-[#d3dfd7]">
            Kenali proses review, status kesiapan platform, dan cara informasi
            diperbarui. Rencana dan laporan kegiatan selalu dibedakan.
          </p>
          <NuxtLink
            to="/transparansi"
            class="mt-6 inline-flex min-h-11 items-center gap-3 font-medium"
            >Lihat transparansi<ArrowUpRight class="size-4"
          /></NuxtLink>
        </div>
      </div>
    </section>
    <section class="container section">
      <div class="mb-10 flex flex-wrap justify-between gap-5">
        <div>
          <span class="eyebrow">Cerita berbagi</span>
          <h2>Ruang untuk cerita<br />dan pembelajaran.</h2>
        </div>
        <NuxtLink
          to="/cerita"
          class="self-end border-b pb-2 text-sm font-semibold"
          >Jelajahi cerita ↗</NuxtLink
        >
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <ContentCard v-for="item in stories" :key="item.id" :item="item" />
      </div>
    </section>
    <section
      class="container section grid gap-12 border-t md:grid-cols-[1fr_1.3fr]"
    >
      <div>
        <span class="eyebrow">Pertanyaan umum</span>
        <h2>Lebih jelas,<br />lebih mudah.</h2>
        <NuxtLink
          to="/faq"
          class="mt-6 inline-flex min-h-11 items-center gap-3 text-sm font-medium"
          >Semua pertanyaan<ArrowRight class="size-4"
        /></NuxtLink>
      </div>
      <FaqList :items="faqs" />
    </section>
    <section class="container pb-8">
      <div class="rounded-3xl bg-[#e4eccf] px-7 py-12 text-center md:p-16">
        <span class="eyebrow">Mari mulai bersama</span>
        <h2>Ada kebaikan yang<br />ingin kamu bagikan?</h2>
        <p class="mx-auto mb-7 mt-5 max-w-md text-muted-foreground">
          Kami ingin mendengar idemu. Kenali kanal kontak, lalu buka percakapan
          bersama tim Shareat.
        </p>
        <UiButton as-child class="min-h-12 rounded-full px-7 text-base"
          ><NuxtLink to="/kontak"
            >Mari berbincang<ArrowUpRight class="size-5" /></NuxtLink
        ></UiButton>
      </div>
    </section>
  </div>
</template>
