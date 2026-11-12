CREATE TABLE "account_intake_blocks" (
	"owner_id" text PRIMARY KEY NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
