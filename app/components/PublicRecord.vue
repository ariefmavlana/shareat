<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'
const { data: settings } = await useSiteSettings()
const records = computed(() =>
  [
    {
      title: 'Versi kebijakan dan tanggal berlaku',
      text: 'Setiap perubahan kebijakan privasi dan ketentuan penggunaan diterbitkan sebagai versi tersendiri dengan tanggal berlaku. Versi yang sudah dipublikasikan tetap dapat ditinjau melalui arsip versi.',
      link: { to: '/privasi', label: 'Kebijakan privasi' },
    },
    {
      title: 'Alur publikasi yang diperiksa',
      text: 'Rencana kegiatan, inisiatif, dan cerita diterbitkan setelah melewati daftar periksa klaim, privasi, media, dan kontak, lalu ditinjau oleh peninjau yang berbeda dari penulisnya.',
      link: { to: '/faq', label: 'Alur publikasi' },
    },
    {
      title: 'Status kegiatan apa adanya',
      text: 'Setiap inisiatif menampilkan status rencana kegiatan, sedang berjalan, atau selesai sesuai informasi yang tersedia. Kami tidak menyimpulkan angka capaian dari rencana atau perkiraan.',
      link: { to: '/inisiatif', label: 'Jelajahi inisiatif' },
    },
    {
      title: 'Izin dan pemeriksaan media',
      text: 'Berkas media melewati pemeriksaan berkas dan persetujuan hak penggunaan sebelum dapat dirujuk oleh konten yang dipublikasikan. Berkas asli tidak disajikan sebagai tautan publik.',
      link: { to: '/ketentuan', label: 'Ketentuan penggunaan' },
    },
    {
      title: 'Mekanisme koreksi',
      text: 'Siapa pun dapat mengajukan koreksi melalui kanal kontak. Koreksi ditindaklanjuti sebagai revisi baru yang tercatat, bukan penyuntingan diam-diam pada konten yang sudah terbit.',
      link: { to: '/kontak', label: 'Ajukan koreksi' },
    },
    ...(settings.value?.demo
      ? [
          {
            title: 'Penandaan data contoh',
            text: 'Selama mode demo aktif, halaman dan kartu diberi label “Data contoh” agar tidak tertukar dengan dokumentasi kegiatan nyata.',
            link: { to: '/tentang', label: 'Konteks demo' },
          },
        ]
      : []),
  ].map((record) => record),
)
</script>
<template>
  <section class="mt-12" aria-labelledby="public-record-heading">
    <span class="eyebrow">Catatan publik</span>
    <h2 id="public-record-heading" class="text-2xl md:text-3xl">
      Yang bisa kamu periksa sendiri.
    </h2>
    <p class="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
      Bagian ini merangkum proses dan dokumen yang menentukan bagaimana
      informasi di Shareat diterbitkan, diperbarui, dan dikoreksi.
    </p>
    <ol class="public-record mt-8">
      <li v-for="record in records" :key="record.title">
        <div>
          <h3>{{ record.title }}</h3>
          <p class="mt-2">{{ record.text }}</p>
        </div>
        <div class="record-meta">
          <NuxtLink
            :to="record.link.to"
            class="inline-flex min-h-11 items-center gap-1.5 font-bold text-primary underline underline-offset-4"
            >{{ record.link.label
            }}<ArrowUpRight class="size-3.5" aria-hidden="true"
          /></NuxtLink>
        </div>
      </li>
    </ol>
  </section>
</template>
