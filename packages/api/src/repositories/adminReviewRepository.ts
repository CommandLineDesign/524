import { type SQL, and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { type Review, reviews, users } from '@524/database';

import { db } from '../db/client.js';

export interface AdminReviewListQuery {
  limit: number;
  offset: number;
  sortField: 'createdAt' | 'overallRating' | 'customerId' | 'artistId';
  sortOrder: 'ASC' | 'DESC';
  search?: string;
  isVisible?: boolean;
}

type ReviewRow = {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string | null;
  customerEmail: string | null;
  artistId: string;
  artistName: string | null;
  artistEmail: string | null;
  overallRating: number;
  qualityRating: number;
  professionalismRating: number;
  timelinessRating: number;
  reviewText: string | null;
  artistResponse: string | null;
  isVisible: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapReviewRow(row: ReviewRow): Review & {
  customerName?: string;
  customerEmail?: string;
  artistName?: string;
  artistEmail?: string;
} {
  return {
    id: row.id,
    bookingId: row.bookingId,
    customerId: row.customerId,
    artistId: row.artistId,
    overallRating: row.overallRating,
    qualityRating: row.qualityRating,
    professionalismRating: row.professionalismRating,
    timelinessRating: row.timelinessRating,
    reviewText: row.reviewText,
    reviewImages: null, // This will be populated separately if needed
    artistResponse: row.artistResponse,
    isVisible: row.isVisible === null ? true : row.isVisible,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    customerName: row.customerName ?? undefined,
    customerEmail: row.customerEmail ?? undefined,
    artistName: row.artistName ?? undefined,
    artistEmail: row.artistEmail ?? undefined,
  };
}

export class AdminReviewRepository {
  async getAllReviewsCount(
    filters: { search?: string; isVisible?: boolean } = {}
  ): Promise<number> {
    const conditions = [];

    if (filters.isVisible !== undefined) {
      conditions.push(eq(reviews.isVisible, filters.isVisible));
    }

    if (filters.search) {
      // Simple search on review text for now - could be expanded to search customer/artist names
      conditions.push(sql`${reviews.reviewText} ILIKE ${`%${filters.search}%`}`);
    }

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.count ?? 0;
  }

  async getAllReviews(params: AdminReviewListQuery): Promise<
    Array<
      Review & {
        customerName?: string;
        customerEmail?: string;
        artistName?: string;
        artistEmail?: string;
      }
    >
  > {
    const conditions = [];

    if (params.isVisible !== undefined) {
      conditions.push(eq(reviews.isVisible, params.isVisible));
    }

    if (params.search) {
      // Simple search on review text for now - could be expanded to search customer/artist names
      conditions.push(sql`${reviews.reviewText} ILIKE ${`%${params.search}%`}`);
    }

    const customer = alias(users, 'customer_user');
    const artist = alias(users, 'artist_user');

    let orderBy: SQL;
    switch (params.sortField) {
      case 'createdAt':
        orderBy = params.sortOrder === 'DESC' ? desc(reviews.createdAt) : asc(reviews.createdAt);
        break;
      case 'overallRating':
        orderBy =
          params.sortOrder === 'DESC' ? desc(reviews.overallRating) : asc(reviews.overallRating);
        break;
      case 'customerId':
        orderBy = params.sortOrder === 'DESC' ? desc(reviews.customerId) : asc(reviews.customerId);
        break;
      case 'artistId':
        orderBy = params.sortOrder === 'DESC' ? desc(reviews.artistId) : asc(reviews.artistId);
        break;
      default:
        orderBy = desc(reviews.createdAt);
    }

    const rows = await db
      .select({
        id: reviews.id,
        bookingId: reviews.bookingId,
        customerId: reviews.customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        artistId: reviews.artistId,
        artistName: artist.name,
        artistEmail: artist.email,
        overallRating: reviews.overallRating,
        qualityRating: reviews.qualityRating,
        professionalismRating: reviews.professionalismRating,
        timelinessRating: reviews.timelinessRating,
        reviewText: reviews.reviewText,
        artistResponse: reviews.artistResponse,
        isVisible: reviews.isVisible,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
      })
      .from(reviews)
      .leftJoin(customer, eq(reviews.customerId, customer.id))
      .leftJoin(artist, eq(reviews.artistId, artist.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(params.limit)
      .offset(params.offset);

    return rows.map(mapReviewRow);
  }

  async getReviewById(id: string): Promise<
    | (Review & {
        customerName?: string;
        customerEmail?: string;
        artistName?: string;
        artistEmail?: string;
      })
    | null
  > {
    const customer = alias(users, 'customer_user');
    const artist = alias(users, 'artist_user');

    const [row] = await db
      .select({
        id: reviews.id,
        bookingId: reviews.bookingId,
        customerId: reviews.customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        artistId: reviews.artistId,
        artistName: artist.name,
        artistEmail: artist.email,
        overallRating: reviews.overallRating,
        qualityRating: reviews.qualityRating,
        professionalismRating: reviews.professionalismRating,
        timelinessRating: reviews.timelinessRating,
        reviewText: reviews.reviewText,
        artistResponse: reviews.artistResponse,
        isVisible: reviews.isVisible,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
      })
      .from(reviews)
      .leftJoin(customer, eq(reviews.customerId, customer.id))
      .leftJoin(artist, eq(reviews.artistId, artist.id))
      .where(eq(reviews.id, id))
      .limit(1);

    return row ? mapReviewRow(row) : null;
  }
}
