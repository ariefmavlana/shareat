# Sumber dan audit referensi Shareat

Dokumen ini membedakan bukti yang ditemukan, fakta dari dokumentasi resmi, serta usulan desain. Tanggal pemeriksaan adalah 2 Oktober 2026. Isi situs dokumentasi dapat berubah; keputusan versi perlu diperiksa ulang ketika implementasi dimulai.

## Bukti lokal

Workspace berisi folder `referensi/`; pada pemeriksaan awal tidak ditemukan source Svelte, `package.json` aplikasi baru, database produksi, atau Git repository. `referensi/package-lock.json` mengidentifikasi proyek `charitypress` dengan lockfile versi 1. Fakta ini tidak membantah riwayat penggunaan Svelte yang disampaikan pemilik; source Svelte tersebut belum tersedia di workspace ini.

| Referensi | Temuan | Implikasi |
| --- | --- | --- |
| [Beranda lama](../referensi/index.html) | Hero carousel, satu contoh kartu, modal nominal/nama/email, angka dampak global | Ambil inspirasi struktur; buat ulang UX dan isi Indonesia |
| [Tentang lama](../referensi/about.html) | Accountability, reliability, cost effectiveness; klaim usia organisasi dan statistik generik | Nilai akuntabilitas relevan; statistik dan riwayat tidak dianggap fakta Shareat |
| [Donasi lama](../referensi/donate-now.html) | Form tanpa alur gateway terverifikasi, contoh minimum dalam dolar, pilihan charity generik | Ganti dengan IDR, biaya eksplisit, intent, dan status server |
| [Sukses lama](../referensi/success.html) | Klaim dana sudah masuk ke penerima tanpa bukti backend | Pisahkan pembayaran diterima dari penyaluran |
| [Gagal lama](../referensi/failure.html) | Judul dokumen masih Donation Success; pesan kesalahan umum | State kegagalan harus tepat dan memberi pemulihan |
| [Kontak lama](../referensi/contact.html) | Konten kontak template | Jangan publikasi kontak yang belum diverifikasi |
| [Warna lama](../referensi/assets/sass/variable/_variable.scss) | Aqua `#18bfc3`, navy `#041D57`, Poppins dan Roboto Slab | Inspirasi identitas, bukan bukti keterbacaan/kontras |

Audit kode juga menemukan referensi kunci layanan eksternal yang ditulis di HTML. Nilainya tidak disalin ke dokumen atau proyek baru. Pemilik layanan perlu memeriksa kepemilikan, pembatasan domain, dan penggantian jika masih aktif. Keberadaan kunci publik tidak membuktikan akses layanan saat ini. Script PHP lama tidak dijalankan dan konfigurasi rahasia tidak direproduksi.

Pada persiapan publikasi repository tanggal 3 Oktober 2026, script integrasi peta yang memuat kunci tertanam dihapus dari HTML referensi. Folder konfigurasi/contact PHP lokal dikecualikan melalui `.gitignore`. Gambar, font, narasi, dan struktur referensi lainnya dipertahankan untuk audit. Pemeriksaan source saat penyusunan baseline pada 2 Oktober tetap merupakan catatan historis; pembersihan ini tidak mengubah rights status media.

## Inventaris dan kebijakan media

Inventaris lengkap dibuat otomatis dalam [ASSET_INVENTORY.csv](ASSET_INVENTORY.csv), berisi path, ukuran berkas, dimensi jika dapat dibaca, checksum SHA256, dan kelas penggunaan. Checksum menjamin identitas berkas selama migrasi; tidak membuktikan lisensi.

| Kelompok | Contoh berkas | Hasil inspeksi dan keputusan |
| --- | --- | --- |
| Logo | [logo.png](../referensi/assets/images/logo.png), [footer_logo.png](../referensi/assets/images/footer_logo.png) | Logo utama terlihat bertuliskan Charity; tidak dipakai sebagai logo Shareat |
| Hero | [slide1.png](../referensi/assets/images/slide1.png), [slide2.png](../referensi/assets/images/slide2.png), [slide3.png](../referensi/assets/images/slide3.png) | Slide1 menampilkan lingkungan yang belum dibuktikan Indonesia; foto hanya referensi sampai lokasi, izin, dan relevansi diperiksa |
| Kampanye | [causes_4.png](../referensi/assets/images/causes/causes_4.png), folder causes | Berkas contoh yang dilihat merupakan foto drone; tidak cocok sebagai kampanye kemanusiaan |
| Avatar | folder assets/images/avatar | Tidak dianggap identitas tim atau donor nyata |
| Ilustrasi status | [success_donation.png](../referensi/assets/images/success_donation.png), [donation_error.png](../referensi/assets/images/donation_error.png) | Calon inspirasi; lisensi dan bahasa visual perlu diperiksa |
| Layout dan dekorasi | about, contact, map, icon, banner | Reuse hanya setelah audit hak penggunaan dan relevansi |
| Font dan vendor | assets/fonts, assets/js, assets/css | Bukan dependency aplikasi baru; lisensi font dan ikon diperiksa sebelum reuse |

