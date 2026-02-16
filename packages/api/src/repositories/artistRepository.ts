import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

import { artistProfiles, users } from '@524/database';
import type { ArtistDetail, ArtistListItem, PendingArtistDetail } from '@524/shared/admin';
import type { ArtistProfile } from '@524/shared/artists';

import { db } from '../db/client.js';

type ArtistProfileRow = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  stageName: string;
  bio: string | null;
  specialties: unknown;
  yearsExperience: number;
  businessRegistrationNumber: string | null;
  businessVerified: boolean | null;
  serviceRadiusKm: string;
  primaryLocation: unknown;
  isAcceptingBookings: boolean | null;
  verificationStatus: string | null;
  averageRating: string | null;
  totalReviews: number | null;
  totalServices: number | null;
  portfolioImages: unknown | null;
  services: unknown | null;
  profileImageUrl?: string | null;
  verifiedAt: Date | null;
};
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
  portfolioImages: unknown;
  services: unknown;
  yearsExperience: number | null;
};

type ArtistAdminRow = {
  id: string;
  userId: string;
  stageName: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  verificationStatus: ArtistProfile['verificationStatus'];
  isAcceptingBookings: boolean | null;
  averageRating: string | null;
  totalReviews: number | null;
  totalServices: number | null;
  createdAt: Date;
  verifiedAt: Date | null;
};

type ArtistDetailRow = ArtistAdminRow & {
  bio: string | null;
  specialties: unknown;
  yearsExperience: number;
  businessVerified: boolean | null;
  businessRegistrationNumber: string | null;
  serviceRadiusKm: string;
  primaryLocation: unknown;
  portfolioImages: unknown;
  services: unknown;
  completedServices: number | null;
  cancelledServices: number | null;
  profileImageUrl: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  reviewedAt: Date | null;
};

export type ArtistProfileUpdateInput = Partial<
  Pick<
    ArtistProfile,
    | 'stageName'
    | 'bio'
    | 'specialties'
    | 'yearsExperience'
    | 'businessRegistrationNumber'
    | 'serviceRadiusKm'
    | 'primaryLocation'
    | 'isAcceptingBookings'
    | 'portfolioImages'
    | 'services'
  >
> & {
  profileImageUrl?: string;
};

export interface PendingArtistQuery {
  page: number;
  perPage: number;
  sortField?: 'signupDate';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ArtistQuery {
  page: number;
  perPage: number;
  sortField?: 'stageName' | 'createdAt' | 'averageRating' | 'totalServices';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  verificationStatus?: ArtistProfile['verificationStatus'];
  isAcceptingBookings?: boolean;
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
    businessRegistrationNumber: row.businessRegistrationNumber ?? null,
    serviceRadiusKm: toNumber(row.serviceRadiusKm, 0),
    primaryLocation: (row.primaryLocation as ArtistProfile['primaryLocation']) ?? {
      latitude: 0,
      longitude: 0,
    },
    isAcceptingBookings: row.isAcceptingBookings ?? true,
    verificationStatus:
      (row.verificationStatus as ArtistProfile['verificationStatus']) ?? 'pending_review',
    averageRating: toNumber(row.averageRating, 0),
    totalReviews: row.totalReviews ?? 0,
    totalServices: row.totalServices ?? 0,
    portfolioImages: (row.portfolioImages as ArtistProfile['portfolioImages']) ?? [],
    services: (row.services as ArtistProfile['services']) ?? [],
    profileImageUrl: row.profileImageUrl ?? undefined,
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
    verificationStatus: row.verificationStatus ?? 'pending_review',
    bio: row.bio,
    specialties: specialties ?? [],
    portfolioImages: (row.portfolioImages as PendingArtistDetail['portfolioImages']) ?? [],
    services: (row.services as PendingArtistDetail['services']) ?? [],
    yearsExperience: row.yearsExperience ?? null,
  };
}

function mapArtistAdminRow(row: ArtistAdminRow): ArtistListItem {
  return {
    id: row.id,
    userId: row.userId,
    stageName: row.stageName,
    name: row.name && row.name.length > 0 ? row.name : row.stageName,
    email: row.email,
    phoneNumber: row.phoneNumber ?? '',
    verificationStatus: row.verificationStatus ?? 'pending_review',
    isAcceptingBookings: row.isAcceptingBookings ?? true,
    averageRating: row.averageRating ? toNumber(row.averageRating, 0) : null,
    totalReviews: row.totalReviews ?? 0,
    totalServices: row.totalServices ?? 0,
    createdAt: row.createdAt.toISOString(),
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
  };
}

