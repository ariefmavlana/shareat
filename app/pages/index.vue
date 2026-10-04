<script setup lang="ts">
import {
  ArrowUpRight,
  ArrowRight,
  Heart,
  BookOpen,
  Utensils,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  MessageCircle,
  Compass,
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
const steps = [
  {
    icon: Compass,
    title: 'Temukan ruang berbagimu',
    text: 'Kenali program dan rencana kegiatan yang dekat dengan kepedulianmu.',
  },
  {
    icon: HeartHandshake,
    title: 'Pilih peran yang sesuai',
    text: 'Mulai dari waktu, pengetahuan, atau jejaring yang ingin kamu bagikan.',
  },
  {
    icon: MessageCircle,
    title: 'Buka percakapan',
    text: 'Bicarakan idemu bersama tim melalui WhatsApp. Tinjau pesan, lalu kirim sendiri.',
  },
]
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
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <span class="eyebrow">Ruang berbagi untuk Indonesia</span>
          <h1 class="hero-title">
            Kebaikan kecil.<br />Kesempatan<br /><em>lebih besar.</em>
          </h1>
          <p class="mt-7 max-w-md text-base leading-8 text-muted-foreground">
            Dari sepiring makanan, ilmu yang dibagikan, hingga buku yang membuka
            dunia. Bersama Shareat, temukan caramu untuk berbagi.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <NuxtLink to="/program" class="action-link"
              >Jelajahi program<ArrowUpRight
                class="size-4"
                aria-hidden="true" /></NuxtLink
            ><NuxtLink to="/tentang" class="action-link secondary"
              >Kenali Shareat<ArrowRight class="size-4" aria-hidden="true"
            /></NuxtLink>
          </div>
          <p
            class="mt-8 flex items-center gap-2.5 text-xs text-muted-foreground"
          >
            <span
              class="grid size-7 place-items-center rounded-full bg-[#e3eee5]"
              ><Heart class="size-3.5 text-primary" aria-hidden="true" /></span
            >Berbagi waktu. Berbagi ilmu. Berbagi kepedulian.
          </p>
        </div>
        <figure class="hero-art">
          <div class="hero-art-frame">
            <img
              src="/images/berbagi-bersama.webp"
              srcset="
                /images/berbagi-bersama-720.webp  720w,
                /images/berbagi-bersama.webp     1440w
              "
              sizes="(min-width: 1024px) 560px, 90vw"
              alt="Ilustrasi orang dewasa berbagi makanan, belajar, dan menata buku di ruang komunitas."
              width="1440"
              height="960"
              fetchpriority="high"
            />
          </div>
          <div class="hero-floating">
            <span class="icon-tile"
              ><HeartHandshake
                class="size-6"
                :stroke-width="1.5"
                aria-hidden="true"
            /></span>
            <div>
              <p class="text-sm font-extrabold">
                Berbeda cara, satu kepedulian.
              </p>
              <p class="mt-0.5 text-[11px] text-muted-foreground">
                Pangan · Pengetahuan · Literasi
              </p>
            </div>
          </div>
          <figcaption class="hero-caption">
            Ilustrasi konseptual · bukan dokumentasi kegiatan
          </figcaption>
        </figure>
      </div>
    </section>
    <div class="border-b bg-white">
      <div class="container grid gap-3 py-6 md:grid-cols-3">
        <NuxtLink
          v-for="item in programs.slice(0, 3)"
          :key="item.id"
          :to="'/program/' + item.slug"
          class="pillar-link"
        >
          <span
            class="icon-tile"
            :class="
              item.slug === 'share-book'
                ? 'bg-[#f2ecdb] text-[#816425]'
                : item.slug === 'share-knowledge'
                  ? 'bg-[#e8eef9] text-[#42608b]'
                  : ''
            "
            ><component
              :is="
                item.slug === 'share-book'
                  ? BookOpen
                  : item.slug === 'share-knowledge'
                    ? GraduationCap
                    : Utensils
              "
              class="size-6"
              :stroke-width="1.5"
              aria-hidden="true"
          /></span>
          <div class="min-w-0">
            <p class="font-extrabold">{{ item.title }}</p>
            <p class="text-xs text-muted-foreground">
              {{
                item.slug === 'share-book'
                  ? 'Membuka dunia lewat bacaan'
                  : item.slug === 'share-knowledge'
                    ? 'Tumbuh lewat pengetahuan'
                    : item.slug === 'share-eat'
                      ? 'Kepedulian melalui pangan'
                      : 'Kenali ruang kolaborasinya'
              }}
            </p>
          </div>
          <ArrowUpRight
            class="ml-auto size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
        </NuxtLink>
        <p v-if="!programs.length" class="py-5 text-muted-foreground">
          Informasi program sedang disiapkan.
        </p>
      </div>
    </div>
    <section class="container section">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Program Shareat</span>
          <h2>Banyak cara berbagi.<br />Temukan yang berarti.</h2>
        </div>
        <NuxtLink to="/program" class="text-link"
          >Semua program<ArrowUpRight class="size-4" aria-hidden="true"
        /></NuxtLink>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <ContentCard v-for="item in programs" :key="item.id" :item="item" />
      </div>
      <p v-if="!programs.length" class="empty-state">
        Informasi program sedang disiapkan. Kunjungi kembali untuk pembaruan.
      </p>
    </section>
    <section class="bg-[#f3f7f7]">
      <div class="container section">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Inisiatif & rencana kegiatan</span>
            <h2>Dari kepedulian,<br />menuju langkah bersama.</h2>
          </div>
          <NuxtLink to="/inisiatif" class="text-link"
            >Jelajahi inisiatif<ArrowUpRight class="size-4" aria-hidden="true"
          /></NuxtLink>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <ContentCard
            v-for="item in initiatives"
            :key="item.id"
            :item="item"
          />
        </div>
        <div v-if="!initiatives.length" class="empty-state">
          <h3>Langkah berikutnya sedang disiapkan.</h3>
          <p class="mt-3 text-sm text-muted-foreground">
            Kenali program atau hubungi tim untuk informasi kegiatan.
          </p>
          <NuxtLink to="/kontak" class="text-link mt-3"
            >Hubungi tim<ArrowRight class="size-4"
          /></NuxtLink>
        </div>
      </div>
    </section>
    <section class="container section">
      <div class="mb-12 max-w-2xl">
        <span class="eyebrow">Sesederhana tiga langkah</span>
        <h2>Kamu punya kepedulian.<br />Mari temukan jalannya.</h2>
        <p class="mt-5 text-muted-foreground">
          Tak harus memulai dengan hal besar. Ruang untuk berkontribusi bisa
          berawal dari hal yang dekat denganmu.
        </p>
      </div>
      <ol class="grid gap-7 md:grid-cols-3">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="relative border-t pt-7"
        >
          <div class="mb-6 flex items-center justify-between">
            <span class="step-number">0{{ index + 1 }}</span
            ><component
              :is="step.icon"
              class="size-7 text-primary"
              :stroke-width="1.3"
              aria-hidden="true"
            />
          </div>
          <h3>{{ step.title }}</h3>
          <p class="mt-3 text-sm leading-7 text-muted-foreground">
            {{ step.text }}
          </p>
        </li>
      </ol>
    </section>
    <section class="bg-secondary text-white">
      <div
        class="container grid items-center gap-12 py-14 md:grid-cols-[1.15fr_1fr] md:py-20"
      >
        <div>
          <span class="eyebrow !text-aqua">Keterbukaan sebagai fondasi</span>
          <h2>Kepercayaan tumbuh<br />dari informasi yang jelas.</h2>
          <p class="mt-5 max-w-lg text-sm leading-7 text-[#c4d3de]">
            Kenali proses publikasi dan status kesiapan Shareat. Setiap rencana
            dan cerita punya konteks yang bisa kamu pahami.
          </p>
          <NuxtLink
            to="/transparansi"
            class="mt-6 inline-flex min-h-12 items-center gap-3 text-sm font-bold text-aqua"
            >Kenali transparansi kami<ArrowUpRight
              class="size-4"
              aria-hidden="true"
          /></NuxtLink>
        </div>
        <div class="grid gap-4">
          <div
            v-for="value in [
              {
                title: 'Konteks yang terbuka',
                text: 'Status rencana, jadwal, dan penanggung jawab ditampilkan sesuai informasi yang tersedia.',
              },
              {
                title: 'Publikasi melalui review',
                text: 'Klaim, privasi, dan izin media menjadi bagian dari proses peninjauan.',
              },
              {
                title: 'Ruang untuk bertanya',
                text: 'Kanal kontak tersedia untuk pertanyaan dan koreksi informasi.',
              },
            ]"
            :key="value.title"
            class="flex gap-4 rounded-xl border border-white/15 bg-white/5 p-5"
          >
            <ShieldCheck
              class="mt-1 size-5 shrink-0 text-aqua"
              aria-hidden="true"
            />
            <div>
              <h3 class="text-base tracking-normal">{{ value.title }}</h3>
              <p class="mt-2 text-xs leading-6 text-[#c4d3de]">
                {{ value.text }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="container section">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Catatan & cerita</span>
          <h2>Karena setiap proses<br />punya cerita.</h2>
        </div>
        <NuxtLink to="/cerita" class="text-link"
          >Semua cerita<ArrowUpRight class="size-4" aria-hidden="true"
        /></NuxtLink>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <ContentCard v-for="item in stories" :key="item.id" :item="item" />
      </div>
      <p v-if="!stories.length" class="empty-state">
        Cerita dan pembelajaran akan hadir setelah dipublikasikan oleh tim.
      </p>
    </section>
    <section class="border-t bg-sand">
      <div class="container section grid gap-10 md:grid-cols-[.8fr_1.2fr]">
        <div>
          <span class="eyebrow">Kenali lebih dekat</span>
          <h2>Mungkin kamu<br />ingin tahu.</h2>
          <p class="mt-5 max-w-sm text-sm text-muted-foreground">
            Beberapa jawaban sebelum memulai langkah pertamamu bersama Shareat.
          </p>
          <NuxtLink to="/faq" class="text-link mt-5"
            >Semua pertanyaan<ArrowRight class="size-4" aria-hidden="true"
          /></NuxtLink>
        </div>
        <FaqList :items="faqs" />
      </div>
    </section>
    <JoinBanner />
  </div>
</template>
