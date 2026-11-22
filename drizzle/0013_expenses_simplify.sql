ALTER TABLE "expenses" DROP CONSTRAINT "expenses_booking_id_bookings_id_fk";
--> statement-breakpoint
DROP INDEX "expenses_booking_idx";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "booking_id";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "receipt_path";--> statement-breakpoint
-- Kategori "transport" dihapus dari form belanja.
UPDATE "expenses" SET "category" = 'lainnya' WHERE "category" = 'transport';
