<script setup lang="ts">
import {
  MapPin,
  CalendarDays,
  UserRound,
  ArrowLeft,
  ArrowUpRight,
  MessageCircle,
} from '@lucide/vue'
import type { ContentKind } from '~~/shared/contracts/content'
const props = defineProps<{ kind: ContentKind; slug: string }>()
const { data, error } = await useFetch(
  `/api/v1/public/${props.kind}/${props.slug}`,
  { key: props.kind + '-' + props.slug },
)
if (error.value || !data.value)
  throw createError({
    statusCode: error.value?.statusCode ?? 404,
    statusMessage:
      error.value?.statusCode === 410
        ? 'Konten telah ditarik dari publikasi'
        : 'Halaman tidak tersedia',
  })
const item = data.value
const { data: settings } = await useSiteSettings()
const { data: related } = await useFetch('/api/v1/public/content', {
  query: {
    kind: props.kind === 'program' ? 'initiative' : 'story',
    program: props.kind === 'program' ? props.slug : (item.programSlug ?? ''),
  },
  key: 'related-' + props.kind + '-' + props.slug,
})
const { data: versions } = await useFetch<
  Array<{
    id: string
    title: string
    effectiveDate?: string
    updatedAt: string
  }>
>(`/api/v1/public/policies/${props.slug}/versions`, {
  immediate:
    props.kind === 'page' && ['privasi', 'ketentuan'].includes(props.slug),
  key: 'policy-versions-' + props.slug,
})
const url = usePublicSeo(item.title, item.summary, {
  siteUrl: settings.value?.siteUrl ?? 'http://localhost:3000',
  demo: settings.value?.demo ?? true,
  article: props.kind === 'story',
  updatedAt: item.updatedAt,
})
const statuses = {
  planning: 'Rencana kegiatan',
  ongoing: 'Sedang berjalan',
  completed: 'Selesai',
}
const updated = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'long',
  timeZone: 'Asia/Jakarta',
}).format(new Date(item.updatedAt))
</script>
<template>
  <article>
    <PageIntro
      :title="item.title"
      :description="item.summary"
      :current="item.title"
      :eyebrow="
        kind === 'program'
          ? 'Program Shareat'
          : kind === 'initiative'
            ? 'Inisiatif & kegiatan'
            : kind === 'story'
              ? 'Catatan & cerita'
              : 'Mengenal Shareat'
      "
    >
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <span v-if="item.demo" class="card-tag !bg-[#f4e9ce] !text-[#745627]"
          >Data contoh</span
        ><span v-if="kind === 'initiative'" class="card-tag">{{
          statuses[item.activityStatus]
        }}</span
        ><span class="text-xs text-muted-foreground"
          >Diperbarui {{ updated }}</span
        >
      </div>
    </PageIntro>
    <div class="container section">
      <nav v-if="kind !== 'page'" class="mb-8" aria-label="Kembali ke daftar">
        <NuxtLink
          :to="
            kind === 'program'
              ? '/program'
              : kind === 'initiative'
                ? '/inisiatif'
                : '/cerita'
          "
          class="text-link"
          ><ArrowLeft class="size-4" aria-hidden="true" />{{
            kind === 'program'
              ? 'Semua program'
              : kind === 'initiative'
                ? 'Semua inisiatif'
                : 'Semua cerita'
          }}</NuxtLink
        >
      </nav>
      <div class="grid items-start gap-10 lg:grid-cols-[1.8fr_1fr] lg:gap-14">
        <div class="min-w-0">
          <img
            v-if="item.imageId"
            :src="`/media/${item.imageId}/1200.webp`"
            :alt="item.imageAlt ?? ''"
            width="1200"
            height="750"
            class="mb-8 w-full rounded-xl"
          />
          <figure
            v-else-if="kind === 'page' && slug === 'tentang'"
            class="mb-8"
          >
            <img
              src="/images/berbagi-bersama.webp"
              alt="Ilustrasi konseptual komunitas berbagi pangan, pengetahuan, dan buku."
              width="1440"
              height="960"
              class="w-full rounded-xl"
            />
            <figcaption class="mt-2 text-xs text-muted-foreground">
              Ilustrasi konseptual · bukan dokumentasi kegiatan
            </figcaption>
          </figure>
          <ProgramArt
            v-else-if="kind !== 'page'"
            :program="kind === 'program' ? item.slug : item.programSlug"
            large
            class="mb-8 rounded-xl"
          />
          <div v-if="item.demo" class="demo-note mb-8">
            Halaman ini memakai data demo. Kegiatan, identitas, lokasi, dan
            cerita belum menyatakan fakta kegiatan nyata.
          </div>
          <h2 class="mb-6 text-2xl">
            {{
              kind === 'program'
                ? 'Mengenal program ini'
                : kind === 'initiative'
                  ? 'Tentang inisiatif'
                  : kind === 'story'
                    ? 'Cerita selengkapnya'
                    : 'Informasi yang perlu kamu ketahui'
            }}
          </h2>
          <div class="prose text-base leading-8 text-muted-foreground">
            <p v-for="(paragraph, index) in item.paragraphs" :key="index">
              {{ paragraph }}
            </p>
          </div>
          <div v-if="slug === 'transparansi' && kind === 'page'" class="mt-10">
            <PublicRecord />
            <div class="mt-10 grid gap-3 sm:grid-cols-2">
              <NuxtLink
                to="/privasi"
                class="surface p-5 text-sm font-bold hover:border-primary"
                >Kebijakan privasi<ArrowUpRight
                  class="mt-3 size-5 text-primary" /></NuxtLink
              ><NuxtLink
                to="/ketentuan"
                class="surface p-5 text-sm font-bold hover:border-primary"
                >Ketentuan penggunaan<ArrowUpRight
                  class="mt-3 size-5 text-primary"
              /></NuxtLink>
            </div>
          </div>
          <div class="mt-10 border-t pt-6 text-xs text-muted-foreground">
            <p>Diperbarui {{ updated }}</p>
            <p v-if="item.author" class="mt-2">Penulis: {{ item.author }}</p>
            <p v-if="item.effectiveDate" class="mt-2">
              Tanggal versi {{ item.effectiveDate }}
            </p>
          </div>
          <nav
            v-if="versions?.length"
            class="surface mt-6 p-5 text-sm"
            aria-label="Arsip kebijakan"
          >
            <h2 class="mb-3 text-lg">Versi kebijakan</h2>
            <ul class="grid gap-2">
              <li v-for="version in versions" :key="version.id">
                <NuxtLink
                  :to="'/' + slug + '/versi/' + version.id"
                  class="inline-block min-h-11 py-2 underline underline-offset-4"
                  >{{
                    version.effectiveDate ?? version.updatedAt.slice(0, 10)
                  }}
                  — {{ version.title }}</NuxtLink
                >
              </li>
            </ul>
          </nav>
          <div class="mt-6"><ShareLink :title="item.title" :url="url" /></div>
        </div>
        <aside class="surface detail-aside p-6 sm:p-8">
          <span class="icon-tile mb-6"
            ><MessageCircle class="size-6" aria-hidden="true" /></span
          ><span class="eyebrow">Mulai dengan percakapan</span>
          <h2 class="text-2xl">Ingin mengenal<br />lebih jauh?</h2>
          <dl
            v-if="item.location || item.schedule || item.responsible"
            class="my-6 grid gap-5 border-y py-6 text-sm"
          >
            <div
              v-if="item.location"
              class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1"
            >
              <MapPin
                class="row-span-2 mt-1 size-4 text-primary"
                aria-hidden="true"
              />
              <dt class="text-xs text-muted-foreground">Lokasi</dt>
              <dd class="font-semibold">{{ item.location }}</dd>
            </div>
            <div
              v-if="item.schedule"
              class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1"
            >
              <CalendarDays
                class="row-span-2 mt-1 size-4 text-primary"
                aria-hidden="true"
              />
              <dt class="text-xs text-muted-foreground">Jadwal</dt>
              <dd class="font-semibold">{{ item.schedule }}</dd>
            </div>
            <div
              v-if="item.responsible"
              class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1"
            >
              <UserRound
                class="row-span-2 mt-1 size-4 text-primary"
                aria-hidden="true"
              />
              <dt class="text-xs text-muted-foreground">Penanggung jawab</dt>
              <dd class="font-semibold">{{ item.responsible }}</dd>
            </div>
          </dl>
          <p class="my-5 text-sm leading-7 text-muted-foreground">
            Bicarakan pertanyaan dan peluang kolaborasi bersama tim Shareat.
          </p>
          <ContactButton
            :context="item.title"
            label="Tanya melalui WhatsApp"
            class="w-full whitespace-normal"
          />
          <p class="mt-4 text-xs leading-6 text-muted-foreground">
            WhatsApp adalah layanan eksternal. Kamu meninjau dan mengirim pesan
            sendiri.
          </p>
          <NuxtLink to="/kontak" class="text-link mt-4 text-xs"
            >Detail kanal & jam layanan<ArrowUpRight
              class="size-3.5"
              aria-hidden="true"
          /></NuxtLink>
        </aside>
      </div>
      <section
        v-if="
          related?.items.some((entry) => entry.id !== item.id) &&
          kind !== 'page'
        "
        class="section mt-12 border-t !pb-0"
      >
        <span class="eyebrow">Jelajahi juga</span>
        <h2 class="mb-8">
          {{
            kind === 'program'
              ? 'Inisiatif dalam program ini'
              : 'Cerita berbagi'
          }}
        </h2>
        <div class="grid gap-6 md:grid-cols-3">
          <ContentCard
            v-for="entry in related.items
              .filter((entry) => entry.id !== item.id)
              .slice(0, 3)"
            :key="entry.id"
            :item="entry"
          />
        </div>
      </section>
    </div>
    <JoinBanner v-if="kind === 'program' || slug === 'tentang'" />
  </article>
</template>
