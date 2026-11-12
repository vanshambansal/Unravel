CREATE TABLE "ingestion_budgets" (
	"project_id" uuid PRIMARY KEY NOT NULL,
	"minute" timestamp with time zone NOT NULL,
	"minute_count" integer NOT NULL,
	"day" timestamp with time zone NOT NULL,
	"day_count" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "status" text DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "ingestion_budgets" ADD CONSTRAINT "ingestion_budgets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reports_project_status_created_index" ON "reports" USING btree ("project_id","status","created_at","id");--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_status_valid" CHECK ("reports"."status" in ('open', 'resolved'));--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_revision_positive" CHECK ("reports"."revision" > 0);