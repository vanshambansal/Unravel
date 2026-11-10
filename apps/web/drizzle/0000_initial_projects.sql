CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"origin" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_name_length" CHECK (char_length("projects"."name") between 1 and 80),
	CONSTRAINT "projects_owner_not_empty" CHECK (char_length("projects"."owner_id") > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "projects_owner_origin_unique" ON "projects" USING btree ("owner_id","origin");--> statement-breakpoint
CREATE INDEX "projects_owner_created_index" ON "projects" USING btree ("owner_id","created_at");