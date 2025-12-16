import type { ArtistSearchFilters, ArtistSearchResult } from '@524/shared/artists';

import { artistProfiles } from '@524/database';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('search');

type ArtistSearchRow = Pick<
  typeof artistProfiles.$inferSelect,
  | 'id'
  | 'userId'
  | 'stageName'
  | 'specialties'
  | 'averageRating'
  | 'totalReviews'
  | 'services'
  | 'verificationStatus'
>;

export class SearchService {
  async searchArtists(filters: ArtistSearchFilters): Promise<ArtistSearchResult[]> {
    logger.info({ filters }, 'Executing artist search against database');
    const rows = await db
      .select({
        id: artistProfiles.id,
        userId: artistProfiles.userId,
        stageName: artistProfiles.stageName,
        specialties: artistProfiles.specialties,
        averageRating: artistProfiles.averageRating,
        totalReviews: artistProfiles.totalReviews,
        services: artistProfiles.services,
        verificationStatus: artistProfiles.verificationStatus,
      })
      .from(artistProfiles)
      .where(eq(artistProfiles.verificationStatus, 'verified'))
      .limit(25);

    const results = rows
      .filter((row) => this.matchesFilters(row, filters))
      .map((row) => this.mapRowToResult(row));

    return results;
  }

  private matchesFilters(row: ArtistSearchRow, filters: ArtistSearchFilters) {
    if (filters.query && !row.stageName.toLowerCase().includes(filters.query.toLowerCase())) {
      return false;
    }

    if (filters.serviceType) {
      const specialties = (row.specialties as string[] | null) ?? [];
      if (!specialties.includes(filters.serviceType)) {
        return false;
      }
    }

    return true;
  }

  private mapRowToResult(row: ArtistSearchRow): ArtistSearchResult {
    const services = (row.services as Array<{ price?: number }> | null) ?? [];
    const prices = services.map((service) => service.price ?? 0).filter((price) => price > 0);
    const defaultRange: [number, number] = [80000, 150000];
    const priceRange: [number, number] =
      prices.length > 0 ? [Math.min(...prices), Math.max(...prices)] : defaultRange;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/894ed83a-4085-4fe3-ad0a-11d8954f2764', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'packages/api/src/services/searchService.ts:58',
        message: 'Mapping row to result - checking userId vs profile id',
        data: { profileId: row.id, userId: row.userId, stageName: row.stageName },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion

    return {
      id: row.userId, // Return userId so bookings can reference the correct user
      stageName: row.stageName,
      specialties: (row.specialties as string[] | null) ?? [],
      averageRating: row.averageRating ? Number(row.averageRating) : 0,
      reviewCount: row.totalReviews ?? 0,
      priceRange,
    };
  }
}
