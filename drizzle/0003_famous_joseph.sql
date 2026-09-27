CREATE TABLE "testimonial_invites" (
	"id" text PRIMARY KEY NOT NULL,
	"client_name" text NOT NULL,
	"event_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "testimonial_invites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" text PRIMARY KEY NOT NULL,
	"invite_id" text,
	"client_name" text NOT NULL,
	"event_type" text NOT NULL,
	"quote" text NOT NULL,
	"photo_url" text,
	"photo_path" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone,
	CONSTRAINT "testimonials_invite_id_unique" UNIQUE("invite_id")
);
--> statement-breakpoint
ALTER TABLE "testimonials" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_invite_id_testimonial_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."testimonial_invites"("id") ON DELETE set null ON UPDATE no action;