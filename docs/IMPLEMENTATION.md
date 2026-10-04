# Status implementasi dan bukti R1

**Versi:** 0.1.0 preview · **Tanggal:** 3 Oktober 2026 · **Branch:** feat/r1-platform-implementation.

R1 informasi/CMS/WhatsApp sudah diimplementasikan dan diuji lokal. Data program, inisiatif, cerita, FAQ, halaman, kebijakan dan kontak disimpan di PostgreSQL serta dapat diubah melalui kontrol publikasi. Nomor sementara pemilik6287776734038. Konten/identitas/jam contoh ditandai demo dan noindex. Ini bukan launch produksi atau pernyataan seluruh gate Must lulus. R2 tidak dibuat pada source/schema/API R1.

## Lingkungan dan bukti

Node 24.19.0, PostgreSQL 18.6 Docker, Nuxt 4.5.2, Vue 3.5.43, TypeScript 6.0.3, shadcn-nuxt2.8.2, reka-ui2.10.5, Tailwind 4.3.3, Drizzle 0.45.3/pg 8.23.1. Versi exact dan transitif dikunci package-lock.json. Browser Playwright Chromium 153; tidak dianggap bukti Safari/Firefox/perangkat WA nyata.

| Pemeriksaan | Hasil aktual |
| --- | --- |
| npm run check | Lint max-warnings0, strict typecheck,18 unit test, dan artifact build berhasil |
| Reproduksi source bersih | Git archive staged snapshot: npm ci, lint, typecheck dan18 unit lulus; generated docs identik setelah normalisasi newline; Docker artifact Linux dari snapshot bersih lulus. Rebuild Windows di folder bersarang dihentikan saat bundle berjalan lama; build Windows workspace utama lulus |
| npm run format:check | Semua source yang termasuk scope formatter lulus |
| docker build --target runtime -t shareat-r1:postgres . | Build Linux Node 24.19.0 berhasil, runtime usernode dan private media writable |
| TEST_BASE_URL=http://127.0.0.1:3003 npm run test:e2e | Artifact Linux clean snapshot dengan DB PostgreSQL nyata terisolasi; Lulus 12/12 dalam24,8 detik setelah hardening alias dan recovery, termasuk assertion console error/hydration |
| jobs:run / preflight | Cleanup/outbox one-shot berhasil; preflight menolak env demo secara sengaja (BLOCKED production HTTPS/mode/scanner) |
| Migration PostgreSQL0000 | Fresh DB diterapkan dua kali tanpa duplikasi;13 tabel, FK/index/JSONB/timestamptz; db:generate melaporkan no schema changes |
| npm run test:integration |8/8 pada PostgreSQL18.6 fresh demo terisolasi; JSONB literal search/Unicode/order/demo, concurrent edit409, rollback, FK/unique, UTC/timeout, CAS MFA/upsert, rate limit atomik, SKIP LOCKED, alias/create lock dan identity lifecycle revocation |
| Seed fresh/ulang | Fresh17 entity/17 revision/3 user, 0 broken published pointers; seed ulang tidak menimpa konten atau akses existing; credential privat |
| Cutover preview lokal |32 entity/47 revision/16 user dipindahkan;11 payload tabel sama dengan export setelah konversi boolean dan revocation challenge yang disengaja. Session lama dicabut; database/volume/dump lama dipertahankan privat |
| Restore PostgreSQL terisolasi | pg_dump custom/no-owner/no-acl → pg_restore exit-on-error ke shareat_pg_restore_test; restore0,41 detik untuk32 entity/47 revision/16 user;0 broken pointer,11 payload cocok. Bukan RPO/RTO atau offsite produksi |
| npm audit --json |15 advisori:11 high/4 moderate, exit nonzero; review/upstream fix tetap gate |
| Audit registry manifest Linux runtime |74 versi package dalam manifest Linux termasuk h3 bundled, graph157 package; npm audit0 advisori. Lock audit dibuat pada Node24 Linux untuk native Sharp; bukan audit lengkap compiled code/SBOM atau pembuktian semua high tidak exploitable |
| python docs/tools/validate_docs.py | Struktur requirement/traceability/link/inventaris; hasil di VALIDATION, tidak menjalankan app |

