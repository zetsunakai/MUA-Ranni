-- Bucket foto testimoni dari klien. Sama seperti bucket portfolio: bisa dibaca publik
-- lewat URL (path berisi UUID acak, tidak terdaftar di mana pun sebelum disetujui),
-- tanpa policy tulis; upload hanya dari server memakai SUPABASE_SECRET_KEY.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('testimonials', 'testimonials', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;
