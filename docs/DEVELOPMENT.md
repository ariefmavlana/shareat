# Pengembangan R1

**Tanggal:** 3 Oktober 2026. Panduan setup, konfigurasi, akses, dan pemeriksaan lokal. Tidak mengaktifkan fundraising.

## Instalasi

Gunakan Node 24 LTS (`>=24.11 <25`), npm, Git, dan PostgreSQL 18.6/UTF8. Periksa executable dengan `node --version`; Node25 di mesin bukan runtime proyek. Docker hanya diperlukan untuk database compose atau build Linux container.

1. Salin `.env.example` menjadi `.env`. PowerShell: `Copy-Item .env.example .env`. Isi password database independen, URI dengan password URL-encoded, dan NUXT_ENCRYPTION_KEY64 hex dari32 byte random. Jangan commit secret.
2. Set APP_MODE=demo dan SITE_URL=http://127.0.0.1:3001. Origin browser harus sama karena mutation memeriksa Origin.
3. `npm ci`, `docker compose up -d postgres` atau sediakan PostgreSQL sendiri. Compose bind DB ke127.0.0.1:33068 dengan volume persisten. Jangan menghapus volume yang berisi edit CMS.
4. `npm run db:migrate`, kemudian `npm run db:seed`. Seed hanya demo, membuat akses/konten sekali, dan tidak menimpa hasil edit.
5. `npm run dev -- --port 3001`. Untuk artifact, hentikan dev sebelum `npm run build`; build dan dev yang berbagi `.nuxt` tidak diuji bersamaan.

PowerShell artifact: `$env:HOST='127.0.0.1'; $env:PORT='3001'; node --env-file=.env .output/server/index.mjs`. Linux: `HOST=127.0.0.1 PORT=3001 node --env-file=.env .output/server/index.mjs`. Hosting inject environment secara privat; artifact tidak membaca dotenv otomatis.

## Konfigurasi

| Key | Kontrak |
| --- | --- |
| NUXT_DATABASE_URL | Secret URI PostgreSQL; pool5, acquire/connect timeout10s, idle30s, statement15s, lock10s, idle transaction30s, UTC |
| POSTGRES_PASSWORD | Compose lokal, tidak masuk DTO publik |
| NUXT_ENCRYPTION_KEY | Independent 32-byte hex, AES-GCM MFA/salted rate key; backup privat dengan SOP recovery |
| NUXT_APP_MODE | demo atau production; keduanya hanya R1 |
| NUXT_SITE_URL | Origin canonical/CSRF; produksi HTTPS/domain yang disetujui |
| NUXT_DATABASE_TLS / NUXT_DATABASE_CA | Remote DB dan seluruh produksi memakai certificate validation, optional CA PEM; parameter URI ssl* ditolak agar tidak menimpa verifikasi. Non-TLS hanya loopback atau service compose postgres dalam demo |
| NUXT_PROXY_TRUSTED | Defaultfalse; true hanya untuk proxy tepercaya yang menghapus forwarding header palsu |
| NUXT_MEDIA_ROOT | Direktori privat persisten di luar document root, bukan artifact release |
| NUXT_SCANNER_COMMAND | Path AV executable tetap, tanpa shell args; satu file path dan timeout30s; exit0 berarti clean |
| DEMO_STAFF_PASSWORD | Wajib untuk seed lokal, minimum16 karakter; tersimpan dalam file privat |
| STAFF_EMAIL / STAFF_PASSWORD / STAFF_TEAM_NAME / STAFF_ROLES | CLI bootstrap privat; password≥16, hapus env setelah provisioning |
| BACKUP_MANIFEST_PATH | Manifest offsite terverifikasi; checker bukan pembuat backup |
| TEST_BASE_URL | Origin artifact E2E, default loopback3001; hanya demo |

Nomor/jam WA berasal dari DB contact. Seed nomor sementara6287776734038 dan jam berlabel contoh. Perubahan mengikuti proposal/second approval. Site URL berasal dari server env. Tidak ada private evidence organisasi di public DTO.

