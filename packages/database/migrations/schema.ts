import { pgTable, foreignKey, uuid, varchar, text, jsonb, integer, boolean, numeric, timestamp, unique, index, uniqueIndex, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const artistVerificationStatus = pgEnum("artist_verification_status", ['pending_review', 'in_review', 'verified', 'rejected', 'suspended'])
export const userRoleType = pgEnum("user_role_type", ['customer', 'artist', 'admin', 'support'])


export const artistProfiles = pgTable("artist_profiles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	stageName: varchar("stage_name", { length: 100 }).notNull(),
	bio: text(),
	specialties: jsonb(),
	yearsExperience: integer("years_experience").notNull(),
	businessRegistrationNumber: varchar("business_registration_number", { length: 20 }),
	businessVerified: boolean("business_verified").default(false),
	licenses: jsonb(),
	certifications: jsonb(),
	serviceRadiusKm: numeric("service_radius_km", { precision: 5, scale:  2 }).notNull(),
	primaryLocation: jsonb("primary_location").notNull(),
	serviceAreas: jsonb("service_areas"),
	workingHours: jsonb("working_hours"),
	bufferTimeMinutes: integer("buffer_time_minutes").default(30),
	advanceBookingDays: integer("advance_booking_days").default(14),
	services: jsonb(),
	packages: jsonb(),
	travelFee: numeric("travel_fee", { precision: 10, scale:  2 }),
	portfolioImages: jsonb("portfolio_images"),
	beforeAfterSets: jsonb("before_after_sets"),
	featuredWork: jsonb("featured_work"),
	totalServices: integer("total_services").default(0),
	completedServices: integer("completed_services").default(0),
	cancelledServices: integer("cancelled_services").default(0),
	averageRating: numeric("average_rating", { precision: 3, scale:  2 }),
	totalReviews: integer("total_reviews").default(0),
	responseTimeMinutes: integer("response_time_minutes"),
	onTimeCompletionRate: numeric("on_time_completion_rate", { precision: 5, scale:  2 }),
	backgroundCheckCompleted: boolean("background_check_completed").default(false),
	backgroundCheckDate: timestamp("background_check_date", { mode: 'string' }),
	insuranceVerified: boolean("insurance_verified").default(false),
	insuranceExpiryDate: timestamp("insurance_expiry_date", { mode: 'string' }),
	bankAccount: jsonb("bank_account"),
	taxId: text("tax_id"),
	isAcceptingBookings: boolean("is_accepting_bookings").default(true),
	verificationStatus: artistVerificationStatus("verification_status").default('pending_review'),
	accountStatus: varchar("account_status", { length: 20 }).default('active'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	reviewedBy: uuid("reviewed_by"),
	reviewNotes: text("review_notes"),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "artist_profiles_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.reviewedBy],
			foreignColumns: [users.id],
			name: "artist_profiles_reviewed_by_users_id_fk"
		}),
]);

