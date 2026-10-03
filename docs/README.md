# Dokumentasi platform Shareat

Paket ini menjelaskan produk, persyaratan perangkat lunak, dan rancangan sistem platform kemanusiaan Indonesia dengan program Share Eat, Share Knowledge, Share Book, serta program lain yang dapat ditambahkan. **R1** adalah website informasi dan transparansi dengan kontak WhatsApp. **R2** menambahkan penggalangan dana dan pembayaran setelah kesiapan legal, keuangan, serta gateway terpenuhi. Dokumen ditujukan kepada pemilik produk, desainer, pengembang, pengelola keuangan, dan operator. Nama Shareat merupakan nama kerja berdasarkan workspace; konfirmasi nama merek tercatat sebagai keputusan terbuka.

**Versi:** 1.1 · **Tanggal acuan:** 3 Oktober 2026, Asia/Jakarta · **Status:** baseline produk dan implementasi preview R1; gate produksi belum seluruhnya terpenuhi.

## Urutan membaca

| Dokumen | Tujuan |
| --- | --- |
| [PRD](PRD.md) | Mengapa produk dibuat, siapa penggunanya, cakupan, pengalaman, prioritas, dan ukuran keberhasilan |
| [SRS](SRS.md) | Persyaratan terukur, aturan bisnis, hak akses, kontrak perilaku, dan penerimaan |
| [SDD](SDD.md) | Cara membangun: stack, arsitektur, data, API, keamanan, pembayaran, SEO, deployment, dan operasi |
| [Keputusan dan risiko](DECISIONS.md) | Asumsi, keputusan arsitektur, hal yang perlu dikonfirmasi, dan syarat peluncuran |
| [Sumber dan audit referensi](EVIDENCE.md) | Bukti lokal, dokumentasi resmi, inventaris aset, dan batas verifikasi |
| [Keterlacakan dan pengujian](TRACEABILITY.md) | Hubungan sasaran produk, requirement, desain, serta skenario uji |
| [Status implementasi](IMPLEMENTATION.md) | Pemetaan source, pengujian aktual dan sisa gate tiap requirement R1 |
| [Pengembangan](DEVELOPMENT.md) | Setup, konfigurasi, akun, migrations, dan pemeriksaan lokal |
| [Kontrak API](API.md) | Endpoint R1 aktual, auth, payload, status dan contoh |
| [Operasi](OPERATIONS.md) | Minimum shared hosting, release, recovery, backup dan SOP |
| [Laporan validasi](VALIDATION.md) | Hasil pemeriksaan paket dokumentasi dan batas pemeriksaannya |

## Cara menggunakan baseline

PRD mengatur tujuan dan lingkup. SRS menjadi sumber aturan bisnis, status, nilai konfigurasi usulan, dan kriteria penerimaan. SDD menjelaskan implementasi SRS. Perubahan aturan harus diperbarui pada ketiga dokumen dan matriks keterlacakan pada revisi yang sama. Keputusan eksternal yang belum diketahui tetap terlihat dalam register; tidak diganti dengan klaim kepastian.

Fondasi yang diusulkan adalah **Nuxt 4, TypeScript, shadcn-vue, Tailwind CSS 4, Nitro, MySQL dengan Drizzle**, dan payment gateway melalui adapter. Versi yang diuji dikunci dalam package-lock.json; dependency audit dan uji hosting tetap menjadi gate. Nuxt fullstack hanya dapat ditempatkan pada shared hosting yang mendukung aplikasi Node.js dan kebutuhan operasionalnya. Hosting PHP saja memerlukan perubahan lokasi runtime atau arsitektur; menyalin hasil generate tidak menyediakan backend transaksi.

Pemilik mengonfirmasi bahwa hanya tim Shareat dan mitra terverifikasi yang mengelola inisiatif, hosting belum dipilih sehingga memakai syarat minimum, serta badan hukum/izin dan gateway belum tersedia. Jalur awal adalah WhatsApp untuk reach out. R1 tidak menerima pembayaran di website dan tidak memindahkan ajakan pembayaran ke WhatsApp. Implementasi fullstack R1 tetap diperlukan untuk CMS, otorisasi admin, data program, serta audit publikasi.

Source aplikasi R1, migrations, seed demo dinamis dan pengujian lokal sudah tersedia. Status setiap requirement serta batas bukti ada pada [IMPLEMENTATION](IMPLEMENTATION.md). Aset referensi dipertahankan. Dukungan hosting dan hak penggunaan media merupakan gate R1; legalitas penggalangan dana, kebijakan biaya, kontrol keuangan, dan kesiapan gateway merupakan gate R2.

## Aturan istilah

- **Program:** kategori misi, misalnya Share Eat.
- **Kampanye:** penggalangan dana tertentu di dalam satu program.
- **Donasi:** komitmen nominal untuk satu kampanye; memiliki paling banyak satu pembayaran berhasil.
- **Pembayaran terkonfirmasi:** status berhasil dari sumber server gateway yang diverifikasi.
- **Settlement:** dana yang menjadi tersedia menurut laporan settlement gateway, kemudian dicocokkan dengan penerimaan bank.
- **Penyaluran:** transfer atau pengeluaran bantuan yang disetujui dan dibuktikan.
- **Dampak:** keluaran bantuan yang diverifikasi; bukan perkiraan otomatis dari nominal donasi.
- **Anonim:** identitas disembunyikan dari publik; bukan pengecualian terhadap pencatatan internal yang sah.

## Pemeriksaan ulang

Jalankan `python docs/tools/validate_docs.py` dari root workspace untuk memeriksa tautan lokal, ID, cakupan matriks, judul bagian desain, keseimbangan pagar kode, dan referensi aset. Pemeriksaan ini tidak menilai hukum, menjalankan Nuxt, atau membuktikan kapasitas hosting. Hasil terakhir disimpan dalam [laporan validasi](VALIDATION.md).

Preview menggunakan WA sementara 087776734038 yang diberikan pemilik serta konten demo berlabel. Semua konten disimpan di DB dan bisa direvisi; tidak menjadi klaim kegiatan, identitas atau kebijakan nyata. Mode production menolak publikasi demo dan menyembunyikan snapshot demo.
