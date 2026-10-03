# Keterlacakan dan rencana penerimaan Shareat

**Versi:** 1.0 · **Tanggal:** 2 Oktober 2026. Matriks menghubungkan tujuan [PRD](PRD.md), requirements [SRS](SRS.md), komponen [SDD](SDD.md), dan skenario penerimaan. Seluruh TC adalah **rencana pengujian aplikasi**, bukan hasil lulus. Hasil pemeriksaan dokumen dicatat terpisah pada [VALIDATION](VALIDATION.md).

## 1. Matriks kebutuhan fungsional

| Requirement | Tujuan | Rilis | Desain | Test | Skenario dan bukti penerimaan |
| --- | --- | --- | --- | --- | --- |
| FR-001 | P-01 | R1 | C-01 | TC-001 | Buka semua route publik/mobile; misi dan tiga program ditemukan, link tidak buntu |
| FR-002 | P-01 | R1 | C-02 | TC-002 | Tambah program via CMS tanpa code; slug conflict ditolak; program terpakai tidak hard delete |
| FR-003 | P-02 | R1 | C-01 | TC-003 | Filter/search/pagination normal, zero result, invalid page; published only, pageSize limit enforced |
| FR-004 | P-02 | R1 | C-01 | TC-004 | Detail planning/ongoing/completed; private404, withdrawn410, slug301; tidak ada angka fundraising |
| FR-005 | P-03 | R1 | C-02 | TC-005 | Identitas/bukti aktual atau empty state; tidak ada angka/badge/izin Charity template |
| FR-006 | P-03 | R1 | C-02 | TC-006 | Edit stories/FAQ/policy, effective date/revision archive, reviewer publishes and prior public remains |
| FR-007 | P-04 | R1 | C-05 | TC-007 | Klik WA di Android/iOS/desktop membuka nomor/preset encoded; message belum terkirim otomatis |
| FR-008 | P-04 | R1 | C-05 | TC-008 | WA tidak terpasang/JS disabled: nomor copy/fallback dan jam layanan tersedia; invalid setting no publish |
| FR-009 | P-05 | R1 | C-02 | TC-009 | Dua editor save same version→409; draft/private preview tidak cache/index; old published unchanged |
| FR-010 | P-05 | R1 | C-03 | TC-010 | Mitra verified submit scoped; organisasi lain/suspended ditolak, sessions revoked |
| FR-011 | P-05 | R1 | C-02 | TC-011 | Self review denied, checklist missing denied; publish atomic; archive purge origin/CDN+sitemap |
| FR-012 | P-03 | R1 | C-04 | TC-012 | MIME spoof/oversize/SVG/scan unavailable denied; rights+EXIF+private URL and object ACL checked |
| FR-013 | P-10 | R1 | C-03 | TC-013 | Login/MFA/CSRF/session rotation/revoke/throttle/recovery; cross-org/private read denied |
| FR-014 | P-05 | R1 | C-07 | TC-014 | Role/contact/publish/download logs complete and redacted; editor log mutation denied |
| FR-015 | P-07 | R1 | C-06 | TC-015 | Inspect raw HTML/status/head/JSON-LD/sitemap/noindex; no JS crawler and no private data |
| FR-016 | P-07 | R1 | C-06 | TC-016 | Native share denial/unsupported falls back copy canonical; OG public approved image loads |
| FR-017 | P-10 | R1 | C-13 | TC-017 | R1 direct POST donations/webhooks/payouts404, UI fields absent; WA change needs approval/audit |
| FR-018 | P-04 | R1 | C-07 | TC-018 | Analytics disabled/default consent, event payload no PII; outbound recorded as click only |
| FR-019 | P-03 | R1 | C-05 | TC-019 | Operator executes complaint/correction exercise and response workflow; hours/escalation factual |
| FR-020 | P-10 | R1 | C-12 | TC-020 | DB/media outage, cache purge failure, host restart; state/error truthful, no private stale, alerts fire |
| FR-021 | P-08 | R2 | C-13 | TC-021 | Expired permit/unapproved revision/inactive gate reject intent; transitions/surplus/flexible policy tested |
| FR-022 | P-08 | R2 | C-08 | TC-022 | Nominal min/max/channel limits, fee quote, duplicate key same body reuse; different body409 |
| FR-023 | P-08 | R2 | C-08 | TC-023 | Gateway timeout/early404 reuses lookup order; no second charge; no PAN/server key in browser |
| FR-024 | P-08 | R2 | C-08 | TC-024 | Duplicate, forged signature, amount/merchant mismatch, late/out-of-order, DB failure/quarantine/retry; dua attempt nyata paid hanya satu allocated, ekstra suspense/refund |
| FR-025 | P-08 | R2 | C-08 | TC-025 | Fake success URL remains pending; delayed webhook status becomes paid; polling stops/backoff; no redirect receipt |
| FR-026 | P-08 | R2 | C-11 | TC-026 | Guest token consumed once/expiry, donor A cannot see B, email claim proof, anonim default |
| FR-027 | P-08 | R2 | C-08 | TC-027 | Paid receipt unique, pending none; email retry no new receipt, refund corrective receipt/private delivery |
| FR-028 | P-09 | R2 | C-09 | TC-028 | Parallel verified events post once; journal balanced; projection/outbox rollback/crash recoverable |
| FR-029 | P-09 | R2 | C-10 | TC-029 | Settlement+bank mismatch, fee deduction, duplicate imports, missing event and operator top-up reconciliation |
| FR-030 | P-09 | R2 | C-10 | TC-030 | Self approval denied; two simultaneous payouts cannot overreserve cash/fund; transfer unknown no duplicate |
| FR-031 | P-09 | R2 | C-10 | TC-031 | Partial/full refund cap/reserve, gateway unsupported/manual, chargeback/refund after payout, no premature refunded |
| FR-032 | P-09 | R2 | C-02 | TC-032 | Evidence-approved report updates impact; principal÷cost does not create actual beneficiaries |
| FR-033 | P-09 | R2 | C-10 | TC-033 | Fraud/legal hold pauses new intent and reserves payout, historical payment retained, dispute resolution audited |
| FR-034 | P-10 | R2 | C-11 | TC-034 | Verified privacy export/delete, retention exception and backup suppression; private signed expiry |
| FR-035 | P-09 | R2 | C-09 | TC-035 | As-of campaign/fee/bank/advance reports reconcile ledger; projection rebuild equal; unauthorized export denied |

