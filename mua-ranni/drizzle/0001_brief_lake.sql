CREATE TABLE "portfolio_items" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"image_url" text NOT NULL,
	"image_path" text,
	"before_image_url" text,
	"before_image_path" text,
	"description" text,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portfolio_items" ENABLE ROW LEVEL SECURITY;