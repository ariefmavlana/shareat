CREATE TABLE `auth_challenges` (
	`id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`kind` varchar(20) NOT NULL,
	`payload` json NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`consumed` boolean NOT NULL DEFAULT false,
	CONSTRAINT `auth_challenges_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_challenges_token_hash_unique` UNIQUE(`token_hash`)
);