## 2. Matriks kualitas

| Requirement | Tujuan | Rilis | Desain | Test | Skenario dan bukti penerimaan |
| --- | --- | --- | --- | --- | --- |
| NFR-001 | P-06 | R1/R2 | C-01 | TC-036 | Three-run mobile lab per template, p95 server/API load; field p75 setelah sampel cukup, INP tidak diganti TBT |
| NFR-002 | P-06 | R1/R2 | C-01 | TC-037 | Axe + keyboard/screen reader/contrast/focus/zoom320reflow; ≥12 riset peserta lintas usia untuk task UX |
| NFR-003 | P-10 | R1/R2 | C-03 | TC-038 | Security negative tests MFA/CSRF/IDOR/XSS/upload/open redirect/CSP/secrets; auth resource benchmark |
| NFR-004 | P-10 | R1/R2 | C-11 | TC-039 | Inspect SSR/payload/log/analytics/CDN/OG, no private PII; signed access and retention behavior |
| NFR-005 | P-06 | R1/R2 | C-01 | TC-040 | Responsive320–1920, supported browser matrix, WA in-app browser, fallback old/JS-disabled contact |
| NFR-006 | P-07 | R1/R2 | C-06 | TC-041 | Crawl approved routes, canonical pagination/filters,404/410/301, staging auth/noindex, private sitemap exclusion |
| NFR-007 | P-10 | R1/R2 | C-12 | TC-042 | External probe with downtime evidence monthly; target R1/R2 distinguished and host assessed before R2 |
| NFR-008 | P-10 | R1/R2 | C-12 | TC-043 | Restore DB/media/key/privacy suppression; R1RPO24h/RTO8h, R2PITR15m/RTO4h+gateway replay measured |
| NFR-009 | P-10 | R1/R2 | C-12 | TC-044 | Workload NFR30min, error<1%, quotas/pool/cron observed; R2 burst callbacks and cached public traffic isolated |
| NFR-010 | P-10 | R1/R2 | C-12 | TC-045 | CI lockfile/lint/strict type/build/boundaries/migrations, compatible deploy+rollback and dependency audit |
| NFR-011 | P-10 | R1/R2 | C-07 | TC-046 | Inject error/stale backup/dead letter/purge failure; R2 unknown/reconciliation alerts reach on-call and runbook |
| NFR-012 | P-09 | R2 | C-09 | TC-047 | Crash before/after DB commit and provider reply; replay events/refunds/payouts, balanced/unique journals and reservations |

## 3. Test lintas tahap yang wajib

- **Pembatasan R1:** crawl/public/admin payload serta direct request memverifikasi tidak ada rekening, QR payment, progress pendanaan, checkout, klaim izin palsu atau alur manual bayar lewat WA.
- **Trust editorial:** source, izin media, penanggung jawab, tanggal, status rencana, checklist dan audit diuji dengan revisi yang sengaja tidak lengkap.
- **Privasi lintas peran:** editor mitra A, reviewer, operator support, auditor dan guest mencoba mengakses objek milik pihak lain; semua data sensitif denied/redacted sesuai kebutuhan.
- **Integritas R2:** quote fee, min/max, paused/closed/expired permit, over target, pending setelah close, legal hold, refund sesudah payout, double approvals dan cash shortage punya assertion eksplisit.
- **Recovery:** restart host/lease expiry, retry email, backup restore/privacy suppression, ledger replay dan freeze/reopen tidak menghasilkan pembayaran/penyaluran baru yang tidak sah.

Kriteria lulus aplikasi dicatat per rilis dengan actual environment/version, input, expected/actual, bukti output dan owner. Skema TC tidak menggantikan pengujian legal, accountant review, riset pengguna, atau due diligence mitra. Negative tests keuangan tidak menggunakan donor nyata atau uang nyata di environment staging.
