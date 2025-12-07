import { and, asc, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import {
  type Conversation,
  type Message,
  bookings,
  conversations,
  messages,
  users,
} from '@524/database';
import type {
  AdminBookingDetail,
  AdminBookingListItem,
  BookedService,
  BookingStatusHistoryEntry,
} from '@524/shared/bookings';
import type { ChatMessage } from '@524/shared/messaging';

import { db } from '../db/client.js';

export interface AdminBookingListQuery {
  page: number;
  perPage: number;
  sortField?: 'createdAt' | 'scheduledDate' | 'bookingNumber';
  sortOrder?: 'ASC' | 'DESC';
  status?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

type BookingRow = typeof bookings.$inferSelect & {
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  artistName: string | null;
  artistEmail: string | null;
  artistPhone: string | null;
};

function mapStatusHistory(history: unknown): BookingStatusHistoryEntry[] {
  if (!Array.isArray(history)) return [];
  return history
    .map((entry) => {
      if (entry && typeof entry === 'object' && 'status' in entry && 'timestamp' in entry) {
        return {
          status: String((entry as { status: unknown }).status),
          timestamp: String((entry as { timestamp: unknown }).timestamp),
        };
      }
      return null;
    })
    .filter((entry): entry is BookingStatusHistoryEntry => Boolean(entry));
}

function mapServices(services: unknown): BookedService[] {
  if (!Array.isArray(services)) return [];
  return services as BookedService[];
}

function mapMessages(
  bookingId: string,
  conversation: Conversation | null,
  rows: Message[]
): ChatMessage[] {
  if (!conversation) return [];

  return rows.map((row) => ({
    id: row.id,
    bookingId,
    conversationId: conversation.id,
    senderId: row.senderId,
    senderRole: (row.senderRole as ChatMessage['senderRole']) ?? 'customer',
    messageType: (row.messageType as ChatMessage['messageType']) ?? 'text',
    content: row.content ?? '',
    images: (row.images as string[] | null) ?? undefined,
    sentAt: row.sentAt?.toISOString() ?? new Date().toISOString(),
  }));
}

function mapListRow(row: BookingRow): AdminBookingListItem {
  return {
    id: row.id,
    bookingNumber: row.bookingNumber,
    status: row.status,
    paymentStatus: row.paymentStatus,
    scheduledDate: row.scheduledDate.toISOString(),
    scheduledStartTime: row.scheduledStartTime.toISOString(),
    scheduledEndTime: row.scheduledEndTime.toISOString(),
    totalAmount: Number(row.totalAmount),
    customerId: row.customerId,
    customerName: row.customerName ?? '',
    artistId: row.artistId,
    artistName: row.artistName ?? '',
    createdAt: row.createdAt.toISOString(),
  };
}

function mapDetailRow(row: BookingRow, messagesList: ChatMessage[]): AdminBookingDetail {
  return {
    ...mapListRow(row),
    occasion: row.occasion,
    services: mapServices(row.services),
    statusHistory: mapStatusHistory(row.statusHistory),
    breakdown: (row.breakdown as Record<string, unknown> | null) ?? null,
    location: {
      serviceLocation: (row.serviceLocation as Record<string, unknown> | null) ?? null,
      address: (row.address as Record<string, unknown> | null) ?? null,
      locationType: row.locationType ?? null,
      notes: row.locationNotes ?? null,
    },
    customer: {
      id: row.customerId,
      name: row.customerName ?? '',
      email: row.customerEmail,
      phoneNumber: row.customerPhone,
    },
    artist: {
      id: row.artistId,
      name: row.artistName ?? '',
      email: row.artistEmail,
      phoneNumber: row.artistPhone,
    },
    messages: messagesList,
  };
}

export class AdminBookingRepository {
  async list(
    query: AdminBookingListQuery
  ): Promise<{ items: AdminBookingListItem[]; total: number }> {
    const offset = Math.max(query.page - 1, 0) * query.perPage;
    const customer = alias(users, 'customer_user');
    const artist = alias(users, 'artist_user');

    const conditions = [];
    if (query.status) {
      conditions.push(eq(bookings.status, query.status));
    }
    if (query.search) {
      const term = `%${query.search}%`;
      conditions.push(
        or(
          ilike(bookings.bookingNumber, term),
          ilike(customer.name, term),
          ilike(artist.name, term)
        )
      );
    }
    if (query.dateFrom) {
      conditions.push(gte(bookings.scheduledDate, query.dateFrom));
    }
    if (query.dateTo) {
      conditions.push(lte(bookings.scheduledDate, query.dateTo));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    let sortColumn = bookings.createdAt;
    if (query.sortField === 'scheduledDate') {
      sortColumn = bookings.scheduledDate;
    } else if (query.sortField === 'bookingNumber') {
      sortColumn = bookings.bookingNumber;
    }

    const sortDirection = query.sortOrder === 'ASC' ? asc(sortColumn) : desc(sortColumn);

    const rows = await db
      .select({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        scheduledDate: bookings.scheduledDate,
        scheduledStartTime: bookings.scheduledStartTime,
        scheduledEndTime: bookings.scheduledEndTime,
        totalAmount: bookings.totalAmount,
        customerId: bookings.customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phoneNumber,
        artistId: bookings.artistId,
        artistName: artist.name,
        artistEmail: artist.email,
        artistPhone: artist.phoneNumber,
        createdAt: bookings.createdAt,
        occasion: bookings.occasion,
        services: bookings.services,
        statusHistory: bookings.statusHistory,
        breakdown: bookings.breakdown,
        serviceLocation: bookings.serviceLocation,
        address: bookings.address,
        locationType: bookings.locationType,
        locationNotes: bookings.locationNotes,
      })
      .from(bookings)
      .leftJoin(customer, eq(bookings.customerId, customer.id))
      .leftJoin(artist, eq(bookings.artistId, artist.id))
      .where(whereClause ?? sql`true`)
      .orderBy(sortDirection)
      .limit(query.perPage)
      .offset(offset);

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .leftJoin(customer, eq(bookings.customerId, customer.id))
      .leftJoin(artist, eq(bookings.artistId, artist.id))
      .where(whereClause ?? sql`true`);

    return {
      items: rows.map(mapListRow),
      total: Number(countRow?.count ?? 0),
    };
  }

  async getDetail(bookingId: string): Promise<AdminBookingDetail | null> {
    const customer = alias(users, 'customer_user');
    const artist = alias(users, 'artist_user');

    const [row] = await db
      .select({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        scheduledDate: bookings.scheduledDate,
        scheduledStartTime: bookings.scheduledStartTime,
        scheduledEndTime: bookings.scheduledEndTime,
        totalAmount: bookings.totalAmount,
        customerId: bookings.customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phoneNumber,
        artistId: bookings.artistId,
        artistName: artist.name,
        artistEmail: artist.email,
        artistPhone: artist.phoneNumber,
        createdAt: bookings.createdAt,
        occasion: bookings.occasion,
        services: bookings.services,
        statusHistory: bookings.statusHistory,
        breakdown: bookings.breakdown,
        serviceLocation: bookings.serviceLocation,
        address: bookings.address,
        locationType: bookings.locationType,
        locationNotes: bookings.locationNotes,
      })
      .from(bookings)
      .leftJoin(customer, eq(bookings.customerId, customer.id))
      .leftJoin(artist, eq(bookings.artistId, artist.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!row) {
      return null;
    }

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.bookingId, bookingId))
      .limit(1);

    let messageRows: Message[] = [];
    if (conversation) {
      messageRows = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversation.id))
        .orderBy(asc(messages.sentAt))
        .limit(200);
    }

    const mappedMessages = mapMessages(bookingId, conversation ?? null, messageRows);

    return mapDetailRow(row, mappedMessages);
  }
}
