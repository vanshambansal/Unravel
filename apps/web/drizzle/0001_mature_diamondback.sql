CREATE TABLE "report_payloads" (
	"report_id" uuid PRIMARY KEY NOT NULL,
	"replay" jsonb NOT NULL,
	"events" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"recording_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"digest" text NOT NULL,
	"bytes" integer NOT NULL,
	"event_count" integer NOT NULL,
	"recording" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reports_title_length" CHECK (char_length("reports"."title") between 1 and 120),
	CONSTRAINT "reports_description_length" CHECK (char_length("reports"."description") <= 2000),
	CONSTRAINT "reports_bounded_bytes" CHECK ("reports"."bytes" between 1 and 5000000)
);
--> statement-breakpoint
ALTER TABLE "report_payloads" ADD CONSTRAINT "report_payloads_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reports_project_recording_unique" ON "reports" USING btree ("project_id","recording_id");--> statement-breakpoint
CREATE INDEX "reports_project_created_index" ON "reports" USING btree ("project_id","created_at");