Riwayat perbaikan baseline sebelum PostgreSQL: uji Linux awal menemukan503 upload karena direktori media nonroot belum writable; Dockerfile diperbaiki dan suite diulang. Test publish incomplete awal gagal, lalu service diperbaiki untuk responsibility/author/effectiveDate. Uji konsol juga menemukan mismatch noscript berisi elemen nav; fallback diganti teks yang mengarahkan ke footer anchor SSR dan assertion console error ditambahkan. Bukti lulus berasal dari rerun setelah perbaikan, bukan dari menghapus assertion.

Review PostgreSQL menemukan race create/alias pada path belum ada; regression test awal gagal karena create lolos. Namespace advisory transaction lock ditambahkan pada create dan rename sebelum row locks, kemudian7/7 integrasi lulus. Default PostgreSQL READ COMMITTED dipertahankan; lock namespace melindungi missing rows tanpa bergantung gap locking.

Build berhasil dengan diagnostic dependency/tooling: Rolldown PLUGIN_TIMINGS, Vue/VueUse deprecated package export, dan komentar PURE Zod/scure yang diabaikan bundler. Tidak ada lint warning milik source aplikasi. Docker build metadata Git tidak tersedia karena .git tidak masuk context; commit/image digest harus dicatat saat release. Warna terminal Playwright melaporkan NO_COLOR/FORCE_COLOR, bukan warning source.

## Keterlacakan R1

Label **implemented** berarti kontrol kode tersedia dan memiliki bukti lokal terkait; **partial** berarti skenario normatif atau dependency belum lengkap. TC tetap acceptance scenario, bukan satu test otomatis per requirement. Semua gate produksi tetap berlaku.

