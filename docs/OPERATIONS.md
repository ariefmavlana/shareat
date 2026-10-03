# Deployment dan runbook R1

**Tanggal:** 3 Oktober 2026. Prosedur ini berlaku untuk R1 informasi/CMS/WA. Belum ada provider shared hosting yang dipilih atau deployment produksi. Preview memakai data contoh; R2 tetap tidak aktif.

## Syarat minimum shared hosting

| Kebutuhan | Minimum yang harus dibuktikan |
| --- | --- |
| Runtime | Node 24 LTS, ESM, proses persisten, reverse proxy/port, dan restart yang dapat dikendalikan |
| Resource | Baseline 1 GB memori tersedia untuk app, 2 GB preferensi; CPU, koneksi, inode dan disk harus lulus workload aktual |
| Database | PostgreSQL 18 supported, UTF8, JSONB, timestamptz, transactions/row locks/FK, pg_dump/pg_restore; TLS tervalidasi untuk produksi |
| Media | Direktori persisten di luar document root, izin tulis terbatas, quota, backup, Sharp sesuai platform dan scanner AV |
| Cron | CLI one-shot minimal setiap 5 menit, environment privat, concurrency dan timeout terukur |
| Network | HTTPS/domain, outbound 443, proxy yang menghapus header forwarding palsu, request limits sesuai aplikasi |
| Release | Upload artifact aman, migration runner privat, rollback, env privat, serta smoke test sesudah restart |
| Recovery | Backup DB/media/key harian, terenkripsi offsite, latihan restore RPO≤24 jam/RTO≤8 jam |
| Monitoring | Probe eksternal, operator nyata, log redacted, resource quota, cron/backup age, dan dead letter alert |

Label “Node support” belum membuktikan kelayakan paket. Jalankan spike dengan artifact aktual, termasuk restart setelah idle, SSR/API, MFA, DB locks, upload, cron, dan restore. Shared hosting tidak perlu Docker; Dockerfile membantu build Linux lokal. Adapter Passenger/cPanel baru ditentukan setelah topology host diketahui. Paket hanya MySQL tidak memenuhi pilihan PostgreSQL. Gunakan PostgreSQL yang disediakan host atau layanan PostgreSQL eksternal dengan konektivitas/TLS, latency, quota, region dan biaya yang diuji. PHP-only tidak dapat menjalankan backend Nuxt ini; pilih runtime Node atau revisi arsitektur melalui PR.

Pool DB 5 dan concurrency scrypt 2 membatasi beban, tetapi tidak menjamin kapasitas paket. Preview tidak menggunakan Redis/CDN cache. NFR-009 belum terbukti: target 50 request publik/detik mayoritas cache memerlukan implementasi cache, purge saat withdrawal, dan load test sebelum diterima.

## Gate sebelum produksi

[DECISIONS](DECISIONS.md) tetap mengatur identitas, domain, nomor/jam/operator WA, konten dan rights aktual, dua staff independen, kebijakan privasi/terms, AV, dependency review, hosting, kapasitas, dan recovery. `npm run preflight` hanya memeriksa syarat teknis terbatas; hasil lulus bukan persetujuan legal atau release.

Pisahkan DB, media, dan key produksi dari demo. Jangan menyalin akun/enrollment contoh. Bootstrap dua staff berbeda melalui CLI privat, aktifkan authenticator, lalu hapus data provisioning yang tidak lagi diperlukan sesuai SOP. WA diubah melalui proposal dan admin lain. SITE_URL harus domain HTTPS yang disetujui; APP_MODE=production tetap hanya R1. Konten aktual diterbitkan dengan demo=false setelah review. Mengganti flag tidak mengubah contoh menjadi fakta.

## Build dan release

1. Gunakan branch khusus, lockfile, migration kompatibel, dan docs/traceability konsisten. Jalankan lint, typecheck, unit, format, build, E2E kritis, docs validator, staged diff dan secret review secara lokal. Tinjau npm audit; temuan tinggi/kritis yang dapat dieksploitasi menghalangi release.
2. Build Linux untuk target Linux, misalnya `docker build --target runtime -t shareat-r1:local .`. Ekspor artifact dengan `docker build --target artifact --output type=tar,dest=artifact.tar .`. Windows local-directory exporter dapat gagal membuat symlink; gunakan tar atau image Linux.
3. Simpan artifact/checksum secara privat. Runtime menjalankan `node .output/server/index.mjs` dengan environment dari host. Artifact tidak otomatis membaca dotenv. Jangan membawa builder, referensi, `.env`, atau source ke public document root.
4. Backup DB/media/key dan verifikasi offsite. Terapkan migration compatible melalui principal privat; jangan memakai migration destruktif pada cutover.
5. Dapatkan otorisasi merge/deployment. Tidak ada GitHub Actions atau auto-deploy. Switch artifact/restart, lalu uji health, SSR/head, canonical, robots, sitemap, MFA/session, CSRF, scope, publish/withdraw, media, dan cron.
6. Pantau error/latency/resource. Jika gagal, hentikan perubahan baru dan rollback artifact kompatibel; jangan drop DB atau rollback schema yang membuang data. Gunakan forward fix bila diperlukan.

