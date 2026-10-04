# SRS platform kemanusiaan Shareat

**Versi:** 1.2 · **Tanggal:** 3 Oktober 2026 · **Status:** baseline dengan kontrak R1 hasil implementasi. Requirements di bawah harus dipenuhi sesuai kolom rilis; R2 tidak menjadi syarat mengaktifkan R1. Klarifikasi pemilik dan lingkup bisnis berada di [PRD](PRD.md). [SDD](SDD.md) memetakan implementasinya.

Fondasi persistence mengikuti keputusan pemilik U-08: **PostgreSQL** (target18), melalui Drizzle/node-postgres; hosting menyediakan PostgreSQL atau akses database eksternal dengan TLS. Pilihan ini tidak mengubah batas R1 informasi/CMS/WhatsApp dan gate fundraising R2. Rincian schema, migration, hosting dan verifikasi ada pada [SDD](SDD.md) serta [ADR-22](DECISIONS.md).

## 1. Lingkup dan konvensi

R1 menyediakan informasi program, inisiatif, transparansi, CMS internal, serta kontak WhatsApp. R2 menambahkan fundraising dan pembayaran setelah gate legal/keuangan/gateway selesai. Requirement dengan kata **harus** adalah kewajiban pada rilis bersangkutan. Nilai target yang belum disetujui tetap menjadi baseline usulan untuk capacity test dan review.

Setiap ID FR atau NFR mempunyai satu definisi normatif dan satu baris pada [matriks keterlacakan](TRACEABILITY.md). Nomor TC menunjuk skenario penerimaan yang perlu dijalankan saat implementasi; keberadaan skenario dalam dokumen tidak menyatakan pengujian aplikasi sudah dijalankan.

Model aktual R1 memakai `content_entities` dengan kind `initiative`; model campaign/fundraising tetap rancangan extension R2. Identifier internal adalah UUID acak, slug adalah URL publik, seluruh waktu disimpan UTC, dan seluruh uang memakai integer rupiah IDR. User interface R1 memakai istilah inisiatif. Public activity status dan fundraising status adalah dua konsep berbeda.

## 2. Aktor, batas sistem, dan hak akses

Website/CMS, database, penyimpanan media, audit, dan pekerjaan terjadwal adalah tanggung jawab aplikasi. WhatsApp, layanan email R2, payment gateway R2, layanan hosting, DNS, serta rekening bank berada di luar batas aplikasi dan diakses lewat kontrak/adapter. Sistem tidak membaca chat pribadi WhatsApp, tidak mengirim pesan tanpa tindakan pengguna, dan tidak menganggap external redirect sebagai bukti pembayaran.

| Peran | R1 | Tambahan R2 | Larangan utama |
| --- | --- | --- | --- |
| Publik/guest | Membaca published content, pencarian, share, membuka WhatsApp | Membuat donasi dan membaca status miliknya dengan bukti akses | Preview, data admin, data donor lain |
| Donor terdaftar | Tidak diperlukan R1 | Riwayat milik sendiri, preferensi publikasi, permintaan privasi | Mengubah status pembayaran dan mengakses donor lain |
| Editor tim | Membuat/revisi semua konten sesuai penugasan | Menyusun kampanye dan pembaruan | Menyetujui revisi sendiri, memposting uang |
| Editor mitra terverifikasi | Membuat/revisi inisiatif milik organisasi | Menyusun kampanye organisasi | Publikasi sendiri, mengakses organisasi lain, membuat program/cerita/halaman/FAQ, mengubah slug |
| Reviewer tim | Memeriksa dan menerbitkan revisi pihak lain, menyetujui hak media, mengubah slug | Menyetujui kesiapan konten kampanye | Mengubah ledger atau menyalurkan dana, menerbitkan revisi yang belum ia setujui |
| Operator support | Konten publik read only, mengusulkan dan menyetujui perubahan kontak yang diaudit | Data transaksi minimum sesuai kasus | Memposting pembayaran, melihat dokumen verifikasi tanpa kebutuhan, mengubah konten atau mengunggah media |
| Finance maker | Tidak diperlukan R1 | Rekonsiliasi, usulan payout/refund, laporan internal | Menyetujui usul sendiri |
| Finance checker | Tidak diperlukan R1 | Menyetujui usul maker lain | Menjalankan usul yang dibuat identitas sama |
| Auditor | Read only konten, media, dan audit sesuai izin | Laporan dan ledger read only | Mutation, termasuk unduhan media privat |
| Admin sistem | Akun/peran, operasional dan konfigurasi yang diaudit | Konfigurasi integrasi yang dibatasi | Menjadi pengecualian otomatis terhadap dual approval |

