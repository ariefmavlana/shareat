# PRD platform kemanusiaan Shareat

**Versi:** 1.1 · **Tanggal:** 3 Oktober 2026 · **Status:** baseline produk, dengan preview R1 dan gate produksi terpisah. Dokumen ini menetapkan arah produk. Aturan yang dapat diuji ada di [SRS](SRS.md), implementasi di [SDD](SDD.md), dan keputusan terbuka di [register](DECISIONS.md).

Shareat ingin menjadi wadah berbagi untuk misi kemanusiaan di Indonesia. Fondasi produknya adalah membantu masyarakat memahami program, melihat siapa yang bertanggung jawab, dan berpartisipasi dengan langkah yang mudah. Peluncuran pertama memakai WhatsApp sebagai kanal menghubungi tim. Crowdfunding merupakan tahap selanjutnya, setelah badan hukum, izin, pengelolaan dana, dan payment gateway siap.

## 1. Konteks dan keputusan pemilik

Pemilik mempunyai referensi website era 2020/2021 dan menyampaikan pernah memakai Svelte. Materi lokal yang tersedia sekarang adalah template HTML CharityPress, bukan source Svelte. Referensi tersebut menunjukkan kebutuhan beranda, cerita organisasi, program, kontak, serta pengalaman donasi. Konten template belum menjadi bukti riwayat atau dampak Shareat; lihat [audit referensi](EVIDENCE.md).

Keputusan yang sudah diberikan pemilik:

1. Stack sasaran adalah fullstack Nuxt, TypeScript, dan Shadcn dengan pendukung modern.
2. Hosting memakai syarat minimum terlebih dahulu; penyedia dan paket belum dipilih.
3. Hanya tim Shareat dan mitra yang diverifikasi terlebih dahulu boleh membuat inisiatif/kampanye.
4. Badan hukum/izin penggalangan dana serta gateway belum tersedia; interaksi awal melalui WhatsApp.
5. Preview memakai nomor sementara 087776734038 dan seluruh konten contoh harus dinamis serta diberi label demo. Persetujuan nomor sementara tidak menyatakan jam/operator atau organisasi nyata sudah diverifikasi.
6. Produk harus profesional, modern, mudah dipakai lintas usia, responsif, mudah dirawat, dan memiliki SEO menyeluruh.

Penerjemahan desain: gunakan shadcn-vue untuk ekosistem Vue/Nuxt; gunakan CMS internal agar konten dan bukti publikasi dapat dikelola; jangan menampilkan checkout, rekening, QR pembayaran, atau ajakan transfer pada R1. Pemisahan tersebut adalah keputusan lingkup produk berdasarkan klarifikasi, bukan pernyataan status legal suatu kegiatan yang belum diperiksa.

## 2. Masalah pengguna

Pengunjung membutuhkan jawaban sederhana: program apa yang dijalankan, siapa timnya, di mana dan kapan kegiatannya, bukti apa yang tersedia, serta bagaimana menghubungi pihak yang bertanggung jawab. Tampilan yang ramai, jargon, statistik tanpa sumber, formulir panjang, dan CTA yang tidak jelas menurunkan kepercayaan.

Tim membutuhkan cara mengelola program dan cerita tanpa mengedit kode, menjaga persetujuan media, serta mencegah konten belum disetujui masuk indeks pencarian. Saat penggalangan dana dibuka, tim juga membutuhkan alur pembayaran dan penyaluran yang tidak dapat diubah menjadi klaim sukses hanya oleh tampilan frontend.

## 3. Visi dan sasaran

Narasi berikut merupakan **usulan copy baru**, bukan kutipan aset lama: “Berbagi kesempatan, menguatkan kemanusiaan.” Deskripsi produk: “Shareat mempertemukan kepedulian masyarakat dengan program pangan, pengetahuan, buku, dan kebutuhan kemanusiaan di Indonesia melalui informasi yang jelas dan pertanggungjawaban yang dapat diperiksa.” Copy final mengikuti kegiatan nyata dan identitas organisasi yang disetujui.