| Requirement / TC | Status preview dan source | Bukti / gap produksi |
| --- | --- | --- |
| FR-001 / TC-001 | Implemented: app/pages, default layout, Bahasa Indonesia/SSR | Route publik dan nav diuji; identitas aktual belum tersedia |
| FR-002 / TC-002 | Implemented: shared contracts, content service/repository, CMS | Generic program revision, no hard-delete API; migration/duplicate409/reserved route422/concurrency; program baru melalui CMS |
| FR-003 / TC-003 | Implemented: ContentCollection, public SQL page | Filter/query bounds, zero/reset, page404; query workload10k belum diukur |
| FR-004 / TC-004 | Implemented: ContentDetail, state/slug/redirect |404/410/301, published snapshot; responsibility wajib; agenda aktual belum tersedia |
| FR-005 / TC-005 | Partial: transparency page dan editorial checklist | Demo jelas, tanpa angka/izin/mitra nyata; tim/legal/evidence produksi belum disetujui |
| FR-006 / TC-006 | Implemented: generic CMS, PolicyVersion, policy APIs | Published archive/private DTO/date guard; story author/program relation; optional relation langsung ke initiative belum ditambahkan |
| FR-007 / TC-007 | Implemented: ContactButton/web contract | Encoded wa.me/6287776734038 dengan fallback konteks netral untuk judul berisi input sensitif, tanpa automatic send; Android/iOS native WA belum diuji |
| FR-008 / TC-008 | Implemented: contact page/setting service | Link anchor SSR, copy fallback, jam contoh WIB; SSR tanpa JavaScript diuji pada390px (WA anchor dan5 footer links); operator/ownership produksi serta perangkat native belum diterima |
| FR-009 / TC-009 | Implemented: admin content/preview, transactional mutate | Private auth/no-store/noindex, save409, concurrent writes, old snapshot tetap |
| FR-010 / TC-010 | Implemented: team proposals/invite/activate/suspend | Verified scope/role restriction, org suspension dan session revoke; due diligence mitra nyata belum dilakukan |
| FR-011 / TC-011 | Implemented: checklist dan separate reviewer | Self-review403/checklist422, publish atomic, archive410/sitemap/media boundary; no cache preview, CDN purge future |
| FR-012 / TC-012 | Partial: media service/rights/private routes | Actual MIME/SVG/oversize/path/PNG/PDF/quarantine tests; belum ada AV real clean/EXIF/rights end-to-end host, quota atau revoke-rights khusus |
| FR-013 / TC-013 | Implemented: auth utils/API/crypto | Password+TOTP, replay, CSRF/origin, rotate/revoke, activation/recovery dua admin; penilaian resource scrypt host tetap gate |
| FR-014 / TC-014 | Implemented: transactional audit dan audit API | Publish/contact/invite/suspend/recovery/download dicatat, no log mutation API; DBA/offsite integrity dan export/search belum tersedia |
| FR-015 / TC-015 | Implemented: usePublicSeo/sitemap/robots/CSP | Raw SSR canonical/noindex, JSON-LD escaped, private DTO, error statuses; indexing/ranking tidak dijanjikan |
| FR-016 / TC-016 | Implemented: ShareLink dan original OG | Native share/copy fallback, static image1200x630; native permission deny lintas perangkat belum diuji lengkap |
| FR-017 / TC-017 | Implemented: strict schema/contact proposal/unknown API404 | Financial field422 dan payment endpoint404; contact second approval/version audit; domain/production mode masih gate |
| FR-018 / TC-018 | Deferred Should preview: analytics disabled | Tidak ada tracker/event PII; aggregate outbound/view/search baru sesudah purpose/consent/retention disetujui |
| FR-019 / TC-019 | Partial: kontak/koreksi dan OPERATIONS SOP | Tidak ada operator/jam nyata atau latihan respon keluhan; target satu hari kerja masih usulan |
| FR-020 / TC-020 | Partial:503/error UI/health/no-store | UI truthful dan dependency errors redacted; injection outage/host restart/alert eksternal belum lengkap |
| NFR-001 / TC-036 | Partial: SSR, bounded reads, static assets | Belum3-run Lighthouse, CWV field, TTFB/p95 workload host |
| NFR-002 / TC-037 | Partial: shadcn primitives/labels/focus/touch/reflow | Axe WCAG2.2 AA enam template, keyboard menu/Escape,320px; screenreader/zoom/riset≥12 peserta belum dilakukan |
| NFR-003 / TC-038 | Partial: MFA/scrypt/AES/CSRF/CSP/upload/DTO | Critical negative tests lulus;15 dependency audit advisories dan security review produksi masih gate |
| NFR-004 / TC-039 | Partial: DTO allowlist/private stream/log minimization | Tidak ada secret pada public DTO; signed URLs diganti authenticated stream; retention/privacy suppression/offsite belum lengkap |
| NFR-005 / TC-040 | Partial: responsive UI | Width320/390/768/1440 Chromium, tanpa overflow;1920/Safari/Firefox/WA in-app matrix belum lengkap |
| NFR-006 / TC-041 | Implemented untuk preview: SSR/head/status/sitemap/redirect | Demo noindex; filter self-canonical normalized; sitemap split dan remote staging auth masih gate |
| NFR-007 / TC-042 | Open external: uptime target99,5% | Tidak ada host/probe bulanan nyata; health lokal tidak membuktikan availability |
| NFR-008 / TC-043 | Partial: manifest checker dan local DB restore | Offsite encryption/media/key/suppression/restore timing produksi belum diuji |
| NFR-009 / TC-044 | Open capacity: query pagination/pool bound tersedia | Tidak ada cache atau load30 menit10k initiative/50rps; tidak boleh mengklaim scalable workload sudah terbukti |
| NFR-010 / TC-045 | Partial: strict code/lockfile/migrations/local checks | Build Windows/Linux dan tests; dependency review serta clean checkout evidence pada PR; tidak ada Actions |
| NFR-011 / TC-046 | Partial: log JSON/requestId/health/jobs/backup checker | External alert/queue age/resource metrics/retention belum terintegrasi |
| FR-021..035, NFR-012 / TC-021..035,047 | Deferred R2 | Tidak ada gateway/donor/ledger/payout/refund; seluruh legal/finance/gateway/recovery gate belum terpenuhi |