## Akun dan alur CMS

`.data/demo-access.json` memuat password serta TOTP secret/URI tiga akun. Masukkan ke authenticator, kemudian login dengan email/password/OTP. Jangan membagikan file. OTP yang sudah dipakai ditolak; tunggu kode baru. Hanya fixture E2E lokal yang mereset last step akun demo.

- editor@shareat.example: editor/admin/operator.
- reviewer@shareat.example: reviewer/admin/auditor, identitas terpisah untuk review.
- mitra@shareat.example: partner_editor, hanya inisiatif organisasinya.

Untuk lingkungan non-demo, `npm run staff:create` membuat staff melalui CLI privat, bukan signup publik. Enrollment tersimpan di `.data/enrollment-<id>.json`; pindahkan melalui kanal privat lalu hapus sesuai SOP. Siapkan dua staff nyata berbeda. Admin mengusulkan organisasi/evidence, admin lain menyetujui, kemudian invite24 jam dan enrollment5 menit. Password enrollment API minimal12, bootstrap CLI minimal16. Recovery24 jam membutuhkan dua admin yang bukan target dan mencabut session sebelum reenrollment.

Konten: create → draft → submit → reviewed → publish. Request changes membutuhkan alasan, perbaikan menjadi revisi baru. Save menggunakan expected version;409 meminta reload. Draft baru tidak mengubah snapshot published. Archive reviewer+reason langsung menghilangkan publikasi. Slug reviewer/version menghasilkan redirect satu hop. Arsip policy hanya revision published.

Media: raw JPEG/PNG/WebP/PDF → inspeksi → AV → quarantine/clean/blocked → rights approval oleh reviewer berbeda → referensi konten → publish. Tanpa scanner, file tetap quarantine. Jangan memakai executable yang selalu exit0 sebagai AV produksi. Turunan WebP tanpa EXIF hanya tersedia saat direferensikan published content. PDF/original tidak mempunyai public static URL.

## Pemeriksaan dan migration

```sh
npm run lint
npm run typecheck
npm test
# Dengan NUXT_DATABASE_URL ke DB lokal terisolasi berakhiran _test, mode demo:
npm run test:integration
npm run format:check
npm run build
# Jalankan artifact, lalu di terminal lain dengan origin dan DB demo terisolasi:
npx playwright install chromium
npm run test:e2e
python docs/tools/validate_docs.py
git diff --check
```

Integration PostgreSQL memiliki guard URI loopback dan nama DB berakhiran `_test`; gunakan seed demo pada database terpisah. Test menguji JSONB/UTF8/timestamp, FK/unique, concurrent version, rollback, rate limit, CAS MFA, upsert, SKIP LOCKED dan race create/alias yang dilindungi advisory transaction lock. Jalankan migration dua kali untuk idempotensi dan `db:generate` untuk drift.

E2E memodifikasi users/rate buckets/proposals/konten. Guard menolak production atau remote origin, tetapi operator tetap wajib memilih DB test yang benar. Jangan menguji data kerja yang perlu dipertahankan.

Schema baru: edit `server/db/schema.ts`, `npm run db:generate`, review SQL/snapshot, `npm run db:migrate`, uji fresh dan existing data. Migration yang sudah diterapkan tidak diubah. Provider produksi sebaiknya menyediakan principal migrator terpisah dari app tanpa DDL.

`npm run jobs:run` adalah cleanup expired access dan publication outbox one-shot. Runtime `.output` tidak memuat source/TSX runner; operasi membutuhkan runner privat terpisah. Tidak ada daemon, anonymous jobs API, SMTP, payment atau analytics tracker. Audit UI100 terbaru; media list200; team/proposals belum menggunakan pagination skala besar.

`npm audit --json` ditinjau tanpa menyembunyikan exit nonzero. Jangan force fix tanpa compatibility review. [IMPLEMENTATION](IMPLEMENTATION.md) mencatat versi/hasil/batas aktual, [OPERATIONS](OPERATIONS.md) menjelaskan deployment.

