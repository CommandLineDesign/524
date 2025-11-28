CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" varchar(20),
	"sido" varchar(50) NOT NULL,
	"sigungu" varchar(50) NOT NULL,
	"dong" varchar(50) NOT NULL,
	"road_name" varchar(100),
	"building_number" varchar(50),
	"building_name" varchar(100),
	"detail_address" varchar(100),
	"postal_code" varchar(10) NOT NULL,
	"full_address_korean" varchar(255) NOT NULL,
	"location" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artist_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stage_name" varchar(100) NOT NULL,
	"bio" text,
	"specialties" jsonb,
	"years_experience" integer NOT NULL,
	"business_registration_number" varchar(20),
	"business_verified" boolean DEFAULT false,
	"licenses" jsonb,
	"certifications" jsonb,
	"service_radius_km" numeric(5, 2) NOT NULL,
	"primary_location" jsonb NOT NULL,
	"service_areas" jsonb,
	"working_hours" jsonb,
	"buffer_time_minutes" integer DEFAULT 30,
	"advance_booking_days" integer DEFAULT 14,
	"services" jsonb,
	"packages" jsonb,
	"travel_fee" numeric(10, 2),
	"portfolio_images" jsonb,
	"before_after_sets" jsonb,
	"featured_work" jsonb,
	"total_services" integer DEFAULT 0,
	"completed_services" integer DEFAULT 0,
	"cancelled_services" integer DEFAULT 0,
	"average_rating" numeric(3, 2),
	"total_reviews" integer DEFAULT 0,
	"response_time_minutes" integer,
	"on_time_completion_rate" numeric(5, 2),
	"background_check_completed" boolean DEFAULT false,
	"background_check_date" timestamp,
	"insurance_verified" boolean DEFAULT false,
	"insurance_expiry_date" timestamp,
	"bank_account" jsonb,
	"tax_id" text,
	"is_accepting_bookings" boolean DEFAULT true,
	"verification_status" varchar(20) DEFAULT 'pending',
	"account_status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"verified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_number" varchar(50) NOT NULL,
	"customer_id" uuid NOT NULL,
	"artist_id" uuid NOT NULL,
	"service_type" varchar(20) NOT NULL,
	"occasion" varchar(50) NOT NULL,
	"services" jsonb NOT NULL,
	"total_duration_minutes" integer NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"scheduled_start_time" timestamp NOT NULL,
	"scheduled_end_time" timestamp NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Seoul',
	"service_location" jsonb NOT NULL,
	"location_type" varchar(30) NOT NULL,
	"address" jsonb NOT NULL,
	"location_notes" text,
	"artist_arrived_at" timestamp,
	"service_started_at" timestamp,
	"service_completed_at" timestamp,
	"actual_duration_minutes" integer,
	"special_requests" text,
	"reference_images" jsonb,
	"status" varchar(30) NOT NULL,
	"status_history" jsonb,
	"payment_id" uuid,
	"payment_status" varchar(30) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"breakdown" jsonb,
	"protocol_checklist" jsonb,
	"time_limit_breached" boolean DEFAULT false,
	"completion_photo" text,
	"customer_rating" integer,
	"customer_review" text,
	"customer_review_date" timestamp,
	"artist_response" text,
	"artist_rating_for_customer" integer,
	"artist_notes" text,
	"cancelled_by" varchar(20),
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"cancellation_fee" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	CONSTRAINT "bookings_booking_number_unique" UNIQUE("booking_number")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid,
	"customer_id" uuid NOT NULL,
	"artist_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'active',
	"last_message_at" timestamp NOT NULL,
	"unread_count_customer" integer DEFAULT 0,
	"unread_count_artist" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"skin_type" varchar(20),
	"skin_tone" varchar(50),
	"hair_type" varchar(20),
	"hair_length" varchar(20),
	"allergies" jsonb,
	"sensitivities" jsonb,
	"medical_notes" text,
	"preferred_styles" jsonb,
	"favorite_artists" jsonb,
	"gender_preference" varchar(20),
	"primary_address" jsonb,
	"saved_addresses" jsonb,
	"total_bookings" integer DEFAULT 0,
	"completed_bookings" integer DEFAULT 0,
	"cancelled_bookings" integer DEFAULT 0,
	"average_rating_given" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"sender_role" varchar(20) NOT NULL,
	"message_type" varchar(20) DEFAULT 'text',
	"content" text,
	"images" jsonb,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"artist_id" uuid NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"platform_fee" numeric(10, 2) NOT NULL,
	"travel_fee" numeric(10, 2) DEFAULT '0',
	"tip_amount" numeric(10, 2) DEFAULT '0',
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'KRW',
	"payment_method" varchar(30) NOT NULL,
	"payment_provider" varchar(30) NOT NULL,
	"payment_provider_transaction_id" varchar(255),
	"card_last4" varchar(4),
	"card_brand" varchar(20),
	"status" varchar(30) NOT NULL,
	"status_history" jsonb,
	"authorized_at" timestamp,
	"captured_at" timestamp,
	"failed_at" timestamp,
	"refunded_at" timestamp,
	"refund_amount" numeric(10, 2),
	"refund_reason" text,
	"artist_payout_amount" numeric(10, 2) NOT NULL,
	"payout_status" varchar(20) DEFAULT 'pending',
	"payout_date" timestamp,
	"payout_transaction_id" varchar(255),
	"receipt_url" text,
	"tax_invoice_issued" boolean DEFAULT false,
	"tax_invoice_number" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"artist_id" uuid NOT NULL,
	"overall_rating" integer NOT NULL,
	"quality_rating" integer,
	"professionalism_rating" integer,
	"timeliness_rating" integer,
	"review_text" text,
	"review_images" jsonb,
	"artist_response" text,
	"is_visible" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firebase_uid" varchar(128),
	"kakao_id" varchar(128),
	"naver_id" varchar(128),
	"apple_id" varchar(128),
	"phone_number" varchar(20) NOT NULL,
	"phone_verified" boolean DEFAULT false,
	"email" varchar(255),
	"role" varchar(20) DEFAULT 'customer' NOT NULL,
	"name" varchar(100) NOT NULL,
	"profile_image_url" text,
	"birth_year" integer,
	"gender" varchar(10),
	"language" varchar(5) DEFAULT 'ko',
	"timezone" varchar(50) DEFAULT 'Asia/Seoul',
	"notification_preferences" jsonb,
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"deactivated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_firebase_uid_unique" UNIQUE("firebase_uid"),
	CONSTRAINT "users_kakao_id_unique" UNIQUE("kakao_id"),
	CONSTRAINT "users_naver_id_unique" UNIQUE("naver_id"),
	CONSTRAINT "users_apple_id_unique" UNIQUE("apple_id"),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_profiles" ADD CONSTRAINT "artist_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_artist_id_users_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_artist_id_users_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_artist_id_users_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_artist_id_users_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;