## File dan alur utama

[Content service](../server/modules/content/service.ts) mengatur ownership/lifecycle, [PostgreSQL repository](../server/modules/content/postgres-repository.ts) memegang lock/version/audit/outbox, [schema](../server/db/schema.ts) memegang FK/index. [Auth](../server/utils/auth.ts) memeriksa session/CSRF, [crypto](../server/modules/identity/crypto.ts) menjaga password/MFA. [Media](../server/modules/media/service.ts) memeriksa bytes dan scan. [Tests](../tests/) memuat assertion; [API](API.md), [DEVELOPMENT](DEVELOPMENT.md), [OPERATIONS](OPERATIONS.md) menjelaskan kontrak dan reproduksi.

## Preservasi media preview

Delapan metadata asset lama dipertahankan. Lima original yang tersedia pada direktori lama Windows/Linux cocok SHA256 dan disalin ke volume media preview persisten. Tiga original fixture lama sudah tidak tersedia pada source penyimpanan yang diperiksa; tidak dibuat media pengganti atau dipublikasikan. Semuanya tetap quarantine dan memerlukan re-upload/scan/rights sebelum dipakai. Kekurangan fixture ini dibedakan dari29 missing references HTML legacy pada VALIDATION. Backup DB tidak membuktikan kelengkapan media/key/offsite.

## Sisa pekerjaan yang menghalangi launch

Host/domain/HTTPS, konten dan identitas aktual, privacy/terms review, operator dan dua staff nyata, AV/media rights, dependency security review, cache/purge/capacity, backup offsite/media/key/privacy restore, alerts, browser matrix/CWV/riset aksesibilitas. Team/media/audit lists bounded belum pagination/export skala besar; source key rotation dan quota media memerlukan hardening sebelum produksi. Tidak ada klaim gap/bug nol. Preview dapat direview tanpa menganggap angka/state demo sebagai fakta.

Server GitHub diverifikasi 3 Oktober 2026: Actions enabled=false, required status checks=null, PR requirement/linear history/conversation resolution aktif, force push main ditolak. Tidak mengubah settings server pada task implementasi.

## Review sebelum merge PR #2

Review menemukan token recovery sebelumnya tetap valid setelah approval recovery baru, dan token aktif tidak dicabut oleh suspend user. Regression pada artifact sebelum patch menerima200 ketika aktivasi token superseded seharusnya400. Perbaikan mencabut challenge target dan payload kredensial pada recovery approval baru/suspend user/organisasi, serta transaction advisory lock identity lintas worker untuk login commit/invite/enroll/activate/recovery/suspend. Login memeriksa ulang kredensial dan status di transaksi yang sama dengan OTP/session/audit. Tidak ada perubahan schema atau scope R2.

Unit ciphertext tampering juga ditemukan flaky: suffix acak dapat sudah bernilaiff sehingga penggantianff tidak mengubah ciphertext. Test sekarang membalik satu bit agar selalu menguji tampering aktual; implementasi AES-GCM tidak diubah.