| Sasaran | Rilis | Hasil yang diinginkan |
| --- | --- | --- |
| P-01 | R1 | Pengunjung memahami misi dan tiga program utama |
| P-02 | R1 | Pengunjung dapat menemukan inisiatif yang relevan |
| P-03 | R1 | Kredibilitas berasal dari identitas dan bukti nyata |
| P-04 | R1 | Pengunjung dapat menghubungi tim lewat WhatsApp dengan mudah |
| P-05 | R1 | Tim dan mitra terverifikasi mengelola konten dengan kontrol publikasi |
| P-06 | R1 | Pengalaman dapat diakses lintas usia, perangkat, dan kemampuan |
| P-07 | R1 | Konten publik mudah ditemukan mesin pencari dan dibagikan |
| P-08 | R2 | Donasi mempunyai status server, biaya jelas, dan pemulihan kesalahan |
| P-09 | R2 | Dana, penyaluran, refund, dan dampak dapat dipertanggungjawabkan |
| P-10 | R1/R2 | Operasi aman, dapat dipulihkan, dan kapasitas tumbuh berdasarkan bukti |

## 4. Pengguna dan kebutuhan

Persona adalah hipotesis untuk riset, bukan hasil survei:

| Pengguna | Kebutuhan utama | Implikasi UX |
| --- | --- | --- |
| Masyarakat 18–35 tahun | Cepat memahami program dari ponsel, berbagi ke keluarga/teman | Kartu ringkas, tautan share, WhatsApp jelas, halaman ringan |
| Masyarakat 36–60 tahun dan lansia | Identitas tim, penjelasan sederhana, tombol mudah dibaca | Teks minimal 16 px, target sentuh 44 px, label eksplisit, alur tanpa modal bertingkat |
| Calon relawan, pendidik, komunitas | Mengetahui lokasi, kebutuhan, agenda, dan bentuk kolaborasi | Detail program, status kesiapan, kontak konteks program |
| Calon mitra organisasi | Menilai tata kelola dan kecocokan kerja sama | Halaman organisasi, proses verifikasi, kebijakan, kontak resmi |
| Editor tim dan editor mitra | Membuat konten dan revisi miliknya | CMS dengan ownership, preview privat, persetujuan terpisah |
| Reviewer dan operator | Meninjau klaim, media, publikasi, pemulihan | Checklist editorial, audit, status revisi, pemantauan |
| Pengelola keuangan R2 | Rekonsiliasi, persetujuan penyaluran, penanganan sengketa | Ledger, pembatasan peran, laporan dan antrean pengecualian |

Penerima manfaat tidak wajib mempunyai akun atau mengungkap identitas sensitif. Donasi R2 boleh guest; akun donor merupakan opsi manfaat, bukan syarat bantuan. Produk tidak menguji checkout dengan pengguna anak sebagai donor.

## 5. Program dan bentuk partisipasi

| Program | Fokus | R1 | Tambahan R2 |
| --- | --- | --- | --- |
| Share Eat | Akses pangan dan kegiatan berbagi makanan | Cerita kebutuhan, rencana, pembaruan terverifikasi, kontak kolaborasi | Pendanaan kegiatan; laporan paket/porsi aktual beserta tanggal dan bukti |
| Share Knowledge | Akses pengetahuan dan kegiatan belajar | Agenda, materi penjelasan, informasi fasilitator jika disetujui | Pendanaan alat/kegiatan; laporan sesi dan peserta sesuai metode pencatatan |
| Share Book | Akses buku dan literasi | Kebutuhan buku, rencana kegiatan, kontak komunitas | Pendanaan buku/distribusi; laporan buku dan lokasi penerima yang aman |
| Program lain | Kebutuhan kemanusiaan yang disetujui tim | Taksonomi yang dapat ditambah melalui CMS | Kampanye sesuai kebijakan dan izin yang berlaku |

R1 mengizinkan informasi potensi kolaborasi waktu, pengetahuan, dan jejaring. Penerimaan uang atau barang, stok barang, pengiriman, booking sesi, sertifikat, dan LMS tidak menjadi fitur R1. Pembicaraan WhatsApp tidak dianggap transaksi atau bukti partisipasi terkonfirmasi.

## 6. Lingkup per rilis

### R1 website informasi dan WhatsApp

