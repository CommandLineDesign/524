import type { ArtistSearchFilters, ArtistSearchResult } from '@524/shared/artists';

import { artistProfiles, users } from '@524/database';
import { eq } from 'drizzle-orm';
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

    logger.info({ filters }, 'Executing filtered artist search');

    // Fetch all verified artists with location data
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
      .where(eq(artistProfiles.verificationStatus, 'verified'))
      .limit(100); // Fetch more since we'll filter down

    // Filter by service type
    const serviceTypeFiltered = rows.filter((row) => {
      const specialties = (row.specialties as string[] | null) ?? [];
      if (serviceType === 'combo') {
        return specialties.includes('hair') && specialties.includes('makeup');
      }
      return specialties.includes(serviceType);
    });

    // Filter by location - check if user is within artist's service area
    const locationFiltered = serviceTypeFiltered.filter((row) => {
      const location = row.primaryLocation as { latitude: number; longitude: number } | null;
      if (!location || !location.latitude || !location.longitude) {
        return false;
      }

      const artistServiceRadius = row.serviceRadiusKm ? Number(row.serviceRadiusKm) : 10;
      const distance = calculateDistanceKm(
        latitude,
        longitude,
        location.latitude,
        location.longitude
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

    // Filter by availability and map to results
    const results = locationFiltered
      .filter((row) => availabilityMap.get(row.userId) === true)
      .map((row) => this.mapRowToResult(row))
      .slice(0, 20); // Limit final results

    logger.info(
      {
        totalFetched: rows.length,
        afterServiceType: serviceTypeFiltered.length,
        afterLocation: locationFiltered.length,
        afterAvailability: results.length,
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