function mapArtistDetailRow(row: ArtistDetailRow): ArtistDetail {
  const specialties =
    Array.isArray(row.specialties) && row.specialties.every((item) => typeof item === 'string')
      ? row.specialties
      : [];

  return {
    ...mapArtistAdminRow(row),
    bio: row.bio,
    specialties,
    yearsExperience: row.yearsExperience,
    businessVerified: row.businessVerified ?? false,
    businessRegistrationNumber: row.businessRegistrationNumber,
    serviceRadiusKm: toNumber(row.serviceRadiusKm, 0),
    primaryLocation: (row.primaryLocation as ArtistDetail['primaryLocation']) ?? null,
    portfolioImages: (row.portfolioImages as ArtistDetail['portfolioImages']) ?? [],
    services: (row.services as ArtistDetail['services']) ?? [],
    completedServices: row.completedServices ?? 0,
    cancelledServices: row.cancelledServices ?? 0,
    profileImageUrl: row.profileImageUrl,
    reviewedBy: row.reviewedBy,
    reviewNotes: row.reviewNotes,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
  };
}

const artistProfileSelect = {
  id: artistProfiles.id,
  createdAt: artistProfiles.createdAt,
  updatedAt: artistProfiles.updatedAt,
  userId: artistProfiles.userId,
  stageName: artistProfiles.stageName,
  bio: artistProfiles.bio,
  specialties: artistProfiles.specialties,
  yearsExperience: artistProfiles.yearsExperience,
  businessRegistrationNumber: artistProfiles.businessRegistrationNumber,
  businessVerified: artistProfiles.businessVerified,
  serviceRadiusKm: artistProfiles.serviceRadiusKm,
  primaryLocation: artistProfiles.primaryLocation,
  isAcceptingBookings: artistProfiles.isAcceptingBookings,
  verificationStatus: artistProfiles.verificationStatus,
  averageRating: artistProfiles.averageRating,
  totalReviews: artistProfiles.totalReviews,
  totalServices: artistProfiles.totalServices,
  portfolioImages: artistProfiles.portfolioImages,
  services: artistProfiles.services,
  profileImageUrl: users.profileImageUrl,
  verifiedAt: artistProfiles.verifiedAt,
};

export class ArtistRepository {
  async findById(artistProfileId: string): Promise<ArtistProfile | null> {
    const [record] = await db
      .select(artistProfileSelect)
      .from(artistProfiles)
      .leftJoin(users, eq(users.id, artistProfiles.userId))
      .where(eq(artistProfiles.id, artistProfileId))
      .limit(1);

    return record ? mapRowToProfile(record) : null;
  }

  async findByUserId(userId: string): Promise<ArtistProfile | null> {
    const [record] = await db
      .select(artistProfileSelect)
      .from(artistProfiles)
      .leftJoin(users, eq(users.id, artistProfiles.userId))
      .where(eq(artistProfiles.userId, userId))
      .limit(1);

    return record ? mapRowToProfile(record) : null;
  }

  async update(artistProfileId: string, updates: ArtistProfileUpdateInput): Promise<ArtistProfile> {
    const [current] = await db
      .select({ userId: artistProfiles.userId })
      .from(artistProfiles)
      .where(eq(artistProfiles.id, artistProfileId))
      .limit(1);

    if (!current) {
      throw Object.assign(new Error('Artist not found'), { status: 404 });
    }

    const updatePayload: Partial<typeof artistProfiles.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (updates.stageName !== undefined) {
      updatePayload.stageName = updates.stageName;
    }
    if (updates.bio !== undefined) {
      updatePayload.bio = updates.bio;
    }
    if (updates.specialties !== undefined) {
      updatePayload.specialties = updates.specialties;
    }
    if (updates.yearsExperience !== undefined) {
      updatePayload.yearsExperience = updates.yearsExperience;
    }
    if (updates.businessRegistrationNumber !== undefined) {
      updatePayload.businessRegistrationNumber = updates.businessRegistrationNumber;
    }
    if (updates.serviceRadiusKm !== undefined) {
      updatePayload.serviceRadiusKm = updates.serviceRadiusKm.toString();
    }
    if (updates.primaryLocation !== undefined) {
      updatePayload.primaryLocation = updates.primaryLocation;
    }
    if (updates.isAcceptingBookings !== undefined) {
      updatePayload.isAcceptingBookings = updates.isAcceptingBookings;
    }
    if (updates.portfolioImages !== undefined) {
      updatePayload.portfolioImages = updates.portfolioImages;
    }
    if (updates.services !== undefined) {
      updatePayload.services = updates.services;
    }

    const [updated] = await db
      .update(artistProfiles)
      .set(updatePayload)
      .where(eq(artistProfiles.id, artistProfileId))
      .returning();

    if (!updated) {
      throw Object.assign(new Error('Artist not found'), { status: 404 });
    }

    if (updates.profileImageUrl) {
      await db
        .update(users)
        .set({ profileImageUrl: updates.profileImageUrl, updatedAt: new Date() })
        .where(eq(users.id, current.userId));
    }

    const [record] = await db
      .select(artistProfileSelect)
      .from(artistProfiles)
      .leftJoin(users, eq(users.id, artistProfiles.userId))
      .where(eq(artistProfiles.id, artistProfileId))
      .limit(1);

    if (!record) {
      throw Object.assign(new Error('Artist not found'), { status: 404 });
    }

    return mapRowToProfile(record);
  }