Wajib tersedia:

- Beranda, daftar program, detail program, daftar inisiatif, detail inisiatif, tentang tim, transparansi, cerita/pembaruan, FAQ, kontak, kebijakan privasi, dan ketentuan penggunaan.
- CMS privat untuk tim dan mitra terverifikasi, review publikasi oleh tim, manajemen media dan izin, versi konten, serta audit.
- Kontak WhatsApp dengan pesan awal yang aman dan dapat diedit pengguna; nomor resmi dari konfigurasi server.
- SEO SSR, canonical, sitemap, robots, metadata share, data terstruktur yang sesuai fakta, redirect legacy, dan status HTTP yang tepat.
- Design system aksesibel, responsif, state kosong/gagal, performa terukur, keamanan admin, backup, monitoring, dan dokumentasi operasi.

Istilah publik untuk objek R1 adalah **inisiatif**. Internal memakai entity campaign agar migrasi R2 dapat dilakukan tanpa mengganti semua struktur data. Status rencana/berjalan/selesai menyatakan kegiatan, bukan status penggalangan dana. Tidak ada akun donor, checkout, QRIS/VA, pembayaran manual, progress dana, atau dashboard uang pada R1.

### R2 crowdfunding terkendali

Hanya setelah gate R2: kampanye fundraising, donasi guest/akun, satu gateway hosted checkout, status pembayaran server, receipt, rekonsiliasi, ledger, approval penyaluran, refund, laporan dampak, bantuan transaksi, dan kontrol fraud. Program/campaign milik tim dan mitra yang diverifikasi tetap menjadi model utama. Nominal dihitung per kampanye; tidak ada dompet, saldo donor, pinjaman, saham, imbal hasil, atau marketplace pembuat kampanye publik.

### Pengembangan berikutnya

Donasi berulang, metode/gateway tambahan, aplikasi mobile, bahasa tambahan, logistik barang, pencarian khusus, dan kampanye publik hanya masuk melalui PRD revisi beserta kebutuhan legal/operasi dan evaluasi biaya. Tidak dijadikan prerequisite R1.

## 7. Arsitektur informasi dan pengalaman

Navigasi utama R1: **Program**, **Inisiatif**, **Cerita**, **Tentang**, **Transparansi**. FAQ dan kontak tersedia pada header/menu bantuan serta footer. CTA utama: **Hubungi tim melalui WhatsApp**. Pada mobile, navigasi berlabel, menu sederhana, dan tombol kontak tidak menutup konten atau fokus keyboard. Halaman admin berada pada `/admin` dan memerlukan autentikasi server.

### Beranda

Urutan: identitas dan misi singkat → tiga program → inisiatif pilihan → cara berpartisipasi → pembaruan kegiatan → identitas/tata kelola → FAQ ringkas → kontak. Hero memakai satu foto kontekstual yang disetujui dan teks HTML. Hindari carousel otomatis, splash preloader, counter animasi dari nol, serta foto penderitaan tanpa konteks.

Tidak ada angka dampak ketika bukti belum tersedia. Empty state menjelaskan bahwa kegiatan masih disiapkan. Nama mitra, nomor izin, badge, testimoni, logo, dan statistik hanya muncul jika benar-benar tersedia beserta sumber. Logo Charity dan foto drone tidak diteruskan ke situs baru.

### Daftar dan detail inisiatif

Kartu menampilkan judul, program, lokasi tingkat kota/kabupaten bila aman, status kegiatan, ringkasan, gambar, dan tanggal pembaruan. Detail menyajikan tujuan, konteks, penanggung jawab, status dan jadwal, kebutuhan kolaborasi, pembaruan, media beserta konteks, FAQ, serta kontak. Informasi yang belum dipastikan diberi label “rencana”; tidak menggunakan urgensi palsu.

R2 menambahkan target dana, penerimaan terkonfirmasi net refund, tenggat, rencana anggaran, ketentuan biaya, status verifikasi dan izin, pembaruan penyaluran, serta CTA “Donasi”. Kampanye yang ditutup mempertahankan laporan publik, tetapi checkout tidak dapat dibuat.

### Kontak WhatsApp

