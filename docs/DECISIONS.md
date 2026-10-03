# Keputusan asumsi dan risiko Shareat

**Versi:** 1.1 · **Tanggal:** 3 Oktober 2026. Dokumen ini menyimpan keputusan yang telah disampaikan pemilik, usulan teknis, dan dependency yang perlu dibuktikan. Kolom owner adalah fungsi yang harus ditunjuk, bukan nama staf yang diasumsikan tersedia.

## 1. Keputusan pemilik yang sudah diketahui

| Kode | Keputusan | Konsekuensi |
| --- | --- | --- |
| U-01 | Fullstack Nuxt + TypeScript + Shadcn | shadcn-vue untuk Nuxt; backend bukan PHP |
| U-02 | Dokumentasikan syarat minimum hosting dahulu | Tidak mengklaim provider/paket terpilih; spike menjadi gate |
| U-03 | Hanya tim Shareat dan mitra terverifikasi | Tidak ada self-service campaign publik; approval dan organization scope |
| U-04 | Badan hukum/izin dan gateway belum tersedia | R2 deferred, tidak menerima pembayaran pada R1 |
| U-07 | Preview WA 087776734038 dan konten dummy dinamis | DB-backed demo berlabel/noindex; identitas/jam/operator nyata tetap gate produksi |
| U-05 | Awalnya WA untuk reach out | Kontak eksternal berbasis klik pengguna; bukan automated WA send atau manual payment flow |

Keputusan tambahan U-06 pada 3 Oktober 2026: pemilik melarang penggunaan GitHub Actions. Workflow dihapus dan pemeriksaan dilakukan lokal dengan bukti pada PR. Konfigurasi proteksi main yang dituju tetap mewajibkan PR tanpa required check Actions; pengaturan server harus diverifikasi sebelum merge.

## 2. ADR ringkas

| ADR | Keputusan desain usulan | Alasan dan tradeoff | Bukti sebelum diterapkan |
| --- | --- | --- | --- |
| ADR-01 | R1 informasi/WA, R2 fundraising | Sesuai readiness dan klarifikasi; harus menjaga lingkup di konten/admin/API | FR-017 negative test dan editorial audit |
| ADR-02 | Nuxt4 modular monolith SSR | Satu stack TypeScript dan overhead operasi rendah; membutuhkan Node runtime | Build/auth/SSR/DB/hosting spike |
| ADR-03 | shadcn-vue + Tailwind4 | Cocok Vue dan komponen dapat dimiliki proyek; perangkat/browser sangat lama perlu fallback | Compatibility dan accessibility prototype |
| ADR-04 | MySQL supported target8.4 + Drizzle/mysql2 | Selaras hosting relational dan transaksi; MariaDB bukan pengganti tanpa test | Migration/FK/concurrency/query test actual |
| ADR-05 | CMS DB-backed dengan revisions | Tidak perlu build ulang setiap edit; dual review dan publish snapshot lebih kompleks | Concurrent edit/private preview/publish test |
| ADR-06 | Opaque DB session + MFA staff | Revocable, scope dan recovery terkontrol; implementasi auth perlu review security | Session/CSRF/MFA/lockout tests |
| ADR-07 | Private storage dan derivatives publik | Bukti/media sensitif terlindungi; perlu pipeline scan/rights serta quota | Signed access/exif/AV/quota/backup test |
| ADR-08 | Cron one-shot + transactional outbox | Sesuai shared hosting tanpa worker daemon; delay cron membatasi notifikasi | Lease/retry/crash/dead letter test |
| ADR-09 | URL `/inisiatif/{slug}` stabil R1/R2 | Mempertahankan inbound dan laporan; UI R2 boleh memakai istilah kampanye | Canonical/redirect/sitemap tests |
| ADR-10 | R2 hosted checkout satu gateway via adapter | Meminimalkan data pembayaran; vendor/capability belum dipilih | Sandbox callbacks, refund, settlement, merchant approval |
| ADR-11 | R2 ledger append-only + reservations + dual control | Mencegah double posting/overspending; menambah SOP dan kebutuhan accountant | Invariant, parallel payout, crash/replay, reconciliation tests |
| ADR-12 | Rp0 fee donor/campaign, fee gateway dari operator | UX sederhana dan principal tidak dipotong; memerlukan modal operasi dan saldo kas | Persetujuan owner + finance dan sumber biaya |
| ADR-13 | Flexible funding, surplus dijelaskan, tidak hard cap | Kegiatan dapat disesuaikan sesuai kebijakan; donor harus memahami kondisi gagal/target tidak tercapai | Ketentuan published legal/finance review |
| ADR-14 | Naikkan hosting bila gate R2 gagal | Keandalan uang memerlukan recovery lebih ketat; deployment mungkin keluar dari shared host | Availability/PITR/cron/webhook/load evidence |

