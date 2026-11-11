CREATE TABLE "report_test_plans" (
	"report_id" uuid PRIMARY KEY NOT NULL,
	"plan" jsonb NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "report_test_plan_revision" CHECK ("report_test_plans"."revision" > 0)
);
--> statement-breakpoint
ALTER TABLE "report_test_plans" ADD CONSTRAINT "report_test_plans_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;