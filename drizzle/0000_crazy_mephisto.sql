CREATE TABLE "add_ons" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price_from" integer NOT NULL,
	"price_to" integer,
	"note" text,
	"sort_order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "add_ons" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "service_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tier" text NOT NULL,
	"includes" text[] NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_groups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "service_items" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"sort_order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "service_items" ADD CONSTRAINT "service_items_group_id_service_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."service_groups"("id") ON DELETE cascade ON UPDATE no action;