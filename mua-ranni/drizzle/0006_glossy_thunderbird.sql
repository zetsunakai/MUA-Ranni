CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
-- Isi awal: 4 kategori yang sebelumnya tertulis di kode. Harus ada SEBELUM foreign key
-- dipasang, karena foto/testimoni yang sudah ada memakai id ini.
INSERT INTO "categories" ("id", "label", "sort_order") VALUES
	('bridal', 'Bridal', 1),
	('wisuda', 'Wisuda', 2),
	('engagement', 'Engagement', 3),
	('photoshoot', 'Photoshoot', 4)
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_category_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "testimonial_invites" ADD CONSTRAINT "testimonial_invites_event_type_categories_id_fk" FOREIGN KEY ("event_type") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_event_type_categories_id_fk" FOREIGN KEY ("event_type") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE cascade;