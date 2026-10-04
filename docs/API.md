# Kontrak API R1 aktual

**Versi:** 1.2 · **Tanggal:** 3 Oktober 2026. Prefix endpoint tabel adalah `/api/v1`, kecuali path absolut health/SEO/media. R1 hanya informasi/CMS/WA. Unknown `/api/*`, termasuk endpoint uang, mendapat404.

## HTTP, input, dan session

Input JSON strict melalui Zod; field asing ditolak422. Total JSON maksimum128 KiB termasuk chunked body. Upload berupa raw bytes, maksimum10 MiB; gambar8 MiB/24 MP, PDF privat10 MiB. Error H3 mempunyai statusCode/statusMessage/message dan header X-Request-Id. Tidak ada echo stack/SQL/token pada error aplikasi production. List public/CMS memakai `{items,page,pages,total}`20 item; detail/mutation berupa object langsung.

Opaque cookie256 bit disimpan sebagai hash DB. HttpOnly/SameSite=Lax/path/, Secure dan prefix__Host pada appMode=production, absolute8 jam/idle30 menit. Mutation privat membutuhkan Origin tepat SITE_URL dan X-CSRF-Token dari login/me. Login/enroll/activate juga memeriksa origin serta rate limit. Semua response aplikasi preview no-store; server tetap memeriksa role/ownership.

| Status | Arti |
| --- | --- |
| 400 | JSON malformed |
| 401 | Session/login tidak valid |
| 403 | Role/scope/CSRF/origin/self-approval ditolak |
| 404 | Absent/private/unknown endpoint/page di luar range |
| 409 | Version stale, lifecycle conflict, identity/slug duplicate |
| 410 | Entity pernah published lalu archived |
| 413 | Payload/file melampaui batas |
| 422 | Schema/checklist/domain input invalid |
| 429 | Percobaan login/enrollment melampaui batas |
| 503 | Dependency/kapasitas sementara tidak tersedia |

## Public

| Method/path | Kontrak |
| --- | --- |
| GET `/public/content` | Optional kind program/initiative/story/page/faq, page1..500, q≤120, program≤100, lokasi≤100, status planning/ongoing/completed. Query asing422, published only |
| GET `/public/home` | Koleksi bounded per-kind |
| GET `/public/{kind}/{slug}` | DTO published, private404, archived410 |
| GET `/public/settings` | name/siteUrl/demo/contact(phone,hours), tanpa evidence atau secret |
| GET `/public/policies/{slug}/versions` | privasi/ketentuan: id/title/effectiveDate/updatedAt dari revision published |
| GET `/public/policies/{slug}/{id}` | Snapshot published; draft/unknown/withdrawn404 |
| GET `/api/health` | DB SELECT1, status R1 minimal, failure503 |
| GET `/sitemap.xml`, `/robots.txt` | URL approved; demo Disallow/noindex |
| GET `/media/{id}/{width}.webp` | Width400/800/1200/1600; clean+rights+referenced published, selain itu404 |

Endpoint publik hanya menerima GET. Permintaan non-GET ke `/api/v1/public/*`, `/api/health`, `/robots.txt`, dan `/sitemap.xml` dijawab405 dengan header `Allow: GET, HEAD` agar metode yang tidak didukung tidak dilaporkan sebagai404.

Public DTO: id/kind/slug/title/summary/paragraphs/programSlug/location/activityStatus/responsible/schedule/author/effectiveDate/imageId/imageAlt/demo/sortOrder/updatedAt. Tidak ada organizationId/authorId/reviewerId/checklist/email/passwordHash/MFA/filekey. Production menyembunyikan demo. Plain text di-render escaped oleh Vue; tidak ada arbitrary HTML editor.

## Identitas

| Method/path | Kontrak |
| --- | --- |
| POST `/auth/login` | `{email,password,totp}`. Batas account5/network30 percobaan per15 menit, salted bucket, generic401. Password+satu OTP anti-replay sebelum full session; response csrf/user |
| GET `/auth/me` | User/role/org scope dan CSRF session |
| POST `/auth/logout` | Session+CSRF+origin; revoke DB/cookie |
| POST `/auth/enroll` | `{token,password}` invite/recovery valid, password≥12; enrollment5 menit dan secret/URI hanya untuk pemegang token |
| POST `/auth/activate` | `{token,totp}` atomic consume, organization aktif; tidak menerbitkan session, login tetap diperlukan |

Tidak ada public signup, endpoint MFA terpisah, donor account, reset email, atau recovery bypass. Bootstrap lewat CLI privat. Recovery proposal membutuhkan dua admin berbeda yang bukan akun target. Persetujuan recovery baru mencabut token target sebelumnya; suspend user/organisasi mencabut invite/recovery terkait beserta payload privat. Token yang dicabut ditolak400 pada enroll/activate. Pemeriksaan dan pencabutan lifecycle terserialisasi dalam transaksi lintas worker; login yang menggunakan kredensial berubah atau akun ditangguhkan ditolak401.

