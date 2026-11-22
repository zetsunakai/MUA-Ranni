CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"spent_on" date NOT NULL,
	"category" text NOT NULL,
	"item" text NOT NULL,
	"store" text,
	"amount" integer NOT NULL,
	"note" text,
	"booking_id" text,
	"receipt_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expenses_spent_on_idx" ON "expenses" USING btree ("spent_on");--> statement-breakpoint
CREATE INDEX "expenses_booking_idx" ON "expenses" USING btree ("booking_id");--> statement-breakpoint
-- Bucket foto struk belanja. PRIVAT (public = false): tidak bisa dibuka lewat URL publik,
-- hanya lewat signed URL yang dibuat server untuk admin. Upload hanya dari server (SUPABASE_SECRET_KEY).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;
