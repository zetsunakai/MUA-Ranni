# Struktur redesign

Referensi: `/home/dio/Downloads/stitch_makeup_artist_company_profile`.
Kalimat, identitas, harga, ketentuan, foto, serta data profil tetap bersumber dari repo/database. Tidak menyalin klaim, nama paket, alamat, maupun kalimat Atelier Beauté.

| Halaman | Referensi | Susunan hasil refactor |
| --- | --- | --- |
| Beranda | Philosophie + Lookbook + Suites | Editorial pembuka dengan foto tunggal → kutipan profil → preview lookbook seragam → isi lengkap Layanan & Harga → kutipan klien → CTA |
| Tentang | Philosophie | Profil dan foto berbingkai dengan metadata → kutipan → cara merias → produk → daftar area layanan → CTA |
| Portfolio | Lookbook | Judul/deskripsi dua kolom → filter horizontal → grid seragam → before/after dan panel penjelasan → detail look → testimoni → CTA |
| Layanan | Suites & Tarifs | Judul terpusat → ketentuan booking ringkas → kartu paket tiga kolom tanpa foto → perbandingan bonus → tambahan → produk → CTA |
| Kontak | Réservation | Intro dan info jam respons → form utama + sidebar WhatsApp, lokasi, langkah booking, FAQ → pernyataan izin foto |
| Admin ringkasan | Dashboard Calendar | Judul dan aksi → metrik → kalender besar + antrean testimoni → agenda mendatang + preview portfolio |
| Admin portfolio | Lookbook Curator | Judul dan metrik → toolbar → contact sheets dua kolom seragam → preview before/after |
| Admin layanan | Suites Configurator | Intro → ringkasan layanan → kartu editor paket → editor tambahan → perbandingan bonus → bilah simpan |
| Admin testimoni | Dossier | Ringkasan status → daftar moderasi utama + sidebar undangan → daftar testimoni yang tampil |

Desain dossier reservasi diadaptasi ke data testimoni/undangan yang memang tersedia. Tidak menambahkan CRM, reservasi tersimpan, pendapatan, kuota, atau sertifikasi fiktif. Halaman Jadwal dan FAQ mempertahankan URL dan fungsinya, dengan komposisi yang mengikuti halaman kontak dan panel editorial.

## Navigasi dan cache

- Urutan menu dimulai dari Layanan & Harga, lalu Portofolio.
- Foto dan indeks kartu layanan dihapus dari publik dan admin.
- Menu publik memakai full prefetch dan Router Cache 10 menit. Halaman admin yang dinamis tetap memiliki stale time 0.
- Tautan booking internal memakai Next Link agar tidak memuat ulang seluruh dokumen. Cookie tetap digunakan untuk sesi admin; payload halaman disimpan oleh cache Next.js, bukan cookie.
- Data halaman publik tetap direvalidasi melalui Server Actions. Perubahan testimoni juga memperbarui portfolio; perubahan kategori juga memperbarui pilihan formulir kontak.
- Prefetch otomatis diukur pada build production. Mode dev tetap perlu mengompilasi halaman dan bukan acuan waktu navigasi production.

Home menampilkan seluruh isi Layanan & Harga melalui `ServicesContent`, termasuk paket, harga, perbandingan, tambahan, produk, dan ketentuan. Route `/layanan` memakai komponen yang sama. Judul harga di home memakai h2 agar halaman tetap mempunyai satu h1.
