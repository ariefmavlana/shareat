CREATE TABLE "assets" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"organization_id" varchar(36) NOT NULL,
	"storage_key" varchar(100) NOT NULL,
	"mime" varchar(80) NOT NULL,
	"bytes" integer NOT NULL,
	"sha256" varchar(64) NOT NULL,
	"width" integer,
	"height" integer,
	"scan_status" varchar(20) NOT NULL,
	"rights_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"rights_reason" text,
	"uploaded_by" varchar(36) NOT NULL,
	"approved_by" varchar(36),
	"created_at" timestamp (3) with time zone NOT NULL,
	CONSTRAINT "assets_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"actor_id" varchar(36),
	"action" varchar(100) NOT NULL,
	"target_id" varchar(100) NOT NULL,
	"request_id" varchar(36) NOT NULL,
	"reason" text,
	"safe_change" jsonb NOT NULL,
	"created_at" timestamp (3) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_challenges" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"kind" varchar(20) NOT NULL,
	"payload" jsonb NOT NULL,
	"expires_at" timestamp (3) with time zone NOT NULL,
	"consumed" boolean DEFAULT false NOT NULL,
	CONSTRAINT "auth_challenges_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "content_entities" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"kind" varchar(20) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"organization_id" varchar(36) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"published_revision_id" varchar(36),
	"ever_published" boolean DEFAULT false NOT NULL,
	"archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"organization_type" varchar(20) DEFAULT 'partner' NOT NULL,
	"name" varchar(140) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"suspended" boolean DEFAULT false NOT NULL,
	"evidence" text,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "outbox_jobs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"type" varchar(40) NOT NULL,
	"entity_id" varchar(36) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"available_at" timestamp (3) with time zone NOT NULL,
	"lease_until" timestamp (3) with time zone,
	"lease_owner" varchar(36)
);
--> statement-breakpoint
CREATE TABLE "change_proposals" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"kind" varchar(40) NOT NULL,
	"maker_id" varchar(36) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"checker_id" varchar(36),
	"created_at" timestamp (3) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit_buckets" (
	"key_hash" varchar(64) PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"expires_at" timestamp (3) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redirects" (
	"from_path" varchar(220) PRIMARY KEY NOT NULL,
	"to_path" varchar(220) NOT NULL,
	"created_at" timestamp (3) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_revisions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"entity_id" varchar(36) NOT NULL,
	"sequence" integer NOT NULL,
	"body_json" jsonb NOT NULL,
	"status" varchar(25) NOT NULL,
	"author_id" varchar(36) NOT NULL,
	"reviewer_id" varchar(36),
	"checklist" jsonb,
	"created_at" timestamp (3) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token_hash" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"csrf_hash" varchar(64) NOT NULL,
	"expires_at" timestamp (3) with time zone NOT NULL,
	"idle_at" timestamp (3) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"setting_key" varchar(80) PRIMARY KEY NOT NULL,
	"value_json" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"organization_id" varchar(36) NOT NULL,
	"email" varchar(254) NOT NULL,
	"password_hash" text NOT NULL,
	"mfa_cipher" text NOT NULL,
	"last_totp_step" integer DEFAULT 0 NOT NULL,
	"roles" jsonb NOT NULL,
	"suspended" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) with time zone NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_entities" ADD CONSTRAINT "content_entities_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_entities" ADD CONSTRAINT "content_entities_published_revision_id_content_revisions_id_fk" FOREIGN KEY ("published_revision_id") REFERENCES "public"."content_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_proposals" ADD CONSTRAINT "change_proposals_maker_id_users_id_fk" FOREIGN KEY ("maker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_entity_id_content_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."content_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_target" ON "audit_logs" USING btree ("target_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "kind_slug" ON "content_entities" USING btree ("kind","slug");--> statement-breakpoint
CREATE INDEX "published_lookup" ON "content_entities" USING btree ("kind","published_revision_id");--> statement-breakpoint
CREATE INDEX "owner_lookup" ON "content_entities" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "entity_revision" ON "content_revisions" USING btree ("entity_id","sequence");--> statement-breakpoint
CREATE INDEX "session_user" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expiry" ON "sessions" USING btree ("expires_at");