Hak akses diperiksa pada server dan ownership organisasi. Seorang pengguna dapat mempunyai beberapa role; bila satu role bersifat baca saja, larangan tetap berlaku meskipun digabung dengan role lain. Semua grant/revoke role dan perubahan kontak/gateway diaudit. Nilai sensitif pada audit log (nomor kontak, email, token pemulihan, id pengguna) disimpan sebagai penanda redaksi, bukan nilai asli. Pemulihan darurat akun admin memerlukan prosedur dan dua penanggung jawab, bukan endpoint bypass publik.

Rantai persetujuan R1: editor mengajukan review, reviewer yang berbeda menyetujui review dan menerbitkan, editor dapat mengajukan ulang setelah permintaan revisi, dan reviewer yang menyetujui dapat mengarsipkan publikasi dengan alasan. Catatan reviewer beserta identitasnya tersimpan pada revisi sehingga penulis dapat membaca alasan perubahan.

## 3. Aturan bisnis bersama

| Kode | Aturan normatif |
| --- | --- |
| BR-01 | R1 tidak menyediakan permintaan/penerimaan transfer, rekening, QR pembayaran, checkout, donor count, target/progress dana, atau bukti pembayaran manual. WA berfungsi untuk pertanyaan dan kolaborasi |
| BR-02 | Hanya tim dan organisasi mitra dengan verifikasi aktif dapat menjadi pemilik konten. Verifikasi mitra tidak sama dengan izin penggalangan dana atau jaminan regulator |
| BR-03 | Klaim identitas, legalitas, kegiatan, lokasi, mitra, statistik dan testimonial harus memiliki sumber/approval. Jika bukti belum ada, komponen disembunyikan atau ditandai rencana dengan konteks |
| BR-04 | Publik hanya melihat snapshot published yang disetujui. Mengedit konten published menghasilkan revisi draft; tidak langsung mengubah halaman publik |
| BR-05 | Media penerima manfaat harus memenuhi izin, minimisasi identitas, serta review konteks. Dokumen identitas, nomor rekening, telepon dan alamat rinci tidak masuk output publik |
| BR-06 | Kontak WA hanya nomor resmi yang disetujui, format digit internasional `62...`; pesan awal tidak mengandung nama donor, email, nominal, token, atau data penerima manfaat |
| BR-07 | Semua nominal keuangan R2 adalah integer IDR; format input Indonesia dinormalisasi menjadi integer di server. Tidak memakai floating point untuk pembukuan |
| BR-08 | Usulan konfigurasi R2: minimum donasi Rp10.000, maksimum Rp100.000.000 per donation; provider/channel dapat membatasi lebih ketat. Nominal adalah configurable policy version, belum janji ketersediaan channel |
| BR-09 | Pada baseline R2, biaya platform kepada donor dan potongan campaign adalah Rp0; biaya gateway dibiayai anggaran operator terpisah. Total checkout = principal. R2 tidak aktif sebelum owner menyetujui dan mampu membiayai kebijakan ini |
| BR-10 | Satu donation untuk satu campaign, paling banyak satu successful attempt teralokasi. Attempt baru hanya setelah attempt sebelumnya dipastikan terminal gagal/expired; timeout unknown bukan alasan membuat charge baru. Jika late event membuktikan attempt kedua juga menerima uang, dana ekstra dicatat pada suspense dan diselesaikan finance melalui refund/keputusan sah; tidak menggandakan principal donation atau mengabaikan uang nyata |
| BR-11 | `paid` hanya ditetapkan server berdasarkan status gateway terverifikasi untuk channel yang disetujui. Redirect dan klik tombol sukses tidak menetapkan `paid`. Provider settlement status tidak otomatis membuktikan transfer ke penerima manfaat |
| BR-12 | Fundraising baru hanya untuk campaign active, approval berlaku, jadwal belum berakhir, izin/cakupan valid, dan fundraising gate enabled di server |
| BR-13 | Target campaign adalah sasaran, bukan hard cap. Dana dapat melebihi target sesuai ketentuan surplus yang diterbitkan sebelum aktif; persentase visual dibatasi 100%, angka aktual tetap ditampilkan. Campaign tidak otomatis ditutup hanya karena target tercapai |
| BR-14 | Baseline pendanaan adalah flexible funding: target tidak tercapai tidak otomatis membatalkan. Kampanye harus menjelaskan rencana skala minimum, surplus dan kegagalan kegiatan. Pergantian tujuan tidak dilakukan diam-diam; memerlukan review, pemberitahuan dan opsi penyelesaian sesuai kebijakan |
| BR-15 | Pending yang dibuat sebelum penutupan bisa dibayar sampai expiry provider selama tidak ada pembekuan legal/fraud. Event terlambat selalu dicatat; exception yang tidak layak diterapkan ke campaign masuk suspense dan diselesaikan oleh finance |
| BR-16 | Public amount = jumlah principal paid yang teralokasi pada campaign dikurangi principal refund/chargeback confirmed. Pending, janji, fee, dan estimasi dampak tidak dihitung. Setiap donor count memakai definisi “jumlah donasi berhasil net full refund”, bukan jumlah orang unik |
| BR-17 | Payout tidak boleh melebihi restricted fund yang telah cleared, memiliki saldo kas tersedia, bebas hold, dikurangi payout/refund reservation. Dua identitas berbeda menyetujui; transfer eksternal tidak terjadi di dalam transaksi DB |
| BR-18 | Receipt membuktikan penerimaan pembayaran oleh platform, bukan bukti manfaat disalurkan atau pengurang pajak. Bukti penyaluran dan dampak harus terpisah |
| BR-19 | Refund dapat sebagian atau penuh, total confirmed dan reserved tidak melebihi principal paid. Pembayaran chargeback/refund setelah payout menjadi exception; kewajiban restitusi tidak disembunyikan sebagai saldo campaign negatif tanpa penjelasan |
| BR-20 | Akun/dokumen personal dapat dibatasi/dihapus sesuai basis pemrosesan dan retensi; ledger dan audit yang wajib dipertahankan dimasking/pseudonymized, bukan dihapus tanpa dasar |
| BR-21 | Perubahan nomor WhatsApp yang telah publik harus diusulkan dan disetujui dua identitas staff berbeda; nomor draft tidak mengganti public link. Operator memverifikasi kepemilikan kanal sebelum approval |

