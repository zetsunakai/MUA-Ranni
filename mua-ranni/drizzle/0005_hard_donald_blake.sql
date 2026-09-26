CREATE TABLE "schedule_days" (
	"date" date PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"note" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "schedule_days" ENABLE ROW LEVEL SECURITY;