ADR-15 menetapkan validasi dan build lokal tanpa GitHub Actions berdasarkan keputusan eksplisit pemilik. Validator, whitespace, reproduksibilitas checkout bersih, dan pemeriksaan aplikasi yang relevan tetap wajib; hasilnya ditinjau pada PR.

Jika keputusan berubah, buat ADR revisi dengan trigger, opsi, alasan, perubahan FR/NFR, migration dan konsekuensi operasi. Tidak mengganti keputusan hanya pada satu dokumen.

## 3. Register keputusan terbuka

| Kode | Hal yang belum tersedia | Baseline sementara | Owner | Deadline dependency |
| --- | --- | --- | --- | --- |
| O-01 | Nama legal/merek, logo final dan domain | Shareat adalah nama kerja; logo Charity tidak dipakai | Product/brand | Sebelum public identity R1 |
| O-02 | Provider/paket Node dan DB actual | Syarat minimum SDD, target Node24/MySQL8.4 | Engineering/operations | Sebelum deployment R1 |
| O-03 | Nomor WA resmi, jam dan operator | Nomor sementara preview tersedia: 6287776734038; jam/operator/ownership produksi belum disahkan | Product/support | Sebelum launch R1 |
| O-04 | Konten, tim/mitra aktual, wilayah dan agenda | Tiga program dari brief; kegiatan ditandai rencana sampai bukti tersedia | Editorial/program owner | Sebelum publish tiap konten |
| O-05 | Lisensi foto, font, logo, consent dan bukti lokasi | Semua aset referensi belum diizinkan publikasi | Brand/privacy | Sebelum asset published |
| O-06 | Dua staff untuk review dan recovery | Role sudah didesain, orang belum ditunjuk | Product/operations | Sebelum CMS publikasi R1 |
| O-07 | Kebijakan privasi, retensi dan layanan WA | Baseline usulan SRS; kanal WA perlu akses/retensi sendiri | Privacy/legal/support | Sebelum launch R1 |
| O-08 | Traffic/volume actual, biaya host/storage/maintenance | Workload usulan NFR, tidak menjadi janji paket murah | Product/engineering | Sebelum kapasitas dan anggaran R1 disetujui |
| O-09 | Badan hukum, izin/cakupan/wilayah penggalangan | Tidak ada fundraising R1 | Legal/organization owner | Sebelum activation R2 |
| O-10 | Kewajiban PSE, pajak, pembukuan, pelaporan, audit, batas biaya dan donor policy | Pemeriksaan legal khusus model donation kemanusiaan; bukan securities/investment | Legal/finance | Sebelum activation R2, review berkala |
| O-11 | Gateway, merchant approval, rekening dan channel | Calon adapter Midtrans; VA/QRIS/e-wallet bersyarat | Finance/engineering | Sebelum sandbox/fundraising R2 |
| O-12 | Tarif gateway, fee policy, anggaran operasional | Usulan Rp0 fee donor/campaign, operator membayar biaya | Product/finance | Sebelum R2 checkout dibuat |
| O-13 | Funding/refund/surplus dan tujuan gagal | Flexible funding usulan; surplus dan perubahan tujuan harus dijelaskan per campaign | Legal/program/finance | Sebelum campaign active R2 |
| O-14 | Finance maker/checker, accountant dan penerima/payee verified | Role split wajib; manual transfer baseline | Finance/operations | Sebelum R2 payout/refund |
| O-15 | RPO15m/PITR dan availability R2 di host | Tidak dianggap didukung shared host; upgrade jika gagal | Engineering/operations | Sebelum menerima uang R2 |
| O-16 | Kanal email R2 dan guest receipt, deliverability | Transactional email adapter required untuk R2; R1 staff recovery supervised | Engineering/support | Sebelum R2 guest checkout |
| O-17 | AV scanner dan image pipeline pada host | Scan sebelum private PDF access/public derivative; service adapter atau lingkungan build lokal bila native gagal | Engineering/security | Sebelum media workflow R1 |
| O-18 | Analytics vendor dan dasar pemrosesan | Optional minimal agregat, disabled until policy ready | Product/privacy | Sebelum analytics non-esensial aktif |