## 4. Requirements fungsional R1

| ID | Persyaratan dan kriteria penerimaan | Prioritas |
| --- | --- | --- |
| FR-001 | Sistem harus menyediakan seluruh halaman publik R1 pada PRD dan misi Bahasa Indonesia. Diterima jika beranda mengarahkan ke tiga program, identitas yang disetujui tampil, dan semua nav/footer menuju route valid | Must |
| FR-002 | Tim harus dapat mengelola taxonomy program dengan nama, slug, ringkasan, urutan dan status. Seed Share Eat, Share Knowledge, Share Book; program baru tanpa perubahan source. Program yang dipakai tidak boleh dihapus permanen | Must |
| FR-003 | Publik harus dapat menjelajah inisiatif published dengan filter program, lokasi aman, status kegiatan, dan pencarian judul/ringkasan. Pagination maksimum 20 item per halaman, page invalid menghasilkan 404 untuk URL publik; pencarian kosong memberi saran dan reset | Must |
| FR-004 | Detail inisiatif harus menampilkan tujuan, konteks, penanggung jawab, status planning/ongoing/completed, jadwal jika pasti, pembaruan dan CTA WA. Tidak boleh ada angka pendanaan R1. Slug lama redirect 301; objek privat/tidak ada menghasilkan 404; konten yang pernah publik lalu ditarik permanen dapat menghasilkan 410 dengan penjelasan aman | Must |
| FR-005 | Halaman transparansi harus memuat informasi tim, proses review, status kesiapan legal yang faktual, kebijakan publikasi, dan bukti kegiatan jika ada. Data tanpa bukti tidak diisi dengan angka template; empty state terbaca | Must |
| FR-006 | Tim harus mengelola cerita, pembaruan, FAQ, tentang, kebijakan privasi dan ketentuan melalui CMS. Versi kebijakan mempunyai tanggal berlaku dan arsip yang ditentukan; cerita memiliki author, tanggal dan relasi inisiatif opsional | Must |
| FR-007 | CTA WA harus membuka `https://wa.me/{nomor}` dengan teks ter-encode yang menyebut konteks publik tanpa data sensitif. Pengguna sendiri mengirim pesan. Diterima jika tautan benar pada ponsel/desktop dan tidak ada server send-message | Must |
| FR-008 | Halaman kontak harus menawarkan nomor yang dapat disalin, jam layanan berlabel zona waktu, keterangan kanal eksternal dan fallback WhatsApp Web. Nomor/email/jam yang belum valid tidak dipublikasikan. Tidak mengklaim pesan terkirim atau bantuan darurat | Must |
| FR-009 | CMS harus mendukung draft, preview privat, submit, request changes, review, publish, archive dan revisi. Preview memerlukan session/permission, `no-store` dan noindex. Pengeditan concurrent memakai version dan menolak konflik 409 tanpa menimpa diam-diam | Must |
| FR-010 | Admin harus mengundang mitra setelah pemeriksaan identitas organisasi dan cakupan kerja sama tercatat. Status unverified/suspended menolak submit baru; revoke session setelah suspension. Publik hanya melihat identitas mitra yang disetujui | Must |
| FR-011 | Publikasi harus memerlukan checklist klaim, hak media, privasi, SEO, kanal kontak, dan review oleh identitas berbeda dari penulis revisi. Published snapshot dan reviewer tercatat atomik. Revoke/arsip segera menghilangkan public cache dan sitemap | Must |
| FR-012 | Upload harus memeriksa ukuran, MIME asli, dimensi, izin dan visibility. Baseline gambar JPEG/PNG/WebP ≤8 MB, ≤24 MP; PDF privat ≤10 MB; SVG/HTML user upload ditolak. Turunan publik tanpa EXIF; private object tidak dapat diakses via public URL | Must |
| FR-013 | Admin/editor harus memakai autentikasi server, session dapat dicabut, MFA TOTP bagi seluruh staff, recovery terkontrol, dan rate limit. Login/logout/invite/reset tidak membocorkan keberadaan akun. Akses lintas organisasi ditolak server | Must |
| FR-014 | Sistem harus mencatat audit actor, action, target, timestamp, request ID, reason, dan perubahan yang dimasking. Editor tidak dapat mengubah log. Role grant, konfigurasi kontak, publikasi, archive dan private download diaudit | Must |
| FR-015 | Konten eligible harus SSR dan mempunyai title, description, canonical, metadata share, sitemap dan structured data yang sesuai. Admin/preview/search/private route tidak diindeks. Detail canonical tidak mempunyai tracking query. Validasi server HTML dan HTTP status wajib | Must |
| FR-016 | Pengunjung harus dapat menyalin tautan canonical dan memakai native share jika didukung, dengan fallback. Pesan share tidak mencakup data privat. OG image statis dipilih dari media berizin; kegagalan API share tidak menghentikan membaca | Must |
| FR-017 | Konfigurasi kontak, site URL, program, jam layanan dan feature availability harus divalidasi dan diaudit server; perubahan nomor WA mengikuti dual approval BR-21. R1 build/config harus menonaktifkan seluruh endpoint dan komponen fundraising; direct request ke endpoint transaksi mendapat 404 | Must |
| FR-018 | Sistem harus mengukur view/CTA outbound/pencarian/empty state dengan event minimal tanpa isi chat atau identifier personal. Tidak ada tracker non-esensial sebelum pilihan/dasar pemrosesan yang sesuai. Metric outbound tidak dinamai donasi atau pesan terkirim | Should |
| FR-019 | Tim harus mempunyai prosedur respon WA, review klaim/laporan masalah, koreksi konten, dan pengarsipan. Website menyediakan cara melaporkan kesalahan lewat kontak dengan konteks non-sensitif. Target respon usulan satu hari kerja; bila berubah, jam dan ekspektasi publik diperbarui | Must |
| FR-020 | Gangguan data/CMS/media harus menghasilkan state pemulihan yang jelas. Public safe stale content dibatasi; private fetch tidak memakai public cache. Error server tidak menjadi halaman detail palsu 200; monitoring menerima sinyal kegagalan | Must |

