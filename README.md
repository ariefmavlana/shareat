# Shareat

Platform kemanusiaan Indonesia dengan program Share Eat, Share Knowledge, Share Book, dan program berbagi lainnya. Repository saat ini berisi perencanaan produk serta referensi desain; aplikasi Nuxt belum diimplementasikan.

R1 menyediakan informasi program, transparansi, CMS privat, serta kontak WhatsApp. R2 menambahkan crowdfunding setelah kesiapan legal, payment gateway, dan operasional keuangan terpenuhi.

## Dokumentasi

- [Indeks dokumentasi](docs/README.md)
- [PRD](docs/PRD.md), [SRS](docs/SRS.md), dan [SDD](docs/SDD.md)
- [Keputusan dan gate peluncuran](docs/DECISIONS.md)
- [Keterlacakan dan rencana penerimaan](docs/TRACEABILITY.md)
- [Sumber dan audit referensi](docs/EVIDENCE.md)

## Kontribusi

Setiap fitur, perbaikan, dokumentasi, refactor, dan perubahan konfigurasi harus dimulai di branch baru dan diajukan melalui pull request ke `main`. Ikuti [CONTRIBUTING.md](CONTRIBUTING.md) dan [AGENTS.md](AGENTS.md). Perubahan pada `main` masuk melalui PR; merge memerlukan keputusan pemilik/maintainer yang berwenang.

## Validasi dokumentasi

Gunakan Python 3.11 atau lebih baru dan Pillow yang sesuai environment:

```sh
python -m pip install Pillow
python docs/tools/validate_docs.py
git diff --check
```

Pillow digunakan agar dimensi media dalam inventaris konsisten. Validator memeriksa tautan, ID, matriks requirement, skenario penerimaan, dan aset; belum menjalankan pengujian aplikasi. Referensi `referensi/` merupakan bahan desain, bukan aplikasi produksi. Integrasi peta dengan kunci tertanam telah dihapus sebelum publikasi; konfigurasi PHP lokal tidak dilacak Git. Hak penggunaan media masih perlu diperiksa sesuai audit.
