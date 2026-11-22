ALTER TABLE "service_items" ADD COLUMN "categories" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
-- Isi awal: tebakan dari nama layanan. Bisa diubah admin di /admin/layanan.
UPDATE "service_items" AS i SET "categories" = m.cats
FROM (VALUES
  ('anak-tk', ARRAY['wisuda']),
  ('anak-tari', ARRAY['tari']),
  ('wisuda-sd', ARRAY['wisuda']),
  ('wisuda-smp', ARRAY['wisuda']),
  ('anak-pagar-ayu-party', ARRAY['bridesmaid', 'party']),
  ('bridesmaid', ARRAY['bridal', 'bridesmaid']),
  ('wisuda-sma', ARRAY['wisuda']),
  ('sister-of-groom-bride', ARRAY['bridal', 'sister']),
  ('tari-dewasa', ARRAY['tari']),
  ('dewasa-event-party', ARRAY['party']),
  ('mom-pendamping-wisuda', ARRAY['mom', 'wisuda']),
  ('mom-of-groom-bride', ARRAY['bridal', 'mom']),
  ('mom-event-party', ARRAY['mom', 'party']),
  ('premium-wisuda', ARRAY['wisuda']),
  ('wisuda-non-softlens', ARRAY['wisuda']),
  ('premium-pendamping-wisuda', ARRAY['wisuda']),
  ('premium-bridesmaid', ARRAY['bridal', 'bridesmaid']),
  ('premium-sister', ARRAY['bridal', 'sister']),
  ('premium-photoshoot', ARRAY['photoshoot']),
  ('premium-event-party', ARRAY['party']),
  ('akad', ARRAY['bridal']),
  ('groom', ARRAY['bridal']),
  ('prewedding', ARRAY['bridal', 'photoshoot']),
  ('lamaran', ARRAY['engagement', 'lamaran']),
  ('siraman', ARRAY['bridal']),
  ('pengajian', ARRAY['bridal'])
) AS m(id, cats)
WHERE i."id" = m.id;
