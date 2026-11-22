CREATE TABLE "booking_lines" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"service_item_id" text,
	"description" text NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"unit_price" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_lines" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"client_name" text NOT NULL,
	"client_phone" text,
	"event_type" text,
	"event_date" date NOT NULL,
	"makeup_time" text,
	"location" text,
	"maps_url" text,
	"people" integer,
	"hairdo" text,
	"note" text,
	"status" text DEFAULT 'estimasi' NOT NULL,
	"transport_fee" integer DEFAULT 0 NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"paid_on" date NOT NULL,
	"amount" integer NOT NULL,
	"kind" text NOT NULL,
	"method" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "booking_lines" ADD CONSTRAINT "booking_lines_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_lines" ADD CONSTRAINT "booking_lines_service_item_id_service_items_id_fk" FOREIGN KEY ("service_item_id") REFERENCES "public"."service_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_lines_booking_idx" ON "booking_lines" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "bookings_event_date_idx" ON "bookings" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "payments_booking_idx" ON "payments" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "payments_paid_on_idx" ON "payments" USING btree ("paid_on");