Register terbuka adalah dependency yang sengaja terlihat, bukan placeholder implementasi tanpa owner. Dokumen sudah mendefinisikan perilaku aman ketika dependency belum ada: unpublished, disabled atau blocked activation sesuai kasus.

## 4. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi dan indikator | Owner |
| --- | --- | --- | --- |
| Host PHP-only/Node EOL/ESM tidak cocok | SSR/CMS tidak berjalan | Gate actual artifact; pilih runtime yang supported | Engineering |
| Konten palsu atau angka template masuk publik | Kepercayaan dan legal/privacy incident | Published review snapshot + sumber + tidak memakai contoh Charity sebagai fakta | Editorial |
| Media belum berizin atau identitas anak terpapar | Pelanggaran hak/privasi | Default private, rights/consent review, EXIF stripped, minimisasi | Privacy |
| Nomor WA berubah/akun diambil alih | Pengunjung diarahkan ke penipu | Dual approval nomor, MFA admin, WA bisnis access controls, monitor link | Security/support |
| WA tidak dipantau | Minat tidak terjawab | Jam factual, operator backup, target reply, manual aggregate review | Support |
| Lintas organisasi/draft bocor | Kerahasiaan dan kredibilitas | Server auth scope + DTO allowlist + no-store preview + negative tests | Engineering |
| Cache menampilkan konten withdrawn | Koreksi/consent tidak efektif | Immediate purge all layers, no stale sensitive content, purge alert | Operations |
| Gate R2 hanya flag frontend | Penggalangan tanpa readiness | R2 routes excluded R1, server policy verifies permit/channel/state | Engineering/legal |
| Gateway duplicate/late/unknown | Status salah dan double accounting | Unique order/event/journal, monotonic state, reconcile and suspense | Finance/engineering |
| Fee gateway menghabiskan kas principal | Payout tidak dapat memenuhi campaign | Fee budget operator, bank cash check, top-up reconciliation | Finance |
| Payout/refund concurrent | Overspending/transfer ganda | Dual control, fund+cash locks, reservations, external reference reuse | Finance |
| Restore kehilangan transaksi | Saldo tidak benar | PITR R2, freeze+gateway/bank replay, projection rebuild, checker reopen | Operations/finance |
| Performa gagal di perangkat nyata | Pengguna sulit kontak/baca | Real device/lintas usia, modern browser boundary, static fallback, RUM | Design/engineering |
| Scope membesar terlalu dini | R1 tertunda dan biaya tinggi | R2 terpisah; tidak membuat marketplace/LMS/logistik sebelum PRD revisi | Product |

## 5. Gate R1

Gate berikut berlaku sebelum launch produksi. Sebagian kontrol aplikasi sudah diuji lokal; bukti dan batasnya ada pada [IMPLEMENTATION](IMPLEMENTATION.md), tanpa menyatakan seluruh gate lulus:

- Identity/domain/nomor WA/jam/operator benar dan disetujui; pesan/preset tidak mengandung ajakan bayar atau data personal.
- Konten tiga program, halaman inti, privacy/terms, dan media mempunyai sumber serta izin; empty state/rencana factual; tidak ada badge/angka fiktif.
- Editor, reviewer dan pemulihan staff ditunjuk; scope mitra, MFA, revision/publication, change nomor WA dan privacy handling diuji.
- Node/DB/storage/cron/backup hosting lulus spike dan workload R1; requirement NFR yang berlaku mempunyai hasil ukur dan owner.
- SEO SSR, sitemap/canonical, noindex/private boundary, status/error dan redirect diuji; route uang R2 tidak terdaftar.
- Restore R1 memenuhi sasaran atau target disesuaikan secara eksplisit sebelum launch; monitoring/runbook/channel support aktif.