Pengunjung memilih program → melihat penjelasan bahwa WhatsApp merupakan layanan eksternal → memilih hubungi → aplikasi/browser WhatsApp terbuka dengan pesan generik seperti “Halo tim Shareat, saya ingin mengetahui program Share Eat dan peluang kolaborasi.” Pengguna meninjau lalu mengirim sendiri. Website tidak otomatis mengirim pesan, menyimpan isi percakapan, atau memastikan tim telah membalas.

Jika WhatsApp tidak tersedia, halaman kontak menyediakan nomor resmi yang dapat disalin, jam layanan yang disetujui, dan penjelasan untuk memakai WhatsApp Web. Email hanya ditampilkan jika akun tersebut aktif dan dipantau; tidak dibuat-buat. Kanal ini bukan kanal darurat.

### Pengalaman R2

Pilih kampanye → nominal dan identitas minimum → ringkasan biaya/ketentuan → hosted checkout → halaman status → receipt setelah konfirmasi server → laporan kegiatan berikutnya. Anonim publik tersedia. Status “menunggu konfirmasi” tetap benar ketika redirect lebih cepat daripada webhook. “Pembayaran diterima” tidak sama dengan “bantuan tersalurkan”.

## 8. Arah visual dan bahasa

Identitas visual usulan: navy sebagai teks/struktur, hijau gelap sebagai CTA, latar terang yang hangat, kartu bersih, garis pembatas ringan, dan tipografi sans yang mudah dibaca. Token dan ukuran konkret ada di SDD. Warna program membantu orientasi tetapi label teks tetap utama.

Gunakan foto aktivitas nyata yang menghargai penerima manfaat, keseimbangan ruang kosong, hirarki judul jelas, format rupiah dan tanggal Indonesia, serta bahasa tanpa jargon. Kepercayaan dibangun lewat konsistensi informasi, identitas penanggung jawab, kebijakan, bukti, dan status yang jujur. Teks seperti “100% aman”, “pasti tersalurkan”, “diawasi regulator”, atau “resmi” tidak boleh ditampilkan tanpa dasar yang tepat.

Satu bahasa awal: Bahasa Indonesia, `lang=id`, zona tampilan Asia/Jakarta. Tidak semua masyarakat Indonesia memakai WIB; label WIB ditampilkan pada jadwal yang membutuhkan jam. Lokasi sensitif tidak dipublikasikan rinci.

## 9. Ukuran keberhasilan

Angka berikut merupakan **target usulan**, bukan hasil pengukuran atau jaminan bisnis. Baseline dikumpulkan empat minggu pertama setelah R1. Pencatatan minimal dan dasar pemrosesannya mengikuti kebijakan privasi.

| Indikator | Definisi | Target awal |
| --- | --- | --- |
| Pemahaman misi | Peserta riset dapat menjelaskan misi dan menemukan program tanpa bantuan | ≥80% dari minimal 12 peserta lintas kelompok usia |
| Kemudahan kontak | Peserta menemukan CTA dan membuka WhatsApp sesuai konteks | ≥90% keberhasilan task; median ≤60 detik |
| Minat program | Klik kontak unik perkiraan dibagi kunjungan detail inisiatif | Ukur baseline; tidak menetapkan conversion rate sebelum data tersedia |
| Kualitas publikasi | Konten publik dengan checklist identitas, bukti, media, SEO lengkap | 100% |
| SEO | URL publik eligible terbaca, canonical tepat, masuk sitemap | 100% pada audit rilis; ranking/indexing tidak dijamin |
| Pengalaman | CWV field pada persentil 75 per template | LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1 |
| Stabilitas | Ketersediaan endpoint publik | Sasaran 99,5% per bulan setelah capacity test |
| Balasan WhatsApp | Kontak dijawab tim pada jam layanan | Target usulan ≤1 hari kerja, dicatat manual/agregat |
| Ketepatan dana R2 | Pembayaran, ledger dan settlement tanpa selisih tidak terjelaskan | Rekonsiliasi harian; semua selisih punya tiket dan owner |
| Pelaporan R2 | Kampanye berjalan mempunyai pembaruan tepat waktu | Setiap ≤30 hari dan setiap penyaluran material |

