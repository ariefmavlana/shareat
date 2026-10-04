<script setup lang="ts">
import {
  Menu,
  Search,
  ArrowUpRight,
  ArrowRight,
  Heart,
  MessageCircle,
} from '@lucide/vue'
const { data } = await useSiteSettings()
const route = useRoute()
const links = [
  { to: '/program', label: 'Program' },
  { to: '/inisiatif', label: 'Inisiatif' },
  { to: '/tentang', label: 'Tentang kami' },
  { to: '/cerita', label: 'Cerita' },
  { to: '/transparansi', label: 'Transparansi' },
]
const mobileOpen = ref(false)
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)
</script>
<template>
  <div>
    <a
      href="#main-content"
      class="fixed left-4 top-4 z-100 -translate-y-24 rounded-lg bg-white px-5 py-3 focus:translate-y-0"
      >Lewati ke konten utama</a
    >
    <div
      v-if="data?.demo"
      class="border-b border-[#eadfc7] bg-[#fff7e7] px-4 py-2 text-center text-[11px] text-[#745627]"
    >
      <strong class="mr-1">Mode demo</strong> · Kegiatan, identitas, dan cerita
      adalah data contoh.
    </div>
    <header class="site-header">
      <div class="container flex min-h-20 items-center justify-between gap-5">
        <BrandMark />
        <nav
          aria-label="Navigasi utama"
          class="hidden items-center gap-7 lg:flex"
        >
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="nav-link"
            >{{ link.label }}</NuxtLink
          >
        </nav>
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/cari"
            aria-label="Cari informasi"
            class="grid size-11 place-items-center rounded-full hover:bg-muted"
            ><Search class="size-5" aria-hidden="true"
          /></NuxtLink>
          <NuxtLink
            to="/kontak"
            class="action-link hidden min-h-11 px-5 sm:inline-flex"
            >Mari terhubung<ArrowUpRight class="size-4" aria-hidden="true"
          /></NuxtLink>
          <UiSheet v-model:open="mobileOpen">
            <UiSheetTrigger as-child
              ><UiButton
                variant="ghost"
                aria-label="Buka menu navigasi"
                :disabled="!mounted"
                class="min-h-11 min-w-11 lg:hidden"
                ><Menu class="size-6" /></UiButton
            ></UiSheetTrigger>
            <UiSheetContent class="w-[min(90vw,390px)] overflow-y-auto">
              <UiSheetHeader class="border-b px-6 pb-6 pt-8"
                ><UiSheetTitle>Jelajahi Shareat</UiSheetTitle
                ><UiSheetDescription
                  >Temukan ruang untuk berbagi.</UiSheetDescription
                ></UiSheetHeader
              >
              <nav aria-label="Navigasi seluler" class="grid gap-1 px-4">
                <NuxtLink
                  v-for="link in [
                    { to: '/', label: 'Beranda' },
                    ...links,
                    { to: '/faq', label: 'Pertanyaan umum' },
                    { to: '/cari', label: 'Cari informasi' },
                  ]"
                  :key="link.to"
                  :to="link.to"
                  class="mobile-nav-link"
                  @click="mobileOpen = false"
                  >{{ link.label
                  }}<ArrowUpRight class="size-4" aria-hidden="true"
                /></NuxtLink>
              </nav>
              <div class="m-4 mt-auto rounded-xl bg-accent p-5">
                <Heart class="mb-3 size-6 text-primary" aria-hidden="true" />
                <p class="mb-4 text-sm">
                  Punya pertanyaan atau ide kolaborasi?
                </p>
                <NuxtLink
                  to="/kontak"
                  class="action-link w-full"
                  @click="mobileOpen = false"
                  >Hubungi tim<ArrowRight class="size-4"
                /></NuxtLink>
              </div>
            </UiSheetContent>
          </UiSheet>
        </div>
      </div>
      <noscript class="container block pb-3 text-sm"
        >Gunakan tautan navigasi pada bagian bawah halaman.</noscript
      >
    </header>
    <main id="main-content" tabindex="-1"><slot /></main>
    <footer class="site-footer">
      <div
        class="container grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]"
      >
        <div>
          <BrandMark inverse />
          <p class="mt-5 max-w-xs text-sm leading-7 text-[#c4d3de]">
            Berbagi pangan, pengetahuan, dan buku. Membuka kesempatan melalui
            kepedulian yang tumbuh bersama.
          </p>
          <p class="mt-7 flex items-center gap-2 text-xs text-aqua">
            <Heart class="size-4" aria-hidden="true" />Berawal dari peduli.
            Berlanjut bersama.
          </p>
        </div>
        <div>
          <p class="mb-4 text-sm font-bold">Kenali Shareat</p>
          <nav aria-label="Navigasi footer">
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="footer-link"
              >{{ link.label }}</NuxtLink
            >
          </nav>
        </div>
        <div>
          <p class="mb-4 text-sm font-bold">Informasi & bantuan</p>
          <nav aria-label="Bantuan dan kebijakan">
            <NuxtLink to="/faq" class="footer-link">Pertanyaan umum</NuxtLink
            ><NuxtLink to="/kontak" class="footer-link">Hubungi tim</NuxtLink
            ><NuxtLink to="/privasi" class="footer-link"
              >Kebijakan privasi</NuxtLink
            ><NuxtLink to="/ketentuan" class="footer-link"
              >Ketentuan penggunaan</NuxtLink
            ><NuxtLink to="/cari" class="footer-link">Pencarian</NuxtLink>
          </nav>
        </div>
        <div>
          <p class="mb-4 text-sm font-bold">Mari buka percakapan</p>
          <p class="text-sm leading-7 text-[#c4d3de]">
            Langkah kecilmu bisa dimulai dengan sebuah pertanyaan.
          </p>
          <NuxtLink
            to="/kontak"
            class="mt-5 inline-flex min-h-12 items-center gap-3 rounded-lg border border-[#6c8b9c] px-4 text-sm font-bold text-aqua hover:bg-white/5"
            ><MessageCircle class="size-4" aria-hidden="true" />Hubungi
            tim<ArrowUpRight class="size-4" aria-hidden="true"
          /></NuxtLink>
        </div>
      </div>
      <div
        class="container flex flex-wrap items-center justify-between gap-2 border-t border-white/15 py-5 text-[11px] text-[#c4d3de]"
      >
        <p>
          Shareat ·
          {{
            data?.demo
              ? 'Preview pengembangan — data contoh'
              : 'Berbagi kesempatan, menguatkan kemanusiaan.'
          }}
        </p>
        <NuxtLink
          to="/admin/login"
          class="inline-flex min-h-11 items-center gap-2"
          >Akses tim<ArrowUpRight class="size-3" aria-hidden="true"
        /></NuxtLink>
      </div>
    </footer>
  </div>
</template>