## 5. Requirements fungsional R2

Seluruh requirement berikut **Deferred untuk R1** dan **Must untuk R2**, kecuali akun donor yang opsional pada FR-026. Tidak ada operasi fundraising produksi hanya karena rancangan ini sudah tersedia.

| ID | Persyaratan dan kriteria penerimaan |
| --- | --- |
| FR-021 | Sistem harus menyediakan lifecycle fundraising draft/review/approved/active/paused/closed/completed/cancelled, validasi approval/izin/jadwal/anggaran, kebijakan flexible funding dan surplus. Perubahan material ketika active wajib pause dan review; completed memerlukan laporan serta penyelesaian saldo/exception |
| FR-022 | Server harus membuat donation intent dari campaign active, nominal valid, email receipt, alias publik opsional, anonymity default true, acknowledgment versi ketentuan dan policy biaya. Server mengembalikan quote immutable, expiry dan public ID; idempotency key + body hash menghindari double intent |
| FR-023 | Sistem harus memakai hosted checkout satu gateway melalui adapter; server key privat, channel hanya QRIS/VA/e-wallet yang disetujui provider. Website tidak mengumpulkan PAN/CVV. Status unknown/timeout memerlukan lookup order yang sama sebelum attempt baru |
| FR-024 | Webhook harus diverifikasi signature/merchant/order/amount/currency; duplikasi dan out-of-order tidak menggandakan status/ledger. Unmatched event masuk quarantine. DB commit gagal mendapat non-2xx retryable; event valid baru diack setelah tersimpan durable |
| FR-025 | Halaman status harus membaca state server dengan otorisasi pemilik dan polling berbatas, menampilkan pending/paid/failed/expired/refund/disputed/unknown. Notifikasi hilang dipulihkan reconciliation; provider 404 awal bukan bukti pembayaran gagal. Redirect palsu tidak memicu receipt |
| FR-026 | Guest harus mempunyai akses status/receipt aman tanpa membuka data guest lain; anonim publik default. Akun donor dapat ditambahkan pada R2 dengan claim email terverifikasi, session, export riwayat dan privacy request. Email sama tidak otomatis menggabungkan donasi tanpa proof |
| FR-027 | Receipt bernomor unik harus diterbitkan hanya setelah paid atomik, menampilkan principal, biaya Rp0, campaign, waktu dan payment reference tersamarkan. Email melalui outbox idempotent, undelivered bisa retry; refund menambahkan receipt koreksi dan tidak mengubah receipt asli |
| FR-028 | Sistem harus memposting uang ke ledger double entry append only, jumlah debit = credit, reference unik setiap event. Payment/refund/payout, reservation, campaign projection dan outbox harus konsisten lewat transaksi; reversal membuat entry baru |
| FR-029 | Finance harus mencocokkan pembayaran, laporan settlement provider dan rekening bank setiap hari. Selisih fee, late event, duplicate report dan unknown memiliki ticket. Dana tidak eligible payout sebelum clearance; laporan read only memiliki cutoff jelas |
| FR-030 | Penyaluran harus mempunyai proposal, beneficiary/payee terverifikasi privat, bukti rekening, dual approval berbeda identitas, reservation atomik, referensi transfer unik dan evidence. Transfer manual bank yang disetujui merupakan baseline; mark paid hanya setelah bukti dikonfirmasi checker. Timeout transfer tidak memicu duplikasi |
| FR-031 | Refund/chargeback harus menyimpan alasan, total limit, approval, reservation, provider response dan confirmation, serta posting reversal. Partial/full refund dan dispute sesudah payout punya exception funding/hold; donasi tidak diberi status refunded hanya karena refund diminta |
| FR-032 | Pembaruan impact harus memisahkan uang disalurkan dan bantuan aktual, menyertakan tanggal, metode, sumber dan approval. Review publikasi yang sama berlaku; angka porsi/buku/peserta tidak diturunkan otomatis dari principal atau unit cost estimasi |
| FR-033 | Finance/operator harus dapat pause campaign dan hold payout ketika fraud, legal expiry atau sengketa, tanpa menghapus pembayaran. Sistem mendeteksi velocity tidak wajar, menyimpan alasan keputusan, menghindari membuka identitas sensitif, serta memberi jalur pengaduan |
| FR-034 | Subjek data harus dapat meminta akses, koreksi, export dan penghapusan dengan verifikasi identitas proporsional. Sistem memisahkan data yang wajib disimpan dari data profil, mencatat keputusan dan retensi, serta menerapkan minimisasi pada export. Tidak mengirim file personal lewat URL publik |
| FR-035 | Finance/auditor harus mendapat laporan principal paid/refund, fee operator, clearing, saldo restricted, reservation, payout, cash/bank dan exception per periode/campaign; akses/export diaudit. Nilai publik berasal dari projection yang dapat direbuild dari ledger dan reconciliation |

