ALTER TABLE "portfolio_items" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- Isi awal: ikuti urutan lama (terbaru di depan), supaya tampilan website tidak berubah.
UPDATE "portfolio_items" AS p SET "sort_order" = o.rn
FROM (SELECT "id", row_number() OVER (ORDER BY "created_at" DESC) AS rn FROM "portfolio_items") AS o
WHERE p."id" = o."id";