export const bookings = pgTable("bookings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingNumber: varchar("booking_number", { length: 50 }).notNull(),
	customerId: uuid("customer_id").notNull(),
	artistId: uuid("artist_id").notNull(),
	serviceType: varchar("service_type", { length: 20 }).notNull(),
	occasion: varchar({ length: 50 }).notNull(),
	services: jsonb().notNull(),
	totalDurationMinutes: integer("total_duration_minutes").notNull(),
	scheduledDate: timestamp("scheduled_date", { mode: 'string' }).notNull(),
	scheduledStartTime: timestamp("scheduled_start_time", { mode: 'string' }).notNull(),
	scheduledEndTime: timestamp("scheduled_end_time", { mode: 'string' }).notNull(),
	timezone: varchar({ length: 50 }).default('Asia/Seoul'),
	serviceLocation: jsonb("service_location").notNull(),
	locationType: varchar("location_type", { length: 30 }).notNull(),
	address: jsonb().notNull(),
	locationNotes: text("location_notes"),
	artistArrivedAt: timestamp("artist_arrived_at", { mode: 'string' }),
	serviceStartedAt: timestamp("service_started_at", { mode: 'string' }),
	serviceCompletedAt: timestamp("service_completed_at", { mode: 'string' }),
	actualDurationMinutes: integer("actual_duration_minutes"),
	specialRequests: text("special_requests"),
	referenceImages: jsonb("reference_images"),
	status: varchar({ length: 30 }).notNull(),
	statusHistory: jsonb("status_history"),
	paymentId: uuid("payment_id"),
	paymentStatus: varchar("payment_status", { length: 30 }).notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	breakdown: jsonb(),
	protocolChecklist: jsonb("protocol_checklist"),
	timeLimitBreached: boolean("time_limit_breached").default(false),
	completionPhoto: text("completion_photo"),
	customerRating: integer("customer_rating"),
	customerReview: text("customer_review"),
	customerReviewDate: timestamp("customer_review_date", { mode: 'string' }),
	artistResponse: text("artist_response"),
	artistRatingForCustomer: integer("artist_rating_for_customer"),
	artistNotes: text("artist_notes"),
	cancelledBy: varchar("cancelled_by", { length: 20 }),
	cancelledAt: timestamp("cancelled_at", { mode: 'string' }),
	cancellationReason: text("cancellation_reason"),
	cancellationFee: numeric("cancellation_fee", { precision: 10, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	confirmedAt: timestamp("confirmed_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	completedBy: uuid("completed_by"),
}, (table) => [
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [users.id],
			name: "bookings_customer_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.artistId],
			foreignColumns: [users.id],
			name: "bookings_artist_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.completedBy],
			foreignColumns: [users.id],
			name: "bookings_completed_by_users_id_fk"
		}),
	unique("bookings_booking_number_unique").on(table.bookingNumber),
]);

export const addresses = pgTable("addresses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	label: varchar({ length: 20 }),
	sido: varchar({ length: 50 }).notNull(),
	sigungu: varchar({ length: 50 }).notNull(),
	dong: varchar({ length: 50 }).notNull(),
	roadName: varchar("road_name", { length: 100 }),
	buildingNumber: varchar("building_number", { length: 50 }),
	buildingName: varchar("building_name", { length: 100 }),
	detailAddress: varchar("detail_address", { length: 100 }),
	postalCode: varchar("postal_code", { length: 10 }).notNull(),
	fullAddressKorean: varchar("full_address_korean", { length: 255 }).notNull(),
	location: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "addresses_user_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firebaseUid: varchar("firebase_uid", { length: 128 }),
	kakaoId: varchar("kakao_id", { length: 128 }),
	naverId: varchar("naver_id", { length: 128 }),
	appleId: varchar("apple_id", { length: 128 }),
	phoneNumber: varchar("phone_number", { length: 20 }),
	phoneVerified: boolean("phone_verified").default(false),
	email: varchar({ length: 255 }),
	role: varchar({ length: 20 }).default('customer').notNull(),
	name: varchar({ length: 100 }).notNull(),
	profileImageUrl: text("profile_image_url"),
	birthYear: integer("birth_year"),
	gender: varchar({ length: 10 }),
	language: varchar({ length: 5 }).default('ko'),
	timezone: varchar({ length: 50 }).default('Asia/Seoul'),
	notificationPreferences: jsonb("notification_preferences"),
	isActive: boolean("is_active").default(true),
	isVerified: boolean("is_verified").default(false),
	deactivatedAt: timestamp("deactivated_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	passwordHash: varchar("password_hash", { length: 255 }),
	isBanned: boolean("is_banned").default(false),
	banReason: text("ban_reason"),
	bannedAt: timestamp("banned_at", { mode: 'string' }),
	bannedBy: uuid("banned_by"),
	tokenVersion: integer("token_version").default(1),
	sessionVersion: integer("session_version").default(1),
	onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bannedBy],
			foreignColumns: [table.id],
			name: "users_banned_by_fk"
		}),
	unique("users_firebase_uid_unique").on(table.firebaseUid),
	unique("users_kakao_id_unique").on(table.kakaoId),
	unique("users_naver_id_unique").on(table.naverId),
	unique("users_apple_id_unique").on(table.appleId),
	unique("users_phone_number_unique").on(table.phoneNumber),
	unique("users_email_unique").on(table.email),
]);