Review tiga advisori dasar (15 package termasuk rantai transitif): [braces recursion](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) memerlukan pola nesting; source Nitro memakai globby untuk pola source/config build, tanpa route publik yang menerima glob. [node-forge RSA verification](https://github.com/advisories/GHSA-86w9-cpqp-85rv) berada dalam listhen untuk certificate development; aplikasi menggunakan Node crypto/TOTP dan tidak menyediakan endpoint verifikasi RSA forge. [esbuild dev server](https://github.com/advisories/GHSA-67mh-4wv8-2f99) berasal dari esbuild-kit/drizzle-kit; tidak menjalankan serve pada artifact Node. Pemeriksaan ini mendukung merge preview, bukan klaim risiko dependency nol. Deploy hanya artifact `.output`/Docker runtime, jangan menjalankan CLI/dev server atau menerima config/glob/certificate build dari pengguna. Audit runtime registry0 tetap mempunyai batas compiled code/SBOM dan semua gate security produksi dipertahankan.

Validasi sesudah perbaikan: `npm run lint`, `npm run typecheck`, `npm test` (18/18) dan `npm run format:check` lulus; `node --env-file=.local/fresh-test.env node_modules/vitest/vitest.mjs run --config vitest.integration.config.ts` lulus8/8 termasuk lock concurrent revocation/scrubbing. `docker build --target runtime -t shareat-r1:review-repro .local/review-repro-container` dari Git archive staged source bersih lulus; artifact tersebut dijalankan lokal pada port3003 dengan database test, dan `TEST_BASE_URL=http://127.0.0.1:3003 node --env-file=.local/test.env node_modules/@playwright/test/cli.js test` lulus12/12 dalam24,8 detik, termasuk token superseded, suspend user dan pending invitation organisasi yang ditangguhkan ditolak400. Validator19 dokumen/47 requirement/47 skenario/0 structural error lulus; ketiga generated docs reproducible setelah normalisasi newline. Preview/database kerja pada port3002 tidak dipakai untuk destructive test. Merge preview telah diizinkan pemilik; launch produksi tetap menunggu gate yang dicatat di atas.

## Redesign UI publik berbasis referensi, 4 Oktober 2026

Permintaan pemilik diterapkan pada beranda, navigasi/header/footer, daftar program/inisiatif/cerita, detail konten, tentang/transparansi/kebijakan, FAQ, kontak, dan error. Palet navy/aqua, Manrope lokal, ilustrasi hero konseptual, serta tiga ilustrasi SVG program mengganti tampilan sebelumnya. PageIntro/JoinBanner dipakai bersama; kartu menampilkan media published bila tersedia; filter program sinkron dengan URL/riwayat; topik kontak hanya mengubah draft WhatsApp. Style dasar juga berlaku pada CMS; workflow/auth CMS tidak dirombak. PRD/SRS/SDD/keputusan/traceability telah diselaraskan.

Validasi lokal source final:

- `npm run lint`: lulus tanpa warning ESLint.
- `npm run typecheck`: lulus.
- `npm test`: 18/18 unit test lulus.
- `npm run format:check`: lulus. Kegagalan awal berasal dari CRLF checkout Windows; .gitattributes sekarang menetapkan LF untuk Vue/TS/MJS. Normalisasi berkas lain tidak mengubah source Git.
- `docker build --target runtime -t shareat-r1:ui-redesign-final .local/ui-redesign-review`: lulus dari Git index tree yang diarsipkan ke direktori bersih. Runtime Node24.19.0, Nuxt4.5.2, Vue3.5.43. Environment build Windows memakai Node25.9.0; artifact yang diuji browser dibangun dan berjalan di Linux/Node24 sesuai baseline.
- `TEST_BASE_URL=http://127.0.0.1:3003 node node_modules/@playwright/test/cli.js test tests/e2e/public.spec.ts tests/e2e/redesign.spec.ts`: 12/12 lulus pada Chromium (1,5 menit). Di PowerShell gunakan `$env:TEST_BASE_URL='http://127.0.0.1:3003'` sebelum perintah node. Suite meliputi 14 route pada320/768/1024/1440 px; navigation pada390 px; SSR/canonical/noindex, R1 transaction404, arsip kebijakan, filter/reset/back, focus trap/Escape/route close, draft WA/copy/fallback, empty state, dan JS-disabled. Axe WCAG2A/AA,2.1AA,2.2AA lulus pada template mobile dan desktop yang tercantum di suite.
- `python docs/tools/validate_docs.py` dengan bundled Python/Pillow: 19 dokumen,47 requirement,47 skenario,0 structural error. Ketiga generated docs identik setelah newline normalization ketika validator dijalankan kembali pada Git snapshot bersih.
- `git diff --check` dan `git diff --cached --check`: lulus sesudah whitespace cleanup.
- Generator `node node_modules/tsx/dist/cli.mjs scripts/make-og.ts` diperbarui mengikuti palet baru; SVG dan PNG dihasilkan ulang.

Pemeriksaan awal menemukan kontras aqua terlalu rendah pada krem/mint; token final digelapkan menjadi#086D70 dan suite axe diulang sampai lulus. Tes filter awal memakai locator label yang turut membaca option select; locator diganti memakai role combobox, lalu perilaku URL/back/reset terbukti lulus. Server development lama berhenti sebelum percobaan tes pertama; hasil yang dinyatakan lulus berasal dari container preview terpisah pada loopback3003. Tidak menjalankan tes CMS yang memodifikasi database kerja pada task UI ini.

Screenshot lokal pada .data/redesign mencakup beranda desktop/mobile, daftar inisiatif, tentang, kontak mobile, error, dan drawer setelah animasi. Bukti ditinjau secara visual; berkas screenshot adalah output lokal yang dikecualikan Git. Ilustrasi serta lisensi/provenance tercatat di EVIDENCE. Pemeriksaan otomatis bukan sertifikasi WCAG, uji perangkat iOS/Android fisik, screen reader, Lighthouse/CWV field, atau penerimaan produksi. Tidak ada perubahan backend/schema/endpoint, GitHub Actions, merge, ataupun deployment publik.

## Hardening aksesibilitas dan hydration, 4 Oktober 2026

Review lanjutan mencatat pola desain dari delapan situs informasi kemanusiaan dan lembaga filantropi, ditambah panduan W3C WCAG22, WebAIM, GOV.UK Design System, USWDS, dan Practical Typography. Pola yang diadopsi bersifat struktural; tidak ada teks, kode, angka capaian, atau aset milik situs lain yang diimpor. Pola yang dikecualikan karena berada di luar R1 antara lain pemilih nominal, konter dampak hidup, meteran capaian dana, dan daftar rekening donasi.

Perubahan pada source publik:

- `app/layouts/default.vue`: elemen `<p>` di dalam `<noscript>` dihapus. Parser HTML memperlakukan isi noscript sebagai teks mentah saat SSR, sementara Vue mengharapkan elemen, sehingga setiap halaman publik mencatat `Hydration completed but contains mismatches`. Teks bantuan sekarang memakai elemen noscript berkelas container.
- `app/assets/css/main.css`: `letter-spacing` label eyebrow diturunkan dari0,15em ke0,115em agar berada pada rentang konvensi all-caps 0,05-0,12em dan tetap aman bila pengguna menambah spasi huruf sesuai SC 1.4.12. Warna eyebrow dan text-link memakai#0A5F62 sehingga rasio terburuk pada permukaan krem/mint naik dari5,45:1 menjadi6,62:1.
- `app/assets/css/main.css`: token `--color-control-border`#6F868C ditambahkan dan dipakai input, select, kartu konten, panel filter, kartu pilar, dan chip filter. Sebelumnya batas kontrol memakai `--color-border` pada1,31-1,68:1 sehingga tidak memenuhi SC 1.4.11; nilai baru berada pada3,49-3,84:1 di seluruh permukaan.
- `app/assets/css/main.css`: batas `step-number` dan `empty-state` dipertegas, label `card-tag` dinaikkan ke0,7rem dengan1,5rem huruf besar, indikator fokus footer berganti menjadi dua warna. Border media dan pemisah section tetap dekoratif.
- `app/components/ContentDetail.vue`: pelanggaran `definition-list`/`dlitem` diperbaiki dengan menempatkan `dt`/`dd` tepat satu tingkat di bawah `dl`. Blok catatan publik dimasukkan pada halaman transparansi.
- `app/components/PublicRecord.vue`: komponen baru berisi enam catatan proses yang dapat diperiksa pembaca. Isi berupa alur publikasi, penandaan versi kebijakan, perlakuan media, dan mekanisme koreksi; tidak memuat angka dampak atau capaian.
- `app/components/ContentCollection.vue`: chip filter program memakai batas kontrol yang terlihat.
- `app/pages/kontak.vue`: tautan lewati ke panduan bantuan ditambahkan dan tautan WhatsApp Web eksternal ditandai membuka tab baru untuk pembaca layar.
- `.vscode/extensions.json` dan `.vscode/settings.json`: rekomendasi extension bersama (Volar, Nuxtr, ESLint, Prettier, Tailwind, Vitest, Playwright) beserta pengaturan editor. `.gitignore` dikecualikan secara selektif untuk kedua berkas ini; berkas launch/task lain tetap lokal.

Validasi lokal source final:

- `npm run lint`: lulus tanpa warning ESLint.
- `npm run typecheck`: lulus.
- `npm test`: 18/18 unit test lulus.
- `npx playwright test tests/e2e/public.spec.ts`: 3/3 lulus pada Chromium terhadap artifact produksi port3001, dari sebelumnya 2/3 dengan kegagalan hydration. Assertion console error kini bersih.
- Audit axe-core WCAG2A/AA,2.1AA,2.2AA diperluas ke15 halaman publik termasuk transparansi, faq, privasi, ketentuan, dan cari dengan konfigurasi `.local/a11y.config.ts`: seluruh halaman bersih tanpa violation. Pelanggaran `dlitem` pada halaman detail inisiatif merupakan temuan baru dari perluasan ini dan sudah diperbaiki.
- `npm run build`: lulus. Artifact dijalankan pada127.0.0.1:3001 dengan DB compose; 14 route publik menjawab200 tanpa error konsol.
- Login MFA nyata dan enam endpoint CMS (`/auth/me`, `admin/content`, `admin/media`, `admin/settings`, `admin/team`, `admin/audit`) menjawab200, memastikan perubahan style tidak merusak CMS.
- `python docs/tools/validate_docs.py`: 19 dokumen,47 requirement,47 skenario,0 structural error.
- `npx prettier --check` pada berkas yang diubah dan `git diff --check`: lulus.

Temuan sampingan yang tidak diperbaiki pada tugas ini: `docs/tools/validate_docs.py` meregenerasi `docs/ASSET_INVENTORY.csv` dan menghapus kolom dimensi pada32 baris. Berkas tersebut dikembalikan ke revisi Git dan bug generatornya belum diperbaiki.

Keterbatasan: pemeriksaan axe dijalankan pada Chromium headless dan bukan sertifikasi WCAG. Fokus yang terlihat, ukuran target sentuh, dan perilaku pembaca layar belum diuji manual. Uji perangkat iOS/Android fisik, screen reader nyata, zoom200%, dan riset dengan peserta belum dilakukan. Perubahan tidak menyentuh backend, schema, endpoint, media, maupun alur publikasi; tidak ada GitHub Actions, klaim kesiapan produksi, atau deployment publik.

## Audit izin peran dan konsistensi R1, 4 Oktober 2026

Audit menyeluruh atas peran SRS, endpoint admin, dan UI CMS menemukan celah otorisasi, inkonsistensi dokumentasi, dan satu cacat pelaporan error. Semua diperbaiki pada source.

Perbaikan otorisasi:

- Auditor sebelumnya lolos `assertEdit` karena hanya lima role pertama yang dikecualikan pada pemeriksaan baca, sehingga auditor bisa menulis konten bila ia mengajukan review sebagai penulis. Sekarang auditor dan operator bersifat baca saja pada seluruh mutation konten dan tidak dapat dijadikan peninjau. Pemeriksaan juga berlaku bila role baca-saja digabung dengan role lain.
- Editor mitra sebelumnya hanya dibatasi pada `partner_editor`, sehingga `editor` atau `reviewer` yang digabungkan membuka akses ke seluruh organisasi. Sekarang `create` memakai aturan peran penuh, dan daftar media dibatasi ke organisasi pemilik untuk editor mitra.
- Unggahan media dan perubahan slug menolak auditor dan operator dengan pesan yang jelas.
- Operator tidak lagi memblokir dirinya sendiri: operator dapat mengusulkan sekaligus menyetujui perubahan kontak, tetapi tetap tidak boleh menyetujui usulan yang ia buat sendiri. Usulan recovery dan organisasi tetap eksklusif admin.
- Endpoint media list memperbaiki select yang rusak; `scanStatus` dan `rightsStatus` kini benar-benar terkirim, dan setiap aset menyertakan pemakaian konten serta email pengunggah agar katalog media tidak lagi mengandalkan substitusi manual.

Perbaikan data dan konsistensi:

- Revisi menyimpan `reviewNote` dan `reviewedAt`. Alasan permintaan revisi dan arsip sebelumnya hanya masuk audit log, sehingga penulis tidak dapat mengetahui alasan perubahan. Sekarang alasan tersebut tersimpan pada revisi beserta identitas peninjau, dan halaman CMS menampilkannya.
- `GET /admin/content/{id}` menyertakan email penulis dan peninjau agar aturan pemisahan identitas dapat dipahami operator, tanpa membocorkan cipher MFA.
- `GET /admin/team` berhenti menyebarkan seluruh baris organisasi; kolom dibatasi eksplisit seperti halnya data pengguna.
- Audit log meredaksi nomor kontak, email, token pemulihan, dan id pengguna pada usulan yang disetujui, sehingga auditor tidak lagi menerima nomor WhatsApp atau id pengguna mentah.
- Error yang dibungkus transaksi PostgreSQL kehilangan status aslinya dan dilaporkan sebagai503. Wrapper API kini membaca rantai `cause` dan mengembalikan status asli, misalnya401 atau409. Sebelumnya kegagalan login yang seharusnya401 tampil sebagai503 dan menyesatkan operator.
- Endpoint publik hanya menerima GET dan HEAD. Permintaan lain dijawab405 dengan header `Allow` melalui middleware, bukan404 yang menyamarkan metode yang salah.
- Pesan error unggahan media kini menjelaskan peran yang ditolak.

Dokumentasi diselaraskan: tabel peran SRS memuat larangan baca-saja, aturan peran gabungan, redaksi audit, dan rantai persetujuan R1; API.md memuat kontrak tujuan, role, serta guard405.

Verifikasi pada artifact produksi yang dibangun ulang, DB compose dengan migrasi yang diterapkan:

- `npm run lint`, `npm run typecheck`, `npm test`: lulus; unit test bertambah dari18 menjadi23 kasus untuk baca-saja auditor/operator, pembatasan kind editor mitra, dan pencatatan catatan review.
- Skrip verifikasi peran (`.local/role-verify.mjs`) menjalankan akun admin, auditor, operator, dan editor mitra nyata terhadap server berjalan: 22/22 pemeriksaan lulus, mencakup baca, mutation yang ditolak, dan guard405.
- Skrip alur editorial (`.local/flow-verify.mjs`) menjalankan rantai lengkap dengan empat akun: 14/14 lulus, termasuk penolakan self-review403, permintaan revisi yang terlihat penulis, penolakan publish oleh reviewer lain409, publish oleh reviewer penyetuju, arsip dengan alasan, status410 setelah arsip, dan penolakan operator menyetujui usulannya sendiri403.
- Pemeriksaan navigasi per peran: editor melihat Konten dan Media; auditor melihat Konten, Media, dan Audit; operator melihat Konten, Media, dan Kontak; tidak ada role yang melihat menu di luar kewenangannya.
- `npx playwright test tests/e2e/public.spec.ts` 3/3 dan axe15 halaman bersih pada build yang sama.
- `docs/tools/validate_docs.py` kini mempertahankan nilai dimensi dari manifest yang sudah ada ketika Pillow tidak tersedia, sehingga inventaris tidak lagi kehilangan32 baris data; hasilnya0 structural error.

Keterbatasan: skrip verifikasi peran dan alur berada di `.local/` yang diabaikan Git dan bukan suite CI, sehingga perlu dijalankan manual saat memeriksa perubahan izin. Akun uji dibuat dan dihapus dalam transaksi DB kerja. Uji perangkat, screen reader, dan audit keamanan eksternal tetap belum dilakukan.