## Editor dan extension

Repositori menyertakan `.vscode/extensions.json` dan `.vscode/settings.json` agar penyiapan editor seragam. `.vscode/` diabaikan Git pada `.gitignore` baris 29, jadi kedua berkas ini hanya berlaku untuk checkout lokal dan tidak dikirim ke PR; sampaikan daftar di bawah kepada kolaborator melalui kanal privat.

Extension yang dipakai bersama:

| Extension ID | Nama tampilan | Perannya |
| --- | --- | --- |
| Vue.volar | Vue - Official | Bahasa dan type-check berkas `.vue` (menggantikan Vetur) |
| Nuxtr.nuxtr-vscode | Nuxtr | Navigasi dan pembuatan berkas Nuxt dari command palette |
| dbaeumer.vscode-eslint | ESLint | Menampilkan temuan `npm run lint` di editor |
| esbenp.prettier-vscode | Prettier | Formatter sesuai `.prettierrc.json` |
| bradlc.vscode-tailwindcss | Tailwind CSS IntelliSense | Autocomplete kelas Tailwind 4 |
| vitest.explorer | Vitest | Menjalankan `tests/unit` dari sidebar |
| ms-playwright.playwright | Playwright | Menjalankan `tests/e2e` dari sidebar |

Plugin Nuxt resmi di VS Code memakai ekstensi Volar yang sama, jadi tidak perlu ekstensi terpisah.

Memasang dari VS Code: `Ctrl+Shift+X`, cari nama extension, lalu Install. Memasang dari terminal: `code --install-extension <extension-id>`. Menampilkan semua yang sudah terpasang: `code --list-extensions`.

## Navigasi VS Code

| Aksi | Windows / Linux | macOS |
| --- | --- | --- |
| Command palette Nuxtr | `Ctrl+Shift+P` lalu ketik `Nuxtr` | `Cmd+Shift+P` lalu `Nuxtr` |
| Quick open berkas | `Ctrl+P` | `Cmd+P` |
| Cari simbol di berkas | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| Cari simbol di workspace | `Ctrl+T` | `Cmd+T` |
| Panel masalah (ESLint/TS) | `Ctrl+Shift+M` | `Cmd+Shift+M` |
| Terminal terintegrasi | `Ctrl+`` ` `` | `Cmd+`` ` `` |
| Sidebar Testing (Vitest/Playwright) | `Ctrl+Shift+T` dari panel, atau ikon labu | sama |
| Buka definisi | `F12` | `F12` |

Perintah Nuxtr yang sering dipakai dari command palette: membuat component/composable/page, menjalankan dev server, dan membuka dokumentasi Nuxt. Biarkan lint serta typecheck tetap dijalankan lewat terminal (`npm run lint`, `npm run typecheck`) karena CI tidak digunakan.

## Workflow

Inspect status → fetch → branch baru dari origin/main bila aman → Conventional Commit → local checks → staged diff/secret review → push branch → PRmain. Preserve perubahan orang lain. Jangan commit/forcepush main, menambahkan GitHub Actions, merge atau deploy tanpa otorisasi. Detail ada pada [CONTRIBUTING](../CONTRIBUTING.md).

## Peralihan PostgreSQL pada preview

U-08/ADR-22 mengganti MySQL sebelum PR implementasi pertama digabung. Migration lama adalah baseline preview yang belum dirilis; schema baru mempunyai migration PostgreSQL0000. Ini bukan migration in-place untuk MySQL. Data lokal diekspor privat, diimpor secara transactional ke database kosong dengan FK aktif (entity pointer diisi setelah revision), lalu diperiksa count/pointer dan kesetaraan payload. Akun/key tetap; session dan challenge aktif dicabut. SQL dump, JSON export, media, key dan volume lama tetap privat dan tidak masuk Git. Provider baru memakai migration PostgreSQL dari awal. Jangan menjalankan baseline ini pada DB produksi existing; cutover nyata membutuhkan rencana export/import, freeze, pemetaan tipe, verifikasi dan rollback terpisah.
