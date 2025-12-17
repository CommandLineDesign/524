CREATE TYPE "public"."artist_verification_status" AS ENUM('pending_review', 'in_review', 'verified', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."user_role_type" AS ENUM('customer', 'artist', 'admin', 'support');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"changes" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboarding_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"flow_id" varchar(100) DEFAULT 'default' NOT NULL,
	"flow_version" varchar(50) DEFAULT 'v1' NOT NULL,
	"variant_id" varchar(100) DEFAULT 'variant-a' NOT NULL,
	"step_key" varchar(100) NOT NULL,
	"response" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_completed_step" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role" "user_role_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_pk" PRIMARY KEY("user_id","role")
);
--> statement-breakpoint
ALTER TABLE "artist_profiles" ALTER COLUMN "verification_status" SET DEFAULT 'pending_review'::"public"."artist_verification_status";--> statement-breakpoint
ALTER TABLE "artist_profiles" ALTER COLUMN "verification_status" SET DATA TYPE "public"."artist_verification_status" USING "verification_status"::"public"."artist_verification_status";--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "booking_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "phone_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "artist_profiles" ADD COLUMN "reviewed_by" uuid;--> statement-breakpoint
ALTER TABLE "artist_profiles" ADD COLUMN "review_notes" text;--> statement-breakpoint
ALTER TABLE "artist_profiles" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "booking_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "token_version" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "session_version" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_responses" ADD CONSTRAINT "onboarding_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "onboarding_responses_user_flow_step_uidx" ON "onboarding_responses" USING btree ("user_id","flow_id","variant_id","step_key");--> statement-breakpoint
ALTER TABLE "artist_profiles" ADD CONSTRAINT "artist_profiles_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_banned_by_fk" FOREIGN KEY ("banned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversations_customer_id_idx" ON "conversations" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "conversations_artist_id_idx" ON "conversations" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "conversations_customer_artist_idx" ON "conversations" USING btree ("customer_id","artist_id");--> statement-breakpoint
CREATE INDEX "conversations_status_idx" ON "conversations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "conversations_last_message_at_idx" ON "conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "messages_conversation_sent_at_idx" ON "messages" USING btree ("conversation_id","sent_at");--> statement-breakpoint
CREATE INDEX "messages_sender_id_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_sent_at_idx" ON "messages" USING btree ("sent_at");--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_customer_artist_active_unique" UNIQUE("customer_id","artist_id","status");