import type { ArtistSearchFilters, ArtistSearchResult } from '@524/shared/artists';

import { artistProfiles, users } from '@524/database';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { createLogger } from '../utils/logger.js';
import { ArtistAvailabilityService } from './artistAvailabilityService.js';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface FilteredArtistSearchFilters {
  serviceType: 'hair' | 'makeup' | 'combo';
  latitude: number;
  longitude: number;
  dateTime: string; // ISO datetime string
  radiusKm?: number; // Default: 25km - max distance to consider
}

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
> & {
  profileImageUrl: string | null;
};

type ArtistSearchRowWithLocation = ArtistSearchRow & {
  primaryLocation: { latitude: number; longitude: number } | null;
  serviceRadiusKm: string | null; // numeric comes as string from drizzle
};

export class SearchService {
  private availabilityService = new ArtistAvailabilityService();

  /**
   * Search artists filtered by location overlap and availability
   * Used by the home screen carousels to show nearby available artists
   */
  async searchArtistsFiltered(filters: FilteredArtistSearchFilters): Promise<ArtistSearchResult[]> {
    const { serviceType, latitude, longitude, dateTime, radiusKm = 25 } = filters;

    logger.debug({ filters }, 'Executing filtered artist search');

    // Build service type filter condition (pushed to SQL for efficiency)
    const serviceTypeCondition =
      serviceType === 'combo'
        ? // For combo, artist must have both hair AND makeup
          and(
            sql`${artistProfiles.specialties}::jsonb ? 'hair'`,
            sql`${artistProfiles.specialties}::jsonb ? 'makeup'`
          )
        : // For single service type, check if array contains the value
          sql`${artistProfiles.specialties}::jsonb ? ${serviceType}`;

    // Fetch verified artists filtered by service type at DB level
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
        profileImageUrl: users.profileImageUrl,
        primaryLocation: artistProfiles.primaryLocation,
        serviceRadiusKm: artistProfiles.serviceRadiusKm,
      })
      .from(artistProfiles)
      .innerJoin(users, eq(artistProfiles.userId, users.id))
      .where(and(eq(artistProfiles.verificationStatus, 'verified'), serviceTypeCondition))
      .limit(100); // Fetch more since we'll filter by location

    // Filter by location - check if user is within artist's service area
    const locationFiltered = rows.filter((row) => {
      const location = row.primaryLocation;
      // Runtime validation for JSON column - ensure it's a valid coordinate object
      if (
        !location ||
        typeof location !== 'object' ||
        typeof (location as Record<string, unknown>).latitude !== 'number' ||
        typeof (location as Record<string, unknown>).longitude !== 'number'
      ) {
        return false;
      }
      const validLocation = location as { latitude: number; longitude: number };

      const artistServiceRadius = row.serviceRadiusKm ? Number(row.serviceRadiusKm) : 10;
      const distance = calculateDistanceKm(
        latitude,
        longitude,
        validLocation.latitude,
        validLocation.longitude
      );

      // User must be within artist's service radius AND within search radius
      return distance <= artistServiceRadius && distance <= radiusKm;
    });

    if (locationFiltered.length === 0) {
      logger.info('No artists found within location range');
      return [];
    }

    // Check availability for all remaining artists
    const artistIds = locationFiltered.map((row) => row.userId);
    const availabilityMap = await this.availabilityService.checkMultipleArtistsAvailability(
      artistIds,
      dateTime
    );

    // Filter by availability, sort by rating, and map to results
    const results = locationFiltered
      .filter((row) => availabilityMap.get(row.userId) === true)
      .map((row) => this.mapRowToResult(row))
      .sort((a, b) => {
        // Artists with reviews come first
        const aHasReviews = a.reviewCount > 0;
        const bHasReviews = b.reviewCount > 0;
        if (aHasReviews !== bHasReviews) {
          return bHasReviews ? 1 : -1;
        }
        // Then sort by rating (descending)
        return b.averageRating - a.averageRating;
      })
      .slice(0, 20); // Limit final results

    logger.info(
      {
        afterServiceTypeFilter: rows.length,
        afterLocationFilter: locationFiltered.length,
        afterAvailabilityFilter: results.length,
      },
      'Filtered artist search complete'
    );

    return results;
  }

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
        profileImageUrl: users.profileImageUrl,
      })
      .from(artistProfiles)
      .innerJoin(users, eq(artistProfiles.userId, users.id))
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
      if (filters.serviceType === 'combo') {
        // For combo (hair makeup), artist must have both hair and makeup services
        if (!specialties.includes('hair') || !specialties.includes('makeup')) {
          return false;
        }
      } else {
        // For hair or makeup, check if artist offers that specific service
        if (!specialties.includes(filters.serviceType)) {
          return false;
        }
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
      id: row.userId, // Return userId so bookings can reference the correct user
      stageName: row.stageName,
      specialties: (row.specialties as string[] | null) ?? [],
      averageRating: row.averageRating ? Number(row.averageRating) : 0,
      reviewCount: row.totalReviews ?? 0,
      priceRange,
      profileImageUrl: row.profileImageUrl,
    };
  }
}
