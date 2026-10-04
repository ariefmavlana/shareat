ALTER TABLE "content_revisions" ADD COLUMN "review_note" text;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD COLUMN "reviewed_at" timestamp (3) with time zone;