Hanya tiga gambar utama di atas diinspeksi secara visual pada tahap ini. Inventaris seluruh media tidak berarti seluruh gambar telah mendapat persetujuan editorial. Semua media lama berstatus hak penggunaan **belum terverifikasi**. Publikasi membutuhkan pemilik, sumber, lisensi/izin, konteks lokasi/tanggal, teks alternatif, serta persetujuan pihak yang dapat dikenali. Media anak dan penerima manfaat membutuhkan perlindungan tambahan. Geolokasi rinci dan metadata EXIF dihapus dari turunan publik.

Referensi HTML mengacu ke sebagian berkas dan halaman yang tidak tersedia, termasuk `causes.html`, `faq.html`, dan beberapa path background. Daftar tepatnya dihasilkan dalam laporan validasi. Struktur legacy tidak menjadi sitemap aplikasi baru.

## Sumber resmi stack

| ID | Sumber yang diperiksa | Fakta yang didukung dan batasnya |
| --- | --- | --- |
| SRC-01 | [Nuxt installation](https://nuxt.com/docs/4.x/getting-started/installation) dan [introduction](https://nuxt.com/docs/4.x/getting-started/introduction) | Dokumentasi Nuxt 4 tersedia; halaman saat diperiksa menampilkan 4.5.2; minimum runtime pada panduan instalasi 22.x, rekomendasi active LTS. Tampilan docs bukan pembuktian patch npm seluruh dependency |
| SRC-02 | [Nuxt deployment](https://nuxt.com/docs/4.x/getting-started/deployment) | Build Node menghasilkan entry `.output/server/index.mjs`; generate statis tidak menjadi backend transaksi |
| SRC-03 | [Node release schedule](https://github.com/nodejs/Release) | Jadwal 24.x active LTS pada tanggal acuan, 22.x maintenance; jadwal 26.x LTS setelah tanggal acuan. Tanggal merupakan jadwal yang dapat berubah |
| SRC-04 | [shadcn-vue Nuxt](https://www.shadcn-vue.com/docs/installation/nuxt) dan [Tailwind v4](https://next.shadcn-vue.com/docs/tailwind-v4) | Integrasi Vue/Nuxt dan jalur Tailwind v4; gunakan shadcn-vue, bukan package shadcn/ui React |
| SRC-05 | [Tailwind compatibility](https://tailwindcss.com/docs/compatibility) | Minimum fitur v4: Chrome 111, Safari 16.4, Firefox 128; dukungan perangkat lama perlu keputusan eksplisit |
| SRC-06 | [Drizzle MySQL](https://orm.drizzle.team/docs/mysql/get-started-mysql) dan [transactions](https://orm.drizzle.team/docs/transactions) | Adapter mysql2 dan transaksi tersedia; tidak menjamin semua versi MariaDB kompatibel |
| SRC-07 | [cPanel Application Manager](https://docs.cpanel.net/cpanel/software/application-manager/) dan [Node application](https://docs.cpanel.net/knowledge-base/web-services/how-to-install-a-node.js-application/) | Passenger/Application Manager bergantung konfigurasi penyedia; cPanel bukan jaminan dukungan runtime, entry ESM, atau kapasitas |
| SRC-08 | [Nuxt Sitemap](https://nuxt.com/modules/sitemap) dan [Nuxt SEO](https://nuxt.com/modules/seo) | Modul tersedia; gunakan komponen yang diperlukan, biaya rendering OG dinamis tidak diwajibkan |

Nuxt 4 + Node 24 LTS adalah usulan fondasi, bukan hasil spike integrasi. TypeScript, Vue, Nitro, Zod, Reka UI, Drizzle, mysql2, Vitest, dan Playwright mengikuti rilis stabil yang kompatibel dan dikunci dalam lockfile saat implementasi. Tidak ada klaim nomor patch terbaru yang belum diperiksa. Nuxt membawa constraint dependency internal; jangan menaikkan Vue/Nitro secara terpisah tanpa uji kompatibilitas.

## Sumber perilaku transaksi, SEO, dan aksesibilitas

| ID | Sumber | Penggunaan |
| --- | --- | --- |
| SRC-09 | [Midtrans HTTP notifications](https://docs.midtrans.com/docs/https-notification-webhooks) dan [handle notifications](https://docs.midtrans.com/reference/handle-notifications) | Signature, status server, duplikasi dan urutan webhook. Midtrans merupakan calon adapter, bukan vendor yang telah dipilih pemilik |
| SRC-10 | [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) | HTML, status HTTP, crawling dan rendering |
| SRC-11 | [Google developers guide](https://developers.google.com/search/docs/fundamentals/get-started-developers) dan [robots meta](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) | Noindex perlu dapat dibaca crawler; robots bukan kontrol akses |
| SRC-12 | [Faceted navigation](https://developers.google.com/crawling/docs/faceted-navigation) | Batasi ruang URL filter dan crawl budget; canonical tidak selalu cukup |
| SRC-13 | [Web Vitals](https://web.dev/articles/vitals) | LCP, INP, CLS dan penilaian persentil 75 |
| SRC-14 | [WCAG 2.2](https://www.w3.org/TR/WCAG22/) dan [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) | Standar AA; target produk 44 px merupakan keputusan UX yang lebih besar daripada minimum AA umum |
| SRC-15 | [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) | Scrypt memiliki beberapa kombinasi parameter minimum; usulan SDD menggunakan N=2^15, r=8, p=3, harus diukur pada host |
| SRC-16 | [Nuxt testing](https://nuxt.com/docs/4.x/getting-started/testing) dan [runtime config](https://nuxt.com/docs/4.x/guide/going-further/runtime-config) | Test utils/Vitest/Playwright, pemisahan config publik dan privat, mapping env NUXT_; kompatibilitas aktual diuji saat spike |

## Sumber regulasi untuk pemeriksaan operasional

- [Permensos 8 Tahun 2021](https://peraturan.bpk.go.id/Details/217212/permensos-no-8-tahun-2021) dan [perubahannya, Permensos 8 Tahun 2024](https://peraturan.bpk.go.id/Details/311984/permensos-no-8-tahun-2024): landasan pemeriksaan pengumpulan uang atau barang. Hubungan perubahan teridentifikasi pada database resmi; penerapan pasal, izin, cakupan wilayah, pelaporan, audit, serta batas biaya harus diverifikasi terhadap kegiatan badan hukum yang sebenarnya dan pembaruan yang mungkin berlaku.
- [UU 27 Tahun 2022 tentang Pelindungan Data Pribadi](https://peraturan.go.id/id/uu-no-27-tahun-2022): landasan desain privasi. Basis pemrosesan, retensi, transfer lintas wilayah, insiden dan hak subjek ditetapkan bersama penanggung jawab legal.
- Penilaian kewajiban PSE, pajak, pembukuan, aturan provider pembayaran, serta perlindungan anak dicatat pada register legal. Dokumen ini tidak menyatakan Shareat sudah memenuhi ketentuan tersebut.

## MCP dan keterbatasan pemeriksaan

Tool MCP `load_workspace_dependencies` telah digunakan untuk memeriksa runtime pendukung. Pencarian tool yang tersedia tidak menemukan `resolve-library-id` atau `query-docs` Context7; verifikasi dialihkan ke web dengan sumber resmi. Context7 tidak diklaim telah dijalankan. Skill Context7 menjadi pedoman pemilihan sumber; skill Superpowers digunakan untuk standar dokumentasi teknis dan keterlacakan. Skill write-page dipakai untuk mutu prosa dan penyimpanan dokumentasi lokal sesuai konteks workspace.

Sebagian endpoint Nuxt mengembalikan format Markdown yang tidak dapat dibuka oleh tool web. Panduan deployment dan installation diperoleh melalui hasil dokumentasi resmi yang berhasil diambil. Keterbatasan tersebut tidak diubah menjadi klaim uji runtime.

## Bukti implementasi 3 Oktober 2026

Versi exact tersedia pada [package.json](../package.json) dan lockfile; hasil runtime/test ada pada [IMPLEMENTATION](IMPLEMENTATION.md). Windows dan Linux Node24.19.0/MySQL8.4 telah diuji lokal. Penggunaan [shadcn-vue Nuxt](https://www.shadcn-vue.com/docs/installation/nuxt) memadukan shadcn-nuxt serta plugin Tailwind Vite. [Drizzle MySQL](https://orm.drizzle.team/docs/mysql/get-started-mysql) mendukung driver mysql2; proyek memakai versi stable yang dipin, bukan mengikuti contoh RC secara otomatis.

Dokumentasi Nuxt deployment masih terkena batas content-type Markdown pada tool web; bukti build/start artifact diperoleh dari eksekusi lokal. Tidak mengklaim Context7 tersedia. MCP Codex dipakai untuk runtime/preview/artifact PR; skills Superpowers dan Context7 mengarahkan TDD serta sumber teknis resmi.

Audit lockfile mencatat15 advisori (11 high/4 moderate), terutama rantai Nuxt CLI/listhen/node-forge, globby/micromatch/braces dan drizzle-kit/esbuild. Contoh sumber: [node-forge advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv), [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), [esbuild advisory](https://github.com/advisories/GHSA-67mh-4wv8-2f99). Builder hanya lokal, image runtime hanya artifact. Pemeriksaan registry atas69 versi package runtime+h3 tidak melaporkan advisori; ini tidak menggantikan audit compiled code, SBOM Linux lengkap, atau review exploitability sebelum produksi. Tidak melakukan force fix/downgrade major untuk menyembunyikan laporan.

Logo kerja, ilustrasi icon, favicon dan OG pada public adalah asset baru dari kode proyek, bukan foto/font CharityPress. Inventaris legacy tetap rights-unverified. Scanner dan rights workflow tidak otomatis memberi izin atas referensi lama.
