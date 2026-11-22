CREATE TABLE "brands" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logo_url" text NOT NULL,
	"logo_path" text,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "brands" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" text PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "faqs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "site_profile" ADD COLUMN "deposit_info" text;--> statement-breakpoint
ALTER TABLE "site_profile" ADD COLUMN "payment_info" text;--> statement-breakpoint
ALTER TABLE "site_profile" ADD COLUMN "terms" text[];--> statement-breakpoint
ALTER TABLE "site_profile" ADD COLUMN "photo_url" text;--> statement-breakpoint
ALTER TABLE "site_profile" ADD COLUMN "photo_path" text;--> statement-breakpoint
ALTER TABLE "site_profile" ADD COLUMN "location_name" text;--> statement-breakpoint
ALTER TABLE "site_profile" ADD COLUMN "location_address" text;--> statement-breakpoint
ALTER TABLE "site_profile" ADD COLUMN "location_maps_url" text;--> statement-breakpoint
ALTER TABLE "site_profile" ADD COLUMN "bank_accounts" jsonb;--> statement-breakpoint
ALTER TABLE "site_profile" ADD COLUMN "bank_account_name" text;--> statement-breakpoint
-- Isi awal: 16 logo yang sebelumnya ditulis di src/data/services.ts.
INSERT INTO "brands" ("id", "name", "logo_url", "width", "height", "sort_order") VALUES
  ('lt-pro', 'LT Pro', '/images/brands/lt-pro.webp', 193, 153, 0),
  ('browit', 'Browit', '/images/brands/browit.webp', 480, 151, 1),
  ('wardah', 'Wardah', '/images/brands/wardah.webp', 246, 47, 2),
  ('make-over', 'Make Over', '/images/brands/make-over.webp', 224, 100, 3),
  ('hada-labo', 'Hada Labo', '/images/brands/hada-labo.webp', 480, 447, 4),
  ('inez', 'Inez', '/images/brands/inez.webp', 480, 480, 5),
  ('mercredi', 'Mercredi', '/images/brands/mercredi.webp', 353, 44, 6),
  ('artisan-professionnel', 'Artisan Professionnel', '/images/brands/artisan.webp', 480, 119, 7),
  ('muaq', 'MUAQ', '/images/brands/muaq.webp', 480, 108, 8),
  ('reveline', 'Reveline', '/images/brands/reveline.webp', 480, 222, 9),
  ('pramy', 'Pramy', '/images/brands/pramy.webp', 352, 60, 10),
  ('sea-makeup', 'Sea Makeup', '/images/brands/sea-makeup.webp', 353, 64, 11),
  ('maybelline', 'Maybelline', '/images/brands/maybelline.svg', 155, 25, 12),
  ('esqa', 'ESQA', '/images/brands/esqa.webp', 480, 164, 13),
  ('vaseline', 'Vaseline', '/images/brands/vaseline.svg', 203, 140, 14),
  ('judydoll', 'Judydoll', '/images/brands/judydoll.webp', 480, 48, 15)
ON CONFLICT ("id") DO NOTHING;