CREATE TYPE "public"."device_platform" AS ENUM('ios', 'android', 'web');--> statement-breakpoint
CREATE TABLE "device_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(512) NOT NULL,
	"platform" "device_platform" NOT NULL,
	"device_id" varchar(255),
	"app_version" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_device_tokens_user_id" ON "device_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_device_tokens_token" ON "device_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_device_tokens_user_active" ON "device_tokens" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_device_tokens_platform" ON "device_tokens" USING btree ("platform");