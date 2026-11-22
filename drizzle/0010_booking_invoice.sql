ALTER TABLE "bookings" ADD COLUMN "invoice_number" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "invoice_issued_at" date;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_invoice_number_unique" UNIQUE("invoice_number");