## 6. Gate R2

- Badan hukum, izin penggalangan, scope wilayah/masa berlaku, aturan pelaporan/audit dan kegiatan telah diperiksa legal dan evidence dicatat. Pemeriksaan meliputi regulasi PUB yang berlaku serta pembaruan setelah sumber dokumen ini.
- Gateway merchant/channel/provider contract, rekening settlement, fee/funding/refund/surplus/chargeback policy dan rekening penerima terverifikasi.
- Maker/checker finance berbeda identitas, accountant review chart/subledger, SOP transfer dan bukti penyaluran serta report cutoff tersedia.
- Sandbox payment webhook, missing/out-of-order/duplicate events, provider timeout/404, refund unsupported, payout unknown, dispute dan restore/replay telah diuji.
- Host mendukung target recovery/availability/burst R2; jika gagal, pindahkan runtime/data lebih dulu; legal gating tidak diaktifkan hanya karena checkout tampak bekerja.
- Pilot terbatas membuktikan rekonsiliasi end-to-end, receipts/guest access aman, bank/fee/ledger konsisten, dana tidak disalurkan tanpa clearance dan evidence.

Tanggung jawab owner produk adalah menyetujui kebutuhan bisnis dan kebijakan. Pengembang membuktikan desain/implementasi, operator membuktikan recovery, finance membuktikan saldo/approval, dan legal membuktikan legal readiness. Tidak ada satu checkbox yang menggantikan semua fungsi tersebut.

## 8. ADR hasil implementasi preview R1

| ADR | Keputusan aktual | Konsekuensi dan status |
| --- | --- | --- |
| ADR-16 | `content_entities` + revision FK untuk lima jenis konten, satu organisasi per user dan roles JSON schema-validated | Mengurangi duplikasi CMS; ownership/private DTO tetap diperiksa. Tidak ada memberships multi-org atau tabel finance pada R1. Schema/migrations aktual menggantikan tabel R1 konseptual SDD |
| ADR-17 | Password+TOTP satu request, OTP anti-replay, opaque session 8 jam/idle30m; pemulihan dua admin supervised | Tidak ada full session sebelum MFA, tidak ada offline recovery code. Token invite24h/enrollment5m/recovery24h; recovery mencabut sessions sebelum reenrollment |
| ADR-18 | Tidak ada cache publik pada preview; semua konten/media dibaca dari pointer published saat request | Withdrawal langsung tanpa purge CDN; beban DB lebih tinggi. Cache dan workload50rps tidak diklaim selesai; jika cache ditambahkan wajib purge+test baru |
| ADR-19 | Private media stream terautentikasi, raw upload bounded, scanner executable fixed dari config | Tidak menggunakan signed bearer URL. Tanpa scanner, file tetap quarantine; rights tidak dapat melewati scan. Linux native dependency/AV perlu host spike |
| ADR-20 | Analytics non-esensial FR-018 deferred pada preview | Tidak ada tracker/consent-cookie palsu. Event aggregate hanya ditambahkan setelah purpose/retention serta acceptance disetujui |
| ADR-21 | Konten demo editable dan nomor sementara sesuai U-07; prod menolak demo | Preview bukan bukti kegiatan nyata atau review legal. Gate produksi tetap blocking |

Tanggal keputusan teknis: 3 Oktober 2026. Pilihan yang mengubah kontrak sudah diselaraskan pada SRS/SDD/API/traceability. Pemeriksaan lokal membuktikan bagian yang terukur; external operator/legal/hosting readiness tetap terbuka.

Dependency audit preview: npm melaporkan 15 advisori transitif (11 high, 4 moderate). Tidak melakukan downgrade Nuxt major atau force audit fix tanpa compatibility review. [IMPLEMENTATION](IMPLEMENTATION.md) mencatat analisis artifact dan sisa risiko. NFR-003 menghalangi release bila temuan tinggi/kritis dapat dieksploitasi; review dependency serta upstream fix menjadi gate sebelum produksi.
