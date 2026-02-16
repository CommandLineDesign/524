CREATE TABLE "artist_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artist_id" uuid NOT NULL,
	"week_id" varchar(8) NOT NULL,
	"slots" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "artist_availability_artist_week_unique" UNIQUE("artist_id","week_id")
);
--> statement-breakpoint
ALTER TABLE "artist_availability" ADD CONSTRAINT "artist_availability_artist_id_artist_profiles_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artist_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_artist_availability_artist_id" ON "artist_availability" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "idx_artist_availability_week_id" ON "artist_availability" USING btree ("week_id");