  async updateByUserId(userId: string, updates: ArtistProfileUpdateInput): Promise<ArtistProfile> {
    const [artist] = await db
      .select({ id: artistProfiles.id })
      .from(artistProfiles)
      .where(eq(artistProfiles.userId, userId))
      .limit(1);

    if (!artist) {
      throw Object.assign(new Error('Artist not found'), { status: 404 });
    }

    return this.update(artist.id, updates);
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
        portfolioImages: artistProfiles.portfolioImages,
        services: artistProfiles.services,
        yearsExperience: artistProfiles.yearsExperience,
      })
      .from(artistProfiles)
      .leftJoin(users, eq(users.id, artistProfiles.userId))
      .where(eq(artistProfiles.verificationStatus, 'pending_review'))
      .orderBy(sortDirection)
      .limit(perPage)
      .offset(offset);

    const [countRow] =
      (await db
        .select({ count: sql<number>`count(*)` })
        .from(artistProfiles)
        .where(eq(artistProfiles.verificationStatus, 'pending_review'))) ?? [];

    const total = countRow?.count ?? 0;

    return {
      items: rows.map((row) => mapPendingRow(row as PendingArtistRow)),
      total: Number(total),
    };
  }

  async findPendingById(userId: string): Promise<PendingArtistDetail | null> {
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
        portfolioImages: artistProfiles.portfolioImages,
        services: artistProfiles.services,
        yearsExperience: artistProfiles.yearsExperience,
      })
      .from(artistProfiles)
      .leftJoin(users, eq(users.id, artistProfiles.userId))
      .where(
        and(
          eq(artistProfiles.userId, userId),
          eq(artistProfiles.verificationStatus, 'pending_review')
        )
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return mapPendingRow(row as PendingArtistRow);
  }

  async activatePendingArtist(userId: string, reviewerId?: string): Promise<ArtistProfile> {
    const [updated] = await db
      .update(artistProfiles)
      .set({
        verificationStatus: 'verified',
        isAcceptingBookings: true,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        verifiedAt: new Date(),
      })
      .where(
        and(
          eq(artistProfiles.userId, userId),
          eq(artistProfiles.verificationStatus, 'pending_review')
        )
      )
      .returning();

    if (!updated) {
      throw Object.assign(new Error('Artist not found or already activated'), { status: 400 });
    }

    return mapRowToProfile(updated);
  }

  async findAllArtists(query: ArtistQuery) {
    const { page, perPage, sortField, sortOrder, search, verificationStatus, isAcceptingBookings } =
      query;
    const offset = Math.max(page - 1, 0) * perPage;

    // Determine sort column
    const sortColumnMap = {
      stageName: artistProfiles.stageName,
      createdAt: artistProfiles.createdAt,
      averageRating: artistProfiles.averageRating,
      totalServices: artistProfiles.totalServices,
    };
    const sortColumn = sortColumnMap[sortField ?? 'createdAt'] ?? artistProfiles.createdAt;
    const sortDirection = (sortOrder ?? 'DESC') === 'ASC' ? asc(sortColumn) : desc(sortColumn);

    // Build conditions
    const conditions = [];

    if (verificationStatus) {
      conditions.push(eq(artistProfiles.verificationStatus, verificationStatus));
    }

    if (isAcceptingBookings !== undefined) {
      conditions.push(eq(artistProfiles.isAcceptingBookings, isAcceptingBookings));
    }

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(artistProfiles.stageName, searchPattern),
          ilike(users.name, searchPattern),
          ilike(users.email, searchPattern),
          ilike(users.phoneNumber, searchPattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        id: artistProfiles.id,
        userId: artistProfiles.userId,
        stageName: artistProfiles.stageName,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        verificationStatus: artistProfiles.verificationStatus,
        isAcceptingBookings: artistProfiles.isAcceptingBookings,
        averageRating: artistProfiles.averageRating,
        totalReviews: artistProfiles.totalReviews,
        totalServices: artistProfiles.totalServices,
        createdAt: artistProfiles.createdAt,
        verifiedAt: artistProfiles.verifiedAt,
      })
      .from(artistProfiles)
      .leftJoin(users, eq(users.id, artistProfiles.userId))
      .where(whereClause)
      .orderBy(sortDirection)
      .limit(perPage)
      .offset(offset);

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(artistProfiles)
      .leftJoin(users, eq(users.id, artistProfiles.userId))
      .where(whereClause);

    const total = countRow?.count ?? 0;

    return {
      items: rows.map((row) => mapArtistAdminRow(row as ArtistAdminRow)),
      total: Number(total),
    };
  }

  async findArtistDetailById(artistProfileId: string): Promise<ArtistDetail | null> {
    const [row] = await db
      .select({
        id: artistProfiles.id,
        userId: artistProfiles.userId,
        stageName: artistProfiles.stageName,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        verificationStatus: artistProfiles.verificationStatus,
        isAcceptingBookings: artistProfiles.isAcceptingBookings,
        averageRating: artistProfiles.averageRating,
        totalReviews: artistProfiles.totalReviews,
        totalServices: artistProfiles.totalServices,
        createdAt: artistProfiles.createdAt,
        verifiedAt: artistProfiles.verifiedAt,
        bio: artistProfiles.bio,
        specialties: artistProfiles.specialties,
        yearsExperience: artistProfiles.yearsExperience,
        businessVerified: artistProfiles.businessVerified,
        businessRegistrationNumber: artistProfiles.businessRegistrationNumber,
        serviceRadiusKm: artistProfiles.serviceRadiusKm,
        primaryLocation: artistProfiles.primaryLocation,
        portfolioImages: artistProfiles.portfolioImages,
        services: artistProfiles.services,
        completedServices: artistProfiles.completedServices,
        cancelledServices: artistProfiles.cancelledServices,
        profileImageUrl: users.profileImageUrl,
        reviewedBy: artistProfiles.reviewedBy,
        reviewNotes: artistProfiles.reviewNotes,
        reviewedAt: artistProfiles.reviewedAt,
      })
      .from(artistProfiles)
      .leftJoin(users, eq(users.id, artistProfiles.userId))
      .where(eq(artistProfiles.id, artistProfileId))
      .limit(1);

    if (!row) {
      return null;
    }

    return mapArtistDetailRow(row as ArtistDetailRow);
  }

  async updateArtistAdmin(
    artistProfileId: string,
    updates: Partial<{
      isAcceptingBookings: boolean;
      verificationStatus: ArtistProfile['verificationStatus'];
      reviewNotes: string;
    }>
  ): Promise<ArtistDetail> {
    const updatePayload: Partial<typeof artistProfiles.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (updates.isAcceptingBookings !== undefined) {
      updatePayload.isAcceptingBookings = updates.isAcceptingBookings;
    }
    if (updates.verificationStatus !== undefined) {
      updatePayload.verificationStatus = updates.verificationStatus;
    }
    if (updates.reviewNotes !== undefined) {
      updatePayload.reviewNotes = updates.reviewNotes;
    }

    const [updated] = await db
      .update(artistProfiles)
      .set(updatePayload)
      .where(eq(artistProfiles.id, artistProfileId))
      .returning({ id: artistProfiles.id });

    if (!updated) {
      throw Object.assign(new Error('Artist not found'), { status: 404 });
    }

    const detail = await this.findArtistDetailById(artistProfileId);
    if (!detail) {
      throw Object.assign(new Error('Artist not found'), { status: 404 });
    }

    return detail;
  }

  async updateReviewStats(
    artistId: string,
    stats: { averageRating: number; totalReviews: number }
  ): Promise<void> {
    await db
      .update(artistProfiles)
      .set({
        averageRating: stats.averageRating.toString(),
        totalReviews: stats.totalReviews,
        updatedAt: new Date(),
      })
      .where(eq(artistProfiles.userId, artistId));
  }
}
