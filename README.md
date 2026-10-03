# Shareat

Website informasi kemanusiaan Indonesia berbasis **Nuxt 4 fullstack, TypeScript, shadcn-vue, Tailwind 4, Nitro, PostgreSQL 18.6 dan Drizzle**. Implementasi R1 mencakup website SSR, CMS privat, review publikasi, MFA, pengelolaan mitra, media privat, dan kontak WhatsApp.

Preview memakai **data demo yang tersimpan di PostgreSQL dan dapat diedit melalui CMS**, bukan daftar kegiatan statis. Nomor sementara dari pemilik adalah **087776734038** (`6287776734038`). Identitas, agenda, cerita, kebijakan, dan jam layanan masih contoh. Preview memiliki label demo serta noindex. R1 tidak menerima pembayaran; R2 menunggu gate legal, keuangan, dan gateway.

## Menjalankan lokal

Gunakan Node **24 LTS** (`>=24.11 <25`), npm, dan PostgreSQL 18.6. Docker Compose menyediakan database lokal opsional.

```sh
cp .env.example .env
# Isi POSTGRES_PASSWORD, NUXT_DATABASE_URL, DEMO_STAFF_PASSWORD (minimum16),
# dan NUXT_ENCRYPTION_KEY (32 byte dalam format hex).
# Sesuaikan NUXT_SITE_URL dengan origin aplikasi, misalnya http://127.0.0.1:3001.
npm ci
docker compose up -d postgres
npm run db:migrate
npm run db:seed
npm run dev -- --port 3001
```

Generate kunci dengan `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Setiap secret harus berbeda; jangan commit `.env`. Seed hanya diizinkan dalam `NUXT_APP_MODE=demo` dan tidak menimpa hasil edit CMS. Akun serta enrollment TOTP dibuat di `.data/demo-access.json`, yang diabaikan Git. Buka `/admin/login` setelah memasukkan secret akun ke aplikasi authenticator. File ini memuat akses privat; jangan dibagikan atau dipublikasikan.

## Validasi lokal

```sh
npm run lint
npm run typecheck
npm test
# Pada DB PostgreSQL lokal berakhiran _test, mode demo:
npm run test:integration
npm run format:check
npm run build
# Jalankan artifact dengan environment tersuplai; bukan server dev.
node --env-file=.env .output/server/index.mjs
# Terminal lain, dengan TEST_BASE_URL sesuai server dan database demo terisolasi:
npx playwright install chromium
npm run test:e2e
python docs/tools/validate_docs.py
git diff --check
```

`HOST`/`PORT` mengatur listener artifact. Nuxt artifact tidak otomatis membaca `.env`. Pengujian E2E memodifikasi database demo dan hanya menerima mode demo pada loopback. **GitHub Actions tidak digunakan.** Hasil dan batas pengujian tercatat pada [status implementasi](docs/IMPLEMENTATION.md).

## Dokumentasi

- [PRD](docs/PRD.md), [SRS](docs/SRS.md), [SDD](docs/SDD.md), [keputusan dan gate](docs/DECISIONS.md).
- [Status requirement dan bukti](docs/IMPLEMENTATION.md), [traceability](docs/TRACEABILITY.md).
- [Pengembangan dan konfigurasi](docs/DEVELOPMENT.md), [kontrak API](docs/API.md), [deployment dan runbook](docs/OPERATIONS.md).
- [Sumber dan audit referensi](docs/EVIDENCE.md), [validasi dokumentasi](docs/VALIDATION.md).

Produksi masih membutuhkan hosting yang terbukti mendukung Node, domain/HTTPS, konten dan identitas aktual, operator, scanner media, backup offsite, serta pengujian kapasitas dan recovery. Dependency audit juga belum bersih. Tidak ada klaim siap produksi atau bebas bug.

Setiap perubahan menggunakan branch khusus dan PR ke `main`; lihat [CONTRIBUTING](CONTRIBUTING.md) dan [AGENTS](AGENTS.md). Merge serta deployment memerlukan otorisasi pemilik. Materi `referensi/` bukan aplikasi produksi dan tidak otomatis memiliki izin penggunaan; foto/font template tidak diteruskan ke website baru.
