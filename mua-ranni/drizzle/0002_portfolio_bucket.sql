-- Bucket Supabase Storage untuk foto portofolio.
-- public = true: foto bisa dilihat siapa saja lewat URL publik (dibutuhkan website).
-- Tidak ada policy tulis di storage.objects, jadi upload/hapus hanya bisa dari server
-- memakai SUPABASE_SECRET_KEY (setelah requireAdmin()).
-- Batas 2 MB per file dan hanya gambar; foto sudah dikompres di browser sebelum upload.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;
