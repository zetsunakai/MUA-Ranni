CREATE TABLE "site_profile" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"whatsapp_number" text,
	"instagram_handle" text,
	"tiktok_handle" text,
	"service_areas" text[],
	"response_hours" text,
	"greeting" text,
	"bio" text[],
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "site_profile" ENABLE ROW LEVEL SECURITY;