## 6. Model status dan transisi

### Konten R1 dan R2

`draft → submitted → reviewed → published → archived`; `submitted → changes_requested → draft`. Reviewed revision hanya dapat publish oleh reviewer yang berhak dan berbeda dari revision author. Publish dan pergantian pointer snapshot atomik. Revisi atas konten published mempunyai status sendiri; snapshot lama tetap served sampai pengganti published. Suspensi mitra tidak otomatis menghapus bukti lama; reviewer dapat archive atau menandai laporan dengan alasan.

Activity status: `planning`, `ongoing`, `completed`. Status ini diubah dengan bukti dan review, tidak mengaktifkan payment.

### Fundraising R2

| Dari | Ke | Prasyarat |
| --- | --- | --- |
| draft | review | Semua field fundraising dan bukti disubmit |
| review | draft / approved | Perbaikan atau reviewer menyetujui |
| approved | active | Gate R2, izin berlaku, published snapshot sesuai approved revision, jadwal mulai tercapai |
| active | paused / closed | Hold manual/legal/fraud atau akhir jadwal; intent baru ditolak |
| paused | review / active / closed / cancelled | Perubahan material perlu review; resume tanpa perubahan butuh hold dicabut dan izin valid |
| closed | completed | Settlement/refund/penyaluran selesai, saldo final terselesaikan, laporan final approved |
| draft / review / approved | cancelled | Alasan dan audit; bila ada uang melalui exception, settlement tetap diselesaikan |
| active / paused / closed | cancelled | Keputusan penghentian; kewajiban dana dan refund tetap berjalan; tidak langsung completed |