Klik WhatsApp hanya menandakan outbound click, bukan pesan terkirim atau donor. Transaksi berhasil diukur server pada R2. Laporan tidak menggabungkan klik, janji bantuan, pembayaran, dan dampak sebagai satu conversion.

## 10. Prioritas dan delivery

| Tahap | Keluaran | Syarat lanjut |
| --- | --- | --- |
| D0 keputusan dan inventaris | Dokumen ini, audit aset, pilihan nama/kontak, editorial | Review baseline dan pemilik keputusan jelas |
| D1 spike stack dan hosting | Nuxt SSR, shadcn-vue, DB migration, login admin, media, cron dan restore pada kandidat hosting | [Gate hosting](SDD.md#11-infrastruktur-dan-deployment) lulus; lockfile dicatat |
| D2 desain dan konten R1 | Prototype mobile/desktop, token, template halaman, konten nyata, izin media | Uji lintas usia dan checklist konten lulus |
| D3 implementasi R1 | Website + CMS + WhatsApp + SEO + operasi | Semua requirement R1 dan NFR berlaku lulus |
| D4 peluncuran R1 | Domain, monitoring, backup, kanal resmi, bantuan tim | Gate R1 di register terpenuhi |
| D5 kesiapan fundraising | Badan hukum/izin, gateway, SOP finance, fee/refund, due diligence | Bukti gate R2 lengkap |
| D6 implementasi dan pilot R2 | Sandbox → rekonsiliasi → pilot terbatas → fundraising | Semua requirement R2 lulus, uji recovery uang dan operasi lulus |

Estimasi waktu dan anggaran tidak ditetapkan sebelum kapasitas tim, volume konten, host, serta proses legal diketahui. Urutan di atas menunjukkan dependency kerja; bukan janji tanggal.

## 11. Kriteria peluncuran

R1: identitas yang benar, tiga halaman program tanpa klaim palsu, nomor WhatsApp dan jam layanan yang valid, media berizin, CMS aman, konten SSR, tidak ada fitur penerimaan dana, tidak ada kebocoran preview, aksesibilitas/performa sesuai SRS, serta restore yang telah diperagakan.

R2: semua gate R1 tetap berlaku; legal dan gateway disetujui; biaya serta refund diterbitkan; identity/role separation finance aktif; duplicate/late webhook, unknown timeout, settlement difference, refund sesudah payout dan pemulihan backup diuji. Tidak ada activation hanya melalui perubahan tombol frontend.

## 12. Risiko dan batas kepastian

Risiko utama adalah hosting tidak mendukung Node, lisensi aset tidak tersedia, tim belum mempunyai konten/bukti asli, WhatsApp tidak dipantau, dan fundraising diaktifkan sebelum tata kelola siap. Risiko transaksi tambahan adalah status salah, double posting, selisih settlement, fraud, dan penyaluran tanpa persetujuan. Mitigasi serta owner ada di [DECISIONS](DECISIONS.md).

Permintaan “tanpa gap” diterjemahkan sebagai cakupan dan keterlacakan yang diperiksa, edge case yang eksplisit, dan keputusan terbuka yang dapat ditindaklanjuti. Dokumen tidak dapat menjamin tidak ada kebutuhan baru, semua aturan hukum telah teridentifikasi, atau aplikasi bebas bug sebelum implementasi dan validasi lapangan.

## 15. Preview dan penerimaan implementasi

Preview R1 memakai DB/CMS, bukan hardcoded daftar program/kegiatan. Narasi demo, tanggal, author, organisasi dan kebijakan contoh diberi label; noindex berlaku pada seluruh preview. Copy misi dan struktur navigasi boleh menjadi fondasi desain, sedangkan konten editorial dapat diubah melalui review revision. Publication tetap mensyaratkan identitas berbeda, termasuk pada demo. Pengukuran trafik non-esensial belum diaktifkan (FR-018 Should). Preview lokal tidak menerima uang dan tidak merupakan launch produksi. [IMPLEMENTATION](IMPLEMENTATION.md) menyimpan bukti serta bagian yang belum diterima; semua gate Must produksi tetap berlaku.
