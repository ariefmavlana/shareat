<script setup lang="ts">
import { Menu, ArrowUpRight } from '@lucide/vue'
const { data } = await useSiteSettings()
const links = [
  { to: '/program', label: 'Program' },
  { to: '/inisiatif', label: 'Inisiatif' },
  { to: '/cerita', label: 'Cerita' },
  { to: '/tentang', label: 'Tentang' },
  { to: '/transparansi', label: 'Transparansi' },
]
const mobileOpen = ref(false)
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
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
      class="bg-[#ede6d3] px-4 py-2 text-center text-xs text-[#62532e]"
    >
      <strong>Mode demo.</strong> Kegiatan, identitas, dan cerita adalah contoh
      yang bisa dikelola melalui CMS.
    </div>
    <header class="border-b bg-background">
      <div class="container flex min-h-24 items-center justify-between gap-5">
        <BrandMark />
        <nav
          aria-label="Navigasi utama"
          class="hidden items-center gap-7 lg:flex"
        >
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="py-3 text-sm font-medium text-muted-foreground hover:text-primary"
            active-class="!text-primary"
            >{{ link.label }}</NuxtLink
          >
        </nav>
        <div class="flex items-center gap-3">
          <UiButton
            as-child
            variant="outline"
            class="hidden min-h-11 rounded-full px-5 sm:inline-flex"
            ><NuxtLink to="/kontak"
              >Mari berbagi<ArrowUpRight class="size-4" /></NuxtLink></UiButton
          ><UiSheet v-model:open="mobileOpen"
            ><UiSheetTrigger as-child
              ><UiButton
                variant="ghost"
                aria-label="Buka menu navigasi"
                :disabled="!mounted"
                class="min-h-11 min-w-11 lg:hidden"
                ><Menu class="size-6" /></UiButton></UiSheetTrigger
            ><UiSheetContent
              ><UiSheetHeader
                ><UiSheetTitle>Jelajahi Shareat</UiSheetTitle
                ><UiSheetDescription
                  >Program, informasi kegiatan, dan kontak
                  tim.</UiSheetDescription
                ></UiSheetHeader
              >
              <nav aria-label="Navigasi seluler" class="grid gap-2 px-4 py-8">
                <NuxtLink
                  v-for="link in [
                    ...links,
                    { to: '/faq', label: 'Pertanyaan umum' },
                    { to: '/kontak', label: 'Hubungi tim' },
                  ]"
                  :key="link.to"
                  :to="link.to"
                  class="rounded-lg px-4 py-3"
                  @click="mobileOpen = false"
                  >{{ link.label }}</NuxtLink
                >
              </nav></UiSheetContent
            ></UiSheet
          >
        </div>
      </div>
      <noscript>Gunakan tautan navigasi pada bagian bawah halaman.</noscript>
    </header>
    <main id="main-content"><slot /></main>
    <footer class="mt-8 border-t">
      <div class="container section grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <BrandMark />
          <p class="mt-5 max-w-sm text-sm text-muted-foreground">
            Ruang untuk berbagi pangan, pengetahuan, dan buku. Bersama, membuka
            lebih banyak kesempatan.
          </p>
          <p class="mt-6 text-xs text-muted-foreground">
            {{
              data?.demo
                ? 'Preview pengembangan · Data contoh'
                : 'Informasi dan kolaborasi kemanusiaan'
            }}
          </p>
        </div>
        <div>
          <p class="mb-4 text-sm font-semibold">Jelajahi</p>
          <nav
            aria-label="Navigasi footer"
            class="grid gap-3 text-sm text-muted-foreground"
          >
            <NuxtLink v-for="link in links" :key="link.to" :to="link.to">{{
              link.label
            }}</NuxtLink>
          </nav>
        </div>
        <div>
          <p class="mb-4 text-sm font-semibold">Informasi & bantuan</p>
          <nav
            aria-label="Bantuan dan kebijakan"
            class="grid gap-3 text-sm text-muted-foreground"
          >
            <NuxtLink to="/faq">Pertanyaan umum</NuxtLink
            ><NuxtLink to="/kontak">Hubungi tim</NuxtLink
            ><NuxtLink to="/privasi">Kebijakan privasi</NuxtLink
            ><NuxtLink to="/ketentuan">Ketentuan penggunaan</NuxtLink>
          </nav>
        </div>
      </div>
      <div
        class="container flex flex-wrap justify-between gap-3 border-t py-6 text-xs text-muted-foreground"
      >
        <p>Shareat · Berbagi kesempatan, menguatkan kemanusiaan.</p>
        <NuxtLink to="/admin/login">Akses tim</NuxtLink>
      </div>
    </footer>
  </div>
</template>