Closed tidak dibuka kembali; perpanjangan harus dilakukan dan dipublikasikan sebelum closed dengan review material. Kampanye lanjutan memakai entity baru. Seluruh penerimaan lama tetap dapat ditelusuri.

### Pembayaran dan refund

Payment attempt: `created → pending → paid | failed | expired | cancelled`. `unknown` menunjukkan hasil gateway belum diketahui dan harus dilookup, bukan status terminal. Verified success dapat memperbaiki failed/expired/cancelled bila provider menunjukkan uang diterima; event ditandai late exception. Paid tidak turun ke pending/failed karena event lama. Setelah paid, refund dan dispute adalah lifecycle terpisah dengan proyeksi `partially_refunded`, `refunded`, `disputed`, `charged_back`.

Refund: `requested → approved → submitting → pending → confirmed | rejected | failed`; `unknown` memerlukan lookup external reference yang sama. Provider unsupported channel ditangani prosedur refund manual dengan dual approval dan bukti, tanpa janji otomatis ke donor.

Payout: `proposed → approved → reserved → submitted → paid | failed`; state unknown tidak melepaskan reservation sampai hasil transfer diketahui. Cancellation sebelum transfer melepaskan reservation melalui transaksi. Reservation tidak memposting actual bank outflow; confirmation yang memposting uang.

## 7. Input, batas, dan error

- Input R1: judul 3–140 karakter, ringkasan 15–320, slug lowercase alfanumerik/dash 2–100; 1–30 paragraf plain text, masing-masing 1–4.000 karakter; batas byte JSON tetap mengikat seluruh payload. Link user hanya protokol yang diizinkan; script, iframe sembarang dan event handler ditolak.
- Email di R2 dinormalisasi secukupnya tanpa asumsi seluruh provider case insensitive local part; verifikasi untuk akses/claim, tidak untuk memaksa guest membuat akun. Nama publik maksimal 80 karakter, dimoderasi; tidak mengambil nama akun pembayaran sebagai alias publik.
- Payload JSON R1 maksimum 128 KiB, termasuk CMS; upload batas pada FR-012. Besar webhook dibatasi 128 KB dan adapter disesuaikan payload vendor. Nilai tersebut usulan yang diuji saat integrasi.
- Upload read failure, tipe palsu, virus/quarantine, quota penuh, dan scan unavailable tidak membuat objek publishable. Upload privat PDF hanya untuk staff, scan wajib sebelum akses lintas peran.
- API R1 memakai envelope error H3 `{statusCode, statusMessage, message?}` dan header `X-Request-Id`; pesan validasi generik tanpa echo input. UI memakai status HTTP, tidak bergantung format stack. tidak mengembalikan stack, query SQL, token atau payload provider. Status 400 syntax, 401 session, 403 permission, 404 absent/private/disabled, 409 concurrency/state, 422 validation, 429 rate limit, 503 dependency temporary.
- Untuk objek milik pihak lain, API publik menampilkan 404 agar tidak mengungkap keberadaan. Endpoint admin dapat 403 sesuai kebutuhan operasional. Waktu expiry berasal server; countdown client hanya presentasi.

## 8. Requirements nonfungsional