export const customerProfiles = pgTable("customer_profiles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	skinType: varchar("skin_type", { length: 20 }),
	skinTone: varchar("skin_tone", { length: 50 }),
	hairType: varchar("hair_type", { length: 20 }),
	hairLength: varchar("hair_length", { length: 20 }),
	allergies: jsonb(),
	sensitivities: jsonb(),
	medicalNotes: text("medical_notes"),
	preferredStyles: jsonb("preferred_styles"),
	favoriteArtists: jsonb("favorite_artists"),
	genderPreference: varchar("gender_preference", { length: 20 }),
	primaryAddress: jsonb("primary_address"),
	savedAddresses: jsonb("saved_addresses"),
	totalBookings: integer("total_bookings").default(0),
	completedBookings: integer("completed_bookings").default(0),
	cancelledBookings: integer("cancelled_bookings").default(0),
	averageRatingGiven: integer("average_rating_given"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "customer_profiles_user_id_users_id_fk"
		}),
]);

export const reviews = pgTable("reviews", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingId: uuid("booking_id").notNull(),
	customerId: uuid("customer_id").notNull(),
	artistId: uuid("artist_id").notNull(),
	overallRating: integer("overall_rating").notNull(),
	qualityRating: integer("quality_rating").notNull(),
	professionalismRating: integer("professionalism_rating").notNull(),
	timelinessRating: integer("timeliness_rating").notNull(),
	reviewText: text("review_text"),
	reviewImages: jsonb("review_images"),
	artistResponse: text("artist_response"),
	isVisible: boolean("is_visible").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingId: uuid("booking_id").notNull(),
	customerId: uuid("customer_id").notNull(),
	artistId: uuid("artist_id").notNull(),
	subtotal: numeric({ precision: 10, scale:  2 }).notNull(),
	platformFee: numeric("platform_fee", { precision: 10, scale:  2 }).notNull(),
	travelFee: numeric("travel_fee", { precision: 10, scale:  2 }).default('0'),
	tipAmount: numeric("tip_amount", { precision: 10, scale:  2 }).default('0'),
	discountAmount: numeric("discount_amount", { precision: 10, scale:  2 }).default('0'),
	taxAmount: numeric("tax_amount", { precision: 10, scale:  2 }).default('0'),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	currency: varchar({ length: 3 }).default('KRW'),
	paymentMethod: varchar("payment_method", { length: 30 }).notNull(),
	paymentProvider: varchar("payment_provider", { length: 30 }).notNull(),
	paymentProviderTransactionId: varchar("payment_provider_transaction_id", { length: 255 }),
	cardLast4: varchar("card_last4", { length: 4 }),
	cardBrand: varchar("card_brand", { length: 20 }),
	status: varchar({ length: 30 }).notNull(),
	statusHistory: jsonb("status_history"),
	authorizedAt: timestamp("authorized_at", { mode: 'string' }),
	capturedAt: timestamp("captured_at", { mode: 'string' }),
	failedAt: timestamp("failed_at", { mode: 'string' }),
	refundedAt: timestamp("refunded_at", { mode: 'string' }),
	refundAmount: numeric("refund_amount", { precision: 10, scale:  2 }),
	refundReason: text("refund_reason"),
	artistPayoutAmount: numeric("artist_payout_amount", { precision: 10, scale:  2 }).notNull(),
	payoutStatus: varchar("payout_status", { length: 20 }).default('pending'),
	payoutDate: timestamp("payout_date", { mode: 'string' }),
	payoutTransactionId: varchar("payout_transaction_id", { length: 255 }),
	receiptUrl: text("receipt_url"),
	taxInvoiceIssued: boolean("tax_invoice_issued").default(false),
	taxInvoiceNumber: varchar("tax_invoice_number", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "payments_booking_id_bookings_id_fk"
		}),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [users.id],
			name: "payments_customer_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.artistId],
			foreignColumns: [users.id],
			name: "payments_artist_id_users_id_fk"
		}),
]);

export const auditLogs = pgTable("audit_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	adminId: uuid("admin_id").notNull(),
	entityType: varchar("entity_type", { length: 50 }).notNull(),
	entityId: uuid("entity_id").notNull(),
	action: varchar({ length: 50 }).notNull(),
	changes: jsonb(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [users.id],
			name: "audit_logs_admin_id_users_id_fk"
		}),
]);

