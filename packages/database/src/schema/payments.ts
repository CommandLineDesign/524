import { boolean, jsonb, numeric, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { bookings } from './bookings';
import { users } from './users';

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id).notNull(),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  artistId: uuid('artist_id').references(() => users.id).notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  platformFee: numeric('platform_fee', { precision: 10, scale: 2 }).notNull(),
  travelFee: numeric('travel_fee', { precision: 10, scale: 2 }).default('0'),
  tipAmount: numeric('tip_amount', { precision: 10, scale: 2 }).default('0'),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0'),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('KRW'),
  paymentMethod: varchar('payment_method', { length: 30 }).notNull(),
  paymentProvider: varchar('payment_provider', { length: 30 }).notNull(),
  paymentProviderTransactionId: varchar('payment_provider_transaction_id', { length: 255 }),
  cardLast4: varchar('card_last4', { length: 4 }),
  cardBrand: varchar('card_brand', { length: 20 }),
  status: varchar('status', { length: 30 }).notNull(),
  statusHistory: jsonb('status_history'),
  authorizedAt: timestamp('authorized_at'),
  capturedAt: timestamp('captured_at'),
  failedAt: timestamp('failed_at'),
  refundedAt: timestamp('refunded_at'),
  refundAmount: numeric('refund_amount', { precision: 10, scale: 2 }),
  refundReason: text('refund_reason'),
  artistPayoutAmount: numeric('artist_payout_amount', { precision: 10, scale: 2 }).notNull(),
  payoutStatus: varchar('payout_status', { length: 20 }).default('pending'),
  payoutDate: timestamp('payout_date'),
  payoutTransactionId: varchar('payout_transaction_id', { length: 255 }),
  receiptUrl: text('receipt_url'),
  taxInvoiceIssued: boolean('tax_invoice_issued').default(false),
  taxInvoiceNumber: varchar('tax_invoice_number', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export type Payment = typeof payments.$inferSelect;