| ID | Rilis | Target normatif dan cara verifikasi |
| --- | --- | --- |
| NFR-001 | R1/R2 | CWV field p75 LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1 per template dengan sampel cukup; sebelum field tersedia gunakan Lighthouse mobile median 3 run ≥90 performance, bukan pengganti INP field. HTML SSR TTFB p95 ≤800 ms untuk cached/public read pada profil kapasitas; API internal p95 ≤500 ms tanpa latensi gateway |
| NFR-002 | R1/R2 | WCAG 2.2 AA pada alur utama: kontras normal ≥4,5:1, besar ≥3:1, UI/focus ≥3:1; keyboard lengkap, fokus tidak tertutup, label/error terhubung, screen reader dan zoom 200%/reflow 320 CSS px. Target UX sentuh ≥44×44 px; hasil axe dilengkapi pemeriksaan manual |
| NFR-003 | R1/R2 | TLS, authorization semua mutation/private read, secure HttpOnly session cookie, CSRF/origin protection, MFA staff, hash password scrypt dengan parameter diuji, secret di server, CSP dan upload validation. Temuan security kritis/tinggi yang dapat dieksploitasi harus selesai sebelum rilis |
| NFR-004 | R1/R2 | Minimisasi data dan private-by-default; masking log, bukti consent/basis pemrosesan, retensi terkonfigurasi, private media melalui stream berautentikasi pada setiap request, tanpa URL bearer publik. Tidak ada email/phone privat atau token pada SSR publik, analytics, sitemap, OG atau cache CDN; nomor kontak resmi yang disetujui boleh tampil melalui allowlist |
| NFR-005 | R1/R2 | Responsive 320–1920 CSS px; uji Android Chrome, iOS Safari, desktop Chrome/Edge/Firefox pada versi yang mendukung Tailwind v4. Minimum Chrome 111, Safari 16.4, Firefox 128 menurut sumber resmi; WhatsApp in-app browser diuji terpisah. Perangkat lebih lama mendapat fallback kontak yang terbaca jika styling gagal |
| NFR-006 | R1/R2 | Public content dan head SSR tanpa ketergantungan JS crawler; satu canonical per eligible page, status HTTP benar, sitemap hanya published canonical 200. Semua internal link publik valid; crawling preview/admin dibatasi akses; metadata noindex tidak bergantung hydration |
| NFR-007 | R1/R2 | Sasaran availability R1 99,5% per bulan dari probe eksternal satu menit pada home/detail; downtime terencana tetap dilaporkan terpisah. Budget ini target desain, bukan SLA provider. R2 memerlukan sasaran 99,9% serta assessment host ulang sebelum aktivasi |
| NFR-008 | R1/R2 | R1 backup DB harian, media/version audit harian, offsite terenkripsi, target RPO ≤24 jam/RTO ≤8 jam. R2 target RPO ≤15 menit/RTO ≤4 jam memerlukan backup log/PITR atau host yang mendukung; restore dan rekonsiliasi gateway wajib diuji sebelum menerima uang |
| NFR-009 | R1/R2 | Profil uji R1: 10.000 inisiatif, 1.000 cerita, 50 request publik/detik mayoritas cache, 5 request DB/detik, 10 editor concurrent, selama 30 menit dengan error <1%, batas resource host terpenuhi. R2: 20 create intent/menit dan burst 10 webhook/detik diuji, ditingkatkan sesuai forecast. Ini workload sasaran, bukan klaim kapasitas paket belum dipilih |
| NFR-010 | R1/R2 | TypeScript strict, lint/typecheck/build tanpa warning milik proyek, boundaries route/service/repository, adapter eksternal dan migration versioned. Rilis lewat script validasi/build lokal yang deterministik dengan lockfile, dependency security review, dan rollback kompatibel schema; bukti hasil ditinjau pada PR, tanpa GitHub Actions. Test mencakup invariant dan alur kritis, bukan target coverage angka sembarang |
| NFR-011 | R1/R2 | Structured log dengan requestId, trace dependency, error redacted; health/readiness, uptime, latency, queue age, backup age, cache purge failure dan alert ke operator. R2 tambah unknown payments, reconciliation difference, payout hold dan webhook errors; alert mempunyai owner/runbook |
| NFR-012 | R2 | Tidak ada double financial posting pada retry/concurrency; debit=credit setiap journal, confirmed refund≤principal, payout≤eligible+cash, paid tidak turun oleh event lama. Uji duplicate/out-of-order/timeout/crash+restore dan replay paling sedikit skenario pada matriks; semua exception tercatat durable |

## 9. Kebijakan data dan retensi usulan

