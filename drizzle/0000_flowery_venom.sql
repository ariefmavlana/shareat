CREATE TABLE `assets` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`storage_key` varchar(100) NOT NULL,
	`mime` varchar(80) NOT NULL,
	`bytes` int NOT NULL,
	`sha256` varchar(64) NOT NULL,
	`width` int,
	`height` int,
	`scan_status` varchar(20) NOT NULL,
	`rights_status` varchar(20) NOT NULL DEFAULT 'pending',
	`rights_reason` text,
	`uploaded_by` varchar(36) NOT NULL,
	`approved_by` varchar(36),
	`created_at` datetime(3) NOT NULL,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `assets_storage_key_unique` UNIQUE(`storage_key`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` varchar(36) NOT NULL,
	`actor_id` varchar(36),
	`action` varchar(100) NOT NULL,
	`target_id` varchar(100) NOT NULL,
	`request_id` varchar(36) NOT NULL,
	`reason` text,
	`safe_change` json NOT NULL,
	`created_at` datetime(3) NOT NULL,
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_entities` (
	`id` varchar(36) NOT NULL,
	`kind` varchar(20) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`published_revision_id` varchar(36),
	`ever_published` boolean NOT NULL DEFAULT false,
	`archived` boolean NOT NULL DEFAULT false,
	CONSTRAINT `content_entities_id` PRIMARY KEY(`id`),
	CONSTRAINT `kind_slug` UNIQUE(`kind`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` varchar(36) NOT NULL,
	`name` varchar(140) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`verified` boolean NOT NULL DEFAULT false,
	`suspended` boolean NOT NULL DEFAULT false,
	`evidence` text,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `outbox_jobs` (
	`id` varchar(36) NOT NULL,
	`type` varchar(40) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`available_at` datetime(3) NOT NULL,
	`lease_until` datetime(3),
	`lease_owner` varchar(36),
	CONSTRAINT `outbox_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `change_proposals` (
	`id` varchar(36) NOT NULL,
	`kind` varchar(40) NOT NULL,
	`maker_id` varchar(36) NOT NULL,
	`payload` json NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`checker_id` varchar(36),
	`created_at` datetime(3) NOT NULL,
	CONSTRAINT `change_proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rate_limit_buckets` (
	`key_hash` varchar(64) NOT NULL,
	`count` int NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	CONSTRAINT `rate_limit_buckets_key_hash` PRIMARY KEY(`key_hash`)
);
--> statement-breakpoint
CREATE TABLE `content_revisions` (
	`id` varchar(36) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`sequence` int NOT NULL,
	`body_json` json NOT NULL,
	`status` varchar(25) NOT NULL,
	`author_id` varchar(36) NOT NULL,
	`reviewer_id` varchar(36),
	`checklist` json,
	`created_at` datetime(3) NOT NULL,
	CONSTRAINT `content_revisions_id` PRIMARY KEY(`id`),
	CONSTRAINT `entity_revision` UNIQUE(`entity_id`,`sequence`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` varchar(64) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`csrf_hash` varchar(64) NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`idle_at` datetime(3) NOT NULL,
	CONSTRAINT `sessions_token_hash` PRIMARY KEY(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`setting_key` varchar(80) NOT NULL,
	`value_json` json NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	CONSTRAINT `settings_setting_key` PRIMARY KEY(`setting_key`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`email` varchar(254) NOT NULL,
	`password_hash` text NOT NULL,
	`mfa_cipher` text NOT NULL,
	`last_totp_step` int NOT NULL DEFAULT 0,
	`roles` json NOT NULL,
	`suspended` boolean NOT NULL DEFAULT false,
	`created_at` datetime(3) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_uploaded_by_users_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_entities` ADD CONSTRAINT `content_entities_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `change_proposals` ADD CONSTRAINT `change_proposals_maker_id_users_id_fk` FOREIGN KEY (`maker_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_revisions` ADD CONSTRAINT `content_revisions_entity_id_content_entities_id_fk` FOREIGN KEY (`entity_id`) REFERENCES `content_entities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_revisions` ADD CONSTRAINT `content_revisions_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_revisions` ADD CONSTRAINT `content_revisions_reviewer_id_users_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_target` ON `audit_logs` (`target_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `published_lookup` ON `content_entities` (`kind`,`published_revision_id`);--> statement-breakpoint
CREATE INDEX `owner_lookup` ON `content_entities` (`organization_id`);--> statement-breakpoint
CREATE INDEX `session_user` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_expiry` ON `sessions` (`expires_at`);