CREATE TABLE `redirects` (
	`from_path` varchar(220) NOT NULL,
	`to_path` varchar(220) NOT NULL,
	`created_at` datetime(3) NOT NULL,
	CONSTRAINT `redirects_from_path` PRIMARY KEY(`from_path`)
);
--> statement-breakpoint
ALTER TABLE `organizations` ADD `organization_type` varchar(20) DEFAULT 'partner' NOT NULL;