Docker runtime memakai user node. Image menyediakan `/app/media` dengan izin tulis; mount volume persisten yang UID-nya sesuai. Default filesystem container bersifat sementara. Node base dipin 24.19.0; catat image digest release. Build Windows tidak disalin ke host Linux karena dependency native berbeda.

## Backup dan restore

Backup produksi dibuat scheduler/provider yang disetujui dengan credential file privat atau secret manager. `pg_dump --format=custom --no-owner --no-acl` menghasilkan snapshot konsisten PostgreSQL; restore dengan `pg_restore --exit-on-error --no-owner --no-acl` ke database baru terisolasi. Gunakan PostgreSQL client versi18 untuk server18, credential file/service privat (izin0600 atau ACL Windows setara), jangan password di argumen/log. Dump database tidak mencakup roles/grants cluster; dokumentasikan bootstrap principal terpisah; sertakan schema/data, media checksum, encryption key, cutoff publikasi, dan prosedur restore. Offsite harus terenkripsi serta benar-benar diverifikasi; flag manual saja bukan bukti.

`npm run backup:check` memeriksa manifest: createdAt ISO UTC tidak future dan ≤24 jam, daftar file nonempty dengan SHA256, offsiteVerified=true, serta keberadaan/hash file lokal. Checker tidak melakukan upload, encryption, atau restore.

```json
{"createdAt":"2026-10-03T00:00:00Z","offsiteVerified":true,"files":[{"path":"/private/backup/db.dump.enc","sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}]}
```

Contoh hanya menunjukkan format. Gunakan waktu dan hash hasil backup aktual. Latihan restore dilakukan pada DB/media terisolasi: periksa schema/FK/count/published pointer, decrypt MFA dengan key yang benar, jalankan auth/private/publication smoke, dan ukur cutoff RPO serta elapsed RTO. Restore produksi memerlukan freeze, approval, dan incident plan. Cabut session lama serta terapkan suppression terhadap identitas/media yang sudah ditarik agar tidak terpublikasi kembali.

Retensi daily30 hari/monthly12 bulan masih usulan. Kontrol privacy lifecycle, suppression restore, offsite, dan pengukuran RPO/RTO produksi belum lengkap pada preview. Uji restore lokal tidak menggantikannya.

## Cron, monitoring, dan incident

Jalankan `npm run jobs:run` sebagai one-shot setiap 5 menit dengan env privat. Runner membutuhkan source/TSX dalam lingkungan privat terpisah atau bundle CLI khusus; runtime `.output` saja tidak menyediakan script TypeScript. Jangan menganggap jobs tersedia dalam runtime image. DB lease/SKIPLOCKED mengatur publication outbox; tipe tak dikenal masuk dead_letter. Karena public no-store, withdrawal tidak menunggu cron. Job network/cache mendatang memerlukan retry/backoff/crash test tambahan.

Probe `/api/health` dan halaman publik dari luar host. Alert operator saat down/DB503, error burst, quota, AV unavailable, cron stale, dead letter, atau backup age>24 jam. Log app berisi requestId/status/duration/area tanpa query/body/OTP/email/phone. Provider access log harus ditinjau terpisah. Preview belum mempunyai integrasi pager, uptime vendor, atau pengukuran availability.

DB down menghasilkan503 dan state pemulihan, bukan detail palsu200. Scan failure tetap quarantine/blocked. Staff compromised: suspend, revoke sessions, simpan audit redacted, tinjau perubahan konten/kontak, dan gunakan recovery supervised. Key hilang: freeze akses dan restore key privat terverifikasi; jangan menghapus MFA atau menurunkan password policy sebagai jalan pintas.

## SOP kontak dan editorial

Owner menunjuk operator WA, jam WIB, cadangan operator, dan eskalasi. Target respon usulan satu hari kerja ditampilkan setelah disetujui. Klik WA bukan bukti pesan terkirim, partisipasi, atau donasi. R1 tidak meminta transfer/rekening. Pengunjung menyebut judul/URL publik tanpa identitas sensitif penerima manfaat.

Koreksi: catat kasus/owner, reviewer mengarsipkan konten sensitif segera, editor membuat draft dengan sumber, reviewer lain memeriksa checklist dan menerbitkan. Periksa sitemap/media setelah withdrawal. Jika hak media dicabut, arsipkan semua konten published yang memakai asset sebelum membersihkan file sesuai retensi. Endpoint revoke-rights khusus belum tersedia; approval bukan izin abadi.

WA change: admin/operator mengusulkan, admin berbeda memeriksa ownership/jam lalu menyetujui. Recovery MFA: dua admin bukan target memeriksa identitas melalui SOP privat, approval mencabut session dan menangguhkan target, token24 jam diberikan melalui kanal privat yang disetujui, enrollment5 menit, aktivasi, lalu login dengan OTP baru. Tidak ada pengiriman email/WA otomatis.

## Penerimaan

Target R1 availability99,5%, RPO24 jam/RTO8 jam, CWV, workload30 menit, browser matrix, WA perangkat nyata, dan riset lintas usia tetap membutuhkan bukti. [IMPLEMENTATION](IMPLEMENTATION.md) mencatat hasil aktual. R2 memerlukan gate legal/gateway/ledger/finance/reconciliation/PITR dan PR terpisah; tidak aktif melalui button atau environment R1.