| Data | R1/R2 | Baseline usulan | Owner keputusan |
| --- | --- | --- | --- |
| Konten dan policy revision | Keduanya | Selama relevan + arsip keputusan; hukum/izin media dapat mengubah publikasi | Editorial/legal |
| Session staff | Keduanya | Idle 30 menit, absolute 8 jam; session expired dibersihkan ≤7 hari | Security |
| Reset/invite/MFA recovery | Keduanya | Token single use; enrollment 5 menit, invite 24 jam; recovery supervised 24 jam dan single use | Security |
| Security log | Keduanya | 90 hari online; access audit 1 tahun usulan | Security/legal |
| Analytics agregat R1 | R1 | 90 hari; IP mentah tidak disimpan pada event aplikasi | Product/privacy |
| Raw webhook R2 | R2 | 90 hari terenkripsi/redacted; normalized event sepanjang kebutuhan ledger | Finance/privacy |
| Ledger/finance evidence | R2 | Baseline retensi 10 tahun usulan untuk penilaian legal, bukan klaim kewajiban seragam | Finance/legal |
| Guest access link | R2 | Link bootstrap 15 menit, single use; view session 24 jam; reissue via email terverifikasi | Security |
| Backup | Keduanya | Daily 30 hari + monthly 12 bulan usulan; penghapusan individual berlaku ketika backup berotasi, dengan restore suppression list | Operations/privacy |

Retensi yang belum disahkan tidak boleh dipromosikan sebagai kepastian kebijakan publik. Host/proxy dapat mempunyai access log berbeda; kontrak provider dan masking diselaraskan sebelum rilis. Nomor WA pribadi pengunjung tidak disimpan website R1; percakapan WA berada dalam tata kelola kanal eksternal tim dan memerlukan aturan akses/retensi sendiri.

## 10. Dependency dan penerimaan

R1 membutuhkan domain/site URL, nomor WA resmi aktif, jam layanan, dua identitas staff untuk review, narasi aktual, rights media, hosting lulus spike, DB/media backup, privacy policy dan operator. R2 menambah badan hukum/izin/cakupan, gateway account/callback, rekening settlement, biaya operasional, staff finance terpisah, policy refund, serta recovery yang memenuhi NFR R2.

Definisi selesai dokumentasi: semua FR/NFR terhubung ke sasaran, komponen desain dan skenario uji; tautan lokal/reference audit valid; keputusan terbuka tercatat. Definisi selesai aplikasi: semua skenario rilis dilaksanakan, bukti hasil tercatat, gate sesuai [DECISIONS](DECISIONS.md) disetujui pihak berwenang, dan tidak ada requirement Must rilis tersebut yang diabaikan tanpa revisi baseline.

## 11. Kontrak preview R1 dan batas penerimaan

Pemilik mengizinkan konten dummy **dinamis** dan WA sementara `6287776734038`. Mode demo mempunyai banner dan noindex; nomor dapat digunakan untuk tindakan pengguna, jam layanan diberi label contoh. Seed verified pada organisasi demo hanya fixture akses, bukan klaim due diligence nyata. Mode production tidak mengembalikan snapshot demo dan menolak publish demo. Identitas tim/mitra, operator, domain, rights dan kebijakan aktual tetap gate.

Implementasi membatasi satu organization per staff dengan beberapa role JSON tervalidasi. Partner hanya boleh mempunyai partner_editor dan mengedit initiative milik organisasi. Tim internal dapat mengelola lintas organisasi sesuai role. TOTP diverifikasi bersama password dalam satu request; full session hanya diterbitkan sesudah keduanya valid, OTP yang sudah dipakai ditolak. Recovery memakai dua admin berbeda yang bukan akun target, lalu reenrollment single use; persetujuan baru mencabut token target sebelumnya, penangguhan user/organisasi mencabut token terkait dan payload kredensialnya; aktivasi/enrollment dan pencabutan harus atomik terhadap operasi bersamaan; tidak menggunakan recovery code offline. [ADR implementasi](DECISIONS.md) mencatat pilihan ini.

FR-018 ditunda pada preview: tidak ada tracker atau event analytics browser. FR-019 masih memerlukan penunjukan operator dan latihan SOP. FR-020/NFR operasional baru mempunyai kontrol aplikasi lokal; monitoring eksternal, load, restore, browser matrix dan review keamanan produksi belum dianggap lulus. Lihat [ledger penerimaan](IMPLEMENTATION.md). Perubahan ini tidak menurunkan target kualitas atau melepaskan gate produksi.

## Penjabaran UI R1, 4 Oktober 2026

Redesign menjabarkan FR-001/003/004/006/007/008/020 dan NFR-002 melalui bahasa visual aqua/navy berbasis referensi, navigasi desktop/mobile, filter cepat yang sinkron dengan URL, kartu published media, detail kontekstual, FAQ/empty state, serta pilihan topik kontak WhatsApp. Pilihan topik hanya mengubah pesan awal lokal; tidak menyimpan chat atau mengirim pesan. Ilustrasi konseptual diberi label dan tidak menjadi bukti kegiatan. Batas transaksi FR-017, preview/noindex, dan gate produksi tetap berlaku. Bukti pengujian aktual disimpan pada IMPLEMENTATION.
