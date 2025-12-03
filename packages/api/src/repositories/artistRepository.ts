import { eq } from 'drizzle-orm';

import { artistProfiles } from '@524/database';
import type { ArtistProfile } from '@524/shared/artists';

import { db } from '../db/client';

type ArtistProfileRow = typeof artistProfiles.$inferSelect;

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
      longitude: 0
    },
    isAcceptingBookings: row.isAcceptingBookings ?? true,
    verificationStatus: (row.verificationStatus as ArtistProfile['verificationStatus']) ?? 'pending',
    averageRating: toNumber(row.averageRating, 0),
    totalReviews: row.totalReviews ?? 0,
    totalServices: row.totalServices ?? 0
  };
}

export class ArtistRepository {
  async findById(artistId: string): Promise<ArtistProfile | null> {
    const [record] = await db.select().from(artistProfiles).where(eq(artistProfiles.id, artistId)).limit(1);
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
        totalServices: updates.totalServices
      })
      .where(eq(artistProfiles.id, artistId))
      .returning();

    if (!updated) {
      throw Object.assign(new Error('Artist not found'), { status: 404 });
    }

    return mapRowToProfile(updated);
  }
}