## CMS

| Method/path | Kontrak |
| --- | --- |
| GET `/admin/content` | Auth, querypage1..10000/kind. SQL pagination20/latest revision; partner initiative/org dibatasi sebelum query; auditor dan operator dapat membaca tanpa mengubah |
| POST `/admin/content` | Editor verified, `{kind,slug?,body}`, owner dari server; editor mitra hanya initiative, admin/editor untuk kind lain |
| GET `/admin/content/{id}` | Team sesuai role atau partner owner, riwayat privat termasuk email penulis/peninjau |
| PUT `/admin/content/{id}` | `{version,body}`, append draft, stale409 |
| POST `/admin/content/{id}/transition` | `{version,action,checklist?,reason?}`; submit/request_changes/review/publish/archive. Reviewer bukan penulis; publisher reviewer yang menyetujui; archive wajib alasan. Reason request_changes/archive tersimpan sebagai reviewNote beserta reviewerId dan reviewedAt |
| POST `/admin/content/{id}/slug` | Reviewer verified, `{version,slug,reason}`, unique409 dan redirect satu hop |

Body: title3..140, summary15..320, paragraphs1..30 (tiap1..4000); optional programSlug/location/responsible/schedule/author/effectiveDate/imageId/imageAlt; activityStatus defaultplanning; demo defaultfalse; sortOrder integer. Financial fields ditolak. Slug page memakai route sistem ditolak422; slug yang sudah menjadi alias atau unique conflict ditolak409. EffectiveDate ISO date, imageId UUID/alt≤200. Lima checklist claims/media/privacy/seo/contact harus true. Publish initiative memerlukan program published/responsible, story memerlukan author, privasi/ketentuan memerlukan effectiveDate. Media membutuhkan clean/rights/owner/alt. Reviewer tetap harus memeriksa bukti, bukan sekadar mencentang.

```json
{"kind":"initiative","body":{"title":"Contoh ruang berbagi","summary":"Rencana contoh untuk meninjau CMS dan kegiatan berbagi.","paragraphs":["Data demo untuk review, bukan kegiatan nyata."],"programSlug":"share-eat","activityStatus":"planning","responsible":"Tim demo","demo":true}}
```

Contoh hanya fixture lokal. Publikasi demo ditolak dalam production.

## Team, konfigurasi, audit, dan media

| Method/path | Role dan kontrak |
| --- | --- |
| GET `/admin/team` | Admin; daftar user dan organisasi tanpa passwordHash/mfaCipher |
| POST `/admin/team/organization` | Admin, name/slug/evidence privat, proposal belum mengaktifkan mitra |
| POST `/admin/team/invite` | Admin, email/organizationId/roles; verified aktif, partner hanya partner_editor; token privat24 jam |
| POST `/admin/team/suspend` | Admin, `{type:"user"|"organization",id,reason}`, revoke session terkait |
| POST `/admin/team/recovery` | Admin, userId/reason≥20; maker/checker bukan target |
| GET `/admin/settings` | Admin/operator, contact dan proposals privat |
| POST `/admin/settings/contact` | Admin/operator, `{phone,hours,ownershipVerified:true}`; proposal/audit, belum mengubah publik |
| POST `/admin/settings/{id}/approve` | Admin, atau operator untuk usulan contact/organization; penyetuju berbeda dari pengusul; lock proposal; contact version increment, organization verified, atau recovery suspend/token |
| GET `/admin/audit` | Admin/auditor,100 terbaru read only; tanpa log mutation; nilai sensitif diredaksi |
| GET `/admin/media` | Auth scoped, metadata200 item maksimal; reviewer/auditor lintas organisasi, editor mitra hanya organisasinya; menyertakan pemakaian konten dan email pengunggah; tanpa URL original publik |
| POST `/admin/media` | Editor/partner/reviewer verified+CSRF, raw bytes, actual type, sha256, dimensions, scan status; auditor dan operator ditolak |
| POST `/admin/media/{id}/approve` | Reviewer bukan uploader, rights reason≥20, scan clean wajib, auditor/operator ditolak |
| GET `/admin/media/{id}/download` | Team roles need-based, clean only, attachment/no-store, setiap request auth+audit; auditor read only tidak mengunduh |

Source schema pada handler adalah kontrak executable. Team/media/audit preview belum menjadi reporting skala besar; pagination tambahan, quota/retensi dan operasi ada pada [ledger](IMPLEMENTATION.md). [OPERATIONS](OPERATIONS.md) menjelaskan runbook. Tidak ada endpoint CRUD tambahan hanya karena tabel konseptual SDD pernah merencanakannya.
