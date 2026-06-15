CREATE TABLE `ai_generations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_token` text,
	`type` text NOT NULL,
	`input_prompt` text,
	`output` text NOT NULL,
	`model` text,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `divar_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone` text NOT NULL,
	`access_token` text NOT NULL,
	`front_token` text,
	`did` text,
	`csid` text,
	`expires_at` integer NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `post_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_token` text NOT NULL,
	`brand_token` text NOT NULL,
	`impressions` integer DEFAULT 0,
	`views` integer DEFAULT 0,
	`contacts` integer DEFAULT 0,
	`bookmarks` integer DEFAULT 0,
	`chats` integer DEFAULT 0,
	`position` integer,
	`category` text,
	`city` text,
	`fetched_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `posts_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer,
	`post_token` text NOT NULL,
	`manage_token` text,
	`brand_token` text,
	`title` text,
	`price_text` text,
	`status` text,
	`label_color` text,
	`image_url` text,
	`image_count` integer DEFAULT 0,
	`location` text,
	`published_at` text,
	`expires_at` text,
	`raw_json` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`session_id`) REFERENCES `divar_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
