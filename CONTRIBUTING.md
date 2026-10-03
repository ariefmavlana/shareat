# Panduan kontribusi Shareat

Setiap perubahan menggunakan branch khusus dan pull request ke `main`, termasuk perubahan kecil, dokumentasi, bugfix, dependensi, CI, dan infrastruktur. Instruksi ini ditetapkan pemilik repository pada 3 Oktober 2026.

## Memulai perubahan

Periksa `git status` dan selesaikan/pisahkan perubahan yang sedang berjalan sebelum berpindah base. Jangan melakukan reset untuk membersihkan perubahan milik orang lain. Pada checkout yang bersih:

```sh
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c docs/nama-perubahan
```

Pilih prefix `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, atau `chore` sesuai tujuan. Satu branch untuk satu pekerjaan yang dapat direview; lanjutan revisi PR memakai branch PR tersebut. Jangan menggunakan kembali branch PR yang sudah merged untuk fitur baru.

## Commit dan validasi

Gunakan Conventional Commits, misalnya `docs: define platform requirements` atau `fix: correct campaign visibility`. Commit berisi perubahan yang kohesif; jangan mencampur pekerjaan yang tidak terkait.

Untuk paket dokumentasi:

```sh
python -m pip install Pillow
python docs/tools/validate_docs.py
git diff --check
git add <berkas-yang-direview>
git diff --cached --check
git diff --cached --stat
git commit -m "docs: describe the change"
git push -u origin docs/nama-perubahan
```

Periksa staged diff, bukan hanya working tree. Jangan commit `.env`, token, private key, konfigurasi lokal PHP, log personal, atau output build. Berkas referensi tetap berstatus audit lisensi belum selesai. Validasi dokumentasi yang lulus tidak menyatakan aplikasi telah diuji atau legal readiness selesai.

## Pull request

Buka PR dengan base `main`, judul yang menjelaskan hasil perubahan, dan deskripsi mengikuti template. Jelaskan masalah, perilaku sesudah perubahan, scope, validasi aktual, serta risiko/dependency yang material. Kaitkan requirement atau keputusan jika relevan. Jangan mencentang pengujian yang belum dijalankan.

GitHub Actions tidak digunakan, sesuai keputusan pemilik pada 3 Oktober 2026. Jalankan pemeriksaan secara lokal dan tulis perintah serta hasil aktual pada deskripsi PR. Validator dokumentasi, whitespace berkas yang diubah, dan reproduksibilitas inventaris/laporan dari checkout commit bersih harus lulus sebelum merge. Pengujian aplikasi ditambahkan ketika aplikasi tersedia; validasi dokumentasi tidak mengklaim menjalankan Nuxt.

## Review dan merge

Semua perubahan harus melalui PR. Branch protection pada GitHub merupakan penegakan server; file panduan sendiri tidak memblokir direct push. Konfigurasi yang dituju: PR wajib, percakapan diselesaikan, riwayat linear, tanpa force push/delete `main`, dan berlaku juga bagi admin. Tidak ada required status check GitHub Actions; hasil validasi lokal ditinjau pada PR. Pada repository dengan satu maintainer, approval orang kedua tidak dipaksakan; keputusan merge tetap harus dilakukan pihak berwenang.

Merge setelah validasi dan review selesai serta pemilik memberi otorisasi. Gunakan squash merge agar `main` mempunyai commit yang menggambarkan satu perubahan. Hapus branch remote sesudah merge jika tidak lagi dibutuhkan. Jangan merge otomatis hanya karena PR sudah dibuat.

## Perubahan requirement

Perbarui PRD/SRS/SDD, keputusan, dan matriks pada PR yang sama bila perubahan memengaruhi lingkup/perilaku. Pisahkan R1 dan R2 sesuai baseline. Semua perubahan produksi memerlukan gate deployment yang relevan; pembuatan PR tidak berarti publikasi website.
