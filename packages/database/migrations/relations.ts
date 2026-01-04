import { relations } from "drizzle-orm/relations";
import { users, artistProfiles, bookings, addresses, customerProfiles, payments, auditLogs, conversations, messages, onboardingResponses, userRoles } from "./schema";

export const artistProfilesRelations = relations(artistProfiles, ({one}) => ({
	user_userId: one(users, {
		fields: [artistProfiles.userId],
		references: [users.id],
		relationName: "artistProfiles_userId_users_id"
	}),
	user_reviewedBy: one(users, {
		fields: [artistProfiles.reviewedBy],
		references: [users.id],
		relationName: "artistProfiles_reviewedBy_users_id"
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	artistProfiles_userId: many(artistProfiles, {
		relationName: "artistProfiles_userId_users_id"
	}),
	artistProfiles_reviewedBy: many(artistProfiles, {
		relationName: "artistProfiles_reviewedBy_users_id"
	}),
	bookings_customerId: many(bookings, {
		relationName: "bookings_customerId_users_id"
	}),
	bookings_artistId: many(bookings, {
		relationName: "bookings_artistId_users_id"
	}),
	bookings_completedBy: many(bookings, {
		relationName: "bookings_completedBy_users_id"
	}),
	addresses: many(addresses),
	user: one(users, {
		fields: [users.bannedBy],
		references: [users.id],
		relationName: "users_bannedBy_users_id"
	}),
	users: many(users, {
		relationName: "users_bannedBy_users_id"
	}),
	customerProfiles: many(customerProfiles),
	payments_customerId: many(payments, {
		relationName: "payments_customerId_users_id"
	}),
	payments_artistId: many(payments, {
		relationName: "payments_artistId_users_id"
	}),
	auditLogs: many(auditLogs),
	conversations_customerId: many(conversations, {
		relationName: "conversations_customerId_users_id"
	}),
	conversations_artistId: many(conversations, {
		relationName: "conversations_artistId_users_id"
	}),
	messages: many(messages),
	onboardingResponses: many(onboardingResponses),
	userRoles: many(userRoles),
}));

export const bookingsRelations = relations(bookings, ({one, many}) => ({
	user_customerId: one(users, {
		fields: [bookings.customerId],
		references: [users.id],
		relationName: "bookings_customerId_users_id"
	}),
	user_artistId: one(users, {
		fields: [bookings.artistId],
		references: [users.id],
		relationName: "bookings_artistId_users_id"
	}),
	user_completedBy: one(users, {
		fields: [bookings.completedBy],
		references: [users.id],
		relationName: "bookings_completedBy_users_id"
	}),
	payments: many(payments),
	conversations: many(conversations),
	messages: many(messages),
}));

export const addressesRelations = relations(addresses, ({one}) => ({
	user: one(users, {
		fields: [addresses.userId],
		references: [users.id]
	}),
}));

export const customerProfilesRelations = relations(customerProfiles, ({one}) => ({
	user: one(users, {
		fields: [customerProfiles.userId],
		references: [users.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	booking: one(bookings, {
		fields: [payments.bookingId],
		references: [bookings.id]
	}),
	user_customerId: one(users, {
		fields: [payments.customerId],
		references: [users.id],
		relationName: "payments_customerId_users_id"
	}),
	user_artistId: one(users, {
		fields: [payments.artistId],
		references: [users.id],
		relationName: "payments_artistId_users_id"
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.adminId],
		references: [users.id]
	}),
}));

export const conversationsRelations = relations(conversations, ({one, many}) => ({
	user_customerId: one(users, {
		fields: [conversations.customerId],
		references: [users.id],
		relationName: "conversations_customerId_users_id"
	}),
	user_artistId: one(users, {
		fields: [conversations.artistId],
		references: [users.id],
		relationName: "conversations_artistId_users_id"
	}),
	booking: one(bookings, {
		fields: [conversations.bookingId],
		references: [bookings.id]
	}),
	messages: many(messages),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
	user: one(users, {
		fields: [messages.senderId],
		references: [users.id]
	}),
	booking: one(bookings, {
		fields: [messages.bookingId],
		references: [bookings.id]
	}),
}));

export const onboardingResponsesRelations = relations(onboardingResponses, ({one}) => ({
	user: one(users, {
		fields: [onboardingResponses.userId],
		references: [users.id]
	}),
}));

export const userRolesRelations = relations(userRoles, ({one}) => ({
	user: one(users, {
		fields: [userRoles.userId],
		references: [users.id]
	}),
}));