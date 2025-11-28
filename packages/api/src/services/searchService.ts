import type { ArtistSearchFilters, ArtistSearchResult } from '@524/shared/artists';

import { artistProfiles } from '@524/database';
import { db } from '../db/client';
import { createLogger } from '../utils/logger';

const logger = createLogger('search');

type ArtistSearchRow = Pick<
  typeof artistProfiles.$inferSelect,
  'id' | 'stageName' | 'specialties' | 'averageRating' | 'totalReviews' | 'services'
>;

export class SearchService {
  async searchArtists(filters: ArtistSearchFilters): Promise<ArtistSearchResult[]> {
    logger.info({ filters }, 'Executing artist search against database');
    const rows = await db
      .select({
        id: artistProfiles.id,
        stageName: artistProfiles.stageName,
        specialties: artistProfiles.specialties,
        averageRating: artistProfiles.averageRating,
        totalReviews: artistProfiles.totalReviews,
        services: artistProfiles.services
      })
      .from(artistProfiles)
      .limit(25);

    return rows
      .filter((row) => this.matchesFilters(row, filters))
      .map((row) => this.mapRowToResult(row));
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

    return {
      id: row.id,
      stageName: row.stageName,
      specialties: (row.specialties as string[] | null) ?? [],
      averageRating: row.averageRating ? Number(row.averageRating) : 0,
      reviewCount: row.totalReviews ?? 0,
      priceRange
    };
  }
}

