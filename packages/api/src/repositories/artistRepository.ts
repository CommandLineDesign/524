import { and, asc, desc, eq, sql } from 'drizzle-orm';

import { artistProfiles, users } from '@524/database';
import type { PendingArtistDetail } from '@524/shared/admin';
import type { ArtistProfile } from '@524/shared/artists';

import { db } from '../db/client.js';

type ArtistProfileRow = typeof artistProfiles.$inferSelect;
type PendingArtistRow = {
  id: string;
  userId: string;
  stageName: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  signupDate: Date | string;
  verificationStatus: ArtistProfile['verificationStatus'];
  bio: string | null;
  specialties: unknown;
};

export interface PendingArtistQuery {
  page: number;
  perPage: number;
  sortField?: 'signupDate';
  sortOrder?: 'ASC' | 'DESC';
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  return fallback;
}

function mapRowToProfile(row: ArtistProfileRow): ArtistProfile {
  return {
    id: row.id,
    userId: row.userId,
    stageName: row.stageName,
    bio: row.bio ?? '',
    specialties: (row.specialties as string[] | null) ?? [],
    yearsExperience: row.yearsExperience,
    businessVerified: row.businessVerified ?? false,
    serviceRadiusKm: toNumber(row.serviceRadiusKm, 0),
    primaryLocation: (row.primaryLocation as ArtistProfile['primaryLocation']) ?? {
      latitude: 0,
      longitude: 0,
    },
    isAcceptingBookings: row.isAcceptingBookings ?? true,
    verificationStatus:
      (row.verificationStatus as ArtistProfile['verificationStatus']) ?? 'pending',
    averageRating: toNumber(row.averageRating, 0),
    totalReviews: row.totalReviews ?? 0,
    totalServices: row.totalServices ?? 0,
  };
}

function mapPendingRow(row: PendingArtistRow): PendingArtistDetail {
  const specialties =
    Array.isArray(row.specialties) && row.specialties.every((item) => typeof item === 'string')
      ? row.specialties
      : null;

  return {
    id: row.id,
    userId: row.userId,
    stageName: row.stageName,
    name: row.name && row.name.length > 0 ? row.name : row.stageName,
    email: row.email,
    phoneNumber: row.phoneNumber ?? '',
    signupDate:
      row.signupDate instanceof Date
        ? row.signupDate.toISOString()
        : new Date(row.signupDate).toISOString(),
    verificationStatus: row.verificationStatus ?? 'pending',
    bio: row.bio,
    specialties,
  };
}

export class ArtistRepository {
  async findById(artistId: string): Promise<ArtistProfile | null> {
    const [record] = await db
      .select()
      .from(artistProfiles)
      .where(eq(artistProfiles.id, artistId))
      .limit(1);
    return record ? mapRowToProfile(record) : null;
  }

  async update(artistId: string, updates: Partial<ArtistProfile>): Promise<ArtistProfile> {
    const [updated] = await db
      .update(artistProfiles)
      .set({
        stageName: updates.stageName,
        bio: updates.bio,
        specialties: updates.specialties,
        yearsExperience: updates.yearsExperience,
        businessVerified: updates.businessVerified,
        serviceRadiusKm: updates.serviceRadiusKm?.toString(),
        primaryLocation: updates.primaryLocation,
        isAcceptingBookings: updates.isAcceptingBookings,
        verificationStatus: updates.verificationStatus,
        averageRating: updates.averageRating?.toString(),
        totalReviews: updates.totalReviews,
        totalServices: updates.totalServices,
      })
      .where(eq(artistProfiles.id, artistId))
      .returning();

    if (!updated) {
      throw Object.assign(new Error('Artist not found'), { status: 404 });
    }

    return mapRowToProfile(updated);
  }

  async findPending({ page, perPage, sortField: _sortField, sortOrder }: PendingArtistQuery) {
    const offset = Math.max(page - 1, 0) * perPage;
    const sortColumn = artistProfiles.createdAt;
    const sortDirection = (sortOrder ?? 'DESC') === 'ASC' ? asc(sortColumn) : desc(sortColumn);

    const rows = await db
      .select({
        id: artistProfiles.id,
        userId: artistProfiles.userId,
        stageName: artistProfiles.stageName,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        signupDate: artistProfiles.createdAt,
        verificationStatus: artistProfiles.verificationStatus,
        bio: artistProfiles.bio,
        specialties: artistProfiles.specialties,
      })
      .from(artistProfiles)
      .leftJoin(users, eq(users.id, artistProfiles.userId))
      .where(eq(artistProfiles.verificationStatus, 'pending'))
      .orderBy(sortDirection)
      .limit(perPage)
      .offset(offset);

    const [countRow] =
      (await db
        .select({ count: sql<number>`count(*)` })
        .from(artistProfiles)
        .where(eq(artistProfiles.verificationStatus, 'pending'))) ?? [];

    const total = countRow?.count ?? 0;

    return {
      items: rows.map((row) => mapPendingRow(row as PendingArtistRow)),
      total: Number(total),
    };
  }

  async findPendingById(artistId: string): Promise<PendingArtistDetail | null> {
    const [row] = await db
      .select({
        id: artistProfiles.id,
        userId: artistProfiles.userId,
        stageName: artistProfiles.stageName,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        signupDate: artistProfiles.createdAt,
        verificationStatus: artistProfiles.verificationStatus,
        bio: artistProfiles.bio,
        specialties: artistProfiles.specialties,
      })
      .from(artistProfiles)
      .leftJoin(users, eq(users.id, artistProfiles.userId))
      .where(and(eq(artistProfiles.id, artistId), eq(artistProfiles.verificationStatus, 'pending')))
      .limit(1);

    if (!row) {
      return null;
    }

    return mapPendingRow(row as PendingArtistRow);
  }
}