export const conversations = pgTable("conversations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingId: uuid("booking_id").notNull(),
	customerId: uuid("customer_id").notNull(),
	artistId: uuid("artist_id").notNull(),
	status: varchar({ length: 20 }).default('active'),
	lastMessageAt: timestamp("last_message_at", { mode: 'string' }).notNull(),
	unreadCountCustomer: integer("unread_count_customer").default(0),
	unreadCountArtist: integer("unread_count_artist").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	archivedAt: timestamp("archived_at", { mode: 'string' }),
}, (table) => [
	index("conversations_artist_id_idx").using("btree", table.artistId.asc().nullsLast().op("uuid_ops")),
	index("conversations_customer_artist_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops"), table.artistId.asc().nullsLast().op("uuid_ops")),
	index("conversations_customer_id_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	index("conversations_last_message_at_idx").using("btree", table.lastMessageAt.asc().nullsLast().op("timestamp_ops")),
	index("conversations_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [users.id],
			name: "conversations_customer_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.artistId],
			foreignColumns: [users.id],
			name: "conversations_artist_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "conversations_booking_id_bookings_id_fk"
		}),
	unique("conversations_customer_artist_active_unique").on(table.customerId, table.artistId, table.status),
]);

export const messages = pgTable("messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	conversationId: uuid("conversation_id").notNull(),
	senderId: uuid("sender_id").notNull(),
	senderRole: varchar("sender_role", { length: 20 }).notNull(),
	messageType: varchar("message_type", { length: 20 }).default('text'),
	content: text(),
	images: jsonb(),
	sentAt: timestamp("sent_at", { mode: 'string' }).defaultNow().notNull(),
	readAt: timestamp("read_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	bookingId: uuid("booking_id"),
}, (table) => [
	index("messages_conversation_sent_at_idx").using("btree", table.conversationId.asc().nullsLast().op("uuid_ops"), table.sentAt.asc().nullsLast().op("timestamp_ops")),
	index("messages_sender_id_idx").using("btree", table.senderId.asc().nullsLast().op("uuid_ops")),
	index("messages_sent_at_idx").using("btree", table.sentAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.id],
			name: "messages_conversation_id_conversations_id_fk"
		}),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "messages_sender_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "messages_booking_id_bookings_id_fk"
		}),
]);

export const onboardingResponses = pgTable("onboarding_responses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	flowId: varchar("flow_id", { length: 100 }).default('default').notNull(),
	flowVersion: varchar("flow_version", { length: 50 }).default('v1').notNull(),
	variantId: varchar("variant_id", { length: 100 }).default('variant-a').notNull(),
	stepKey: varchar("step_key", { length: 100 }).notNull(),
	response: jsonb().notNull(),
	version: integer().default(1).notNull(),
	isCompletedStep: boolean("is_completed_step").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("onboarding_responses_user_flow_step_uidx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.flowId.asc().nullsLast().op("text_ops"), table.variantId.asc().nullsLast().op("text_ops"), table.stepKey.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "onboarding_responses_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const refreshTokens = pgTable("refresh_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	tokenHash: varchar("token_hash", { length: 255 }).notNull(),
	familyId: uuid("family_id").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	revokedAt: timestamp("revoked_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_refresh_tokens_expires_at").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_refresh_tokens_family_id").using("btree", table.familyId.asc().nullsLast().op("uuid_ops")),
	index("idx_refresh_tokens_token_hash").using("btree", table.tokenHash.asc().nullsLast().op("text_ops")),
	index("idx_refresh_tokens_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
]);

export const reviewImages = pgTable("review_images", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	reviewId: uuid("review_id").notNull(),
	s3Key: text("s3_key").notNull(),
	fileSize: integer("file_size").notNull(),
	mimeType: text("mime_type").notNull(),
	displayOrder: integer("display_order").notNull(),
	publicUrl: text("public_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const userRoles = pgTable("user_roles", {
	userId: uuid("user_id").notNull(),
	role: userRoleType().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_roles_user_id_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.role], name: "user_roles_pk"}),
]);
