import { bookings } from '@524/database';
import { and, eq, gte, inArray, lte, or } from 'drizzle-orm';

import { db } from '../db/client.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('artist-availability');

/**
 * Service for checking artist availability
 */
export class ArtistAvailabilityService {
  /**
   * Check if an artist is available at a specific date/time
   * An artist is unavailable if they have an existing booking that overlaps with the requested time
   *
   * @param artistId - The artist's user ID
   * @param requestedDateTime - The requested start time (ISO string or Date)
   * @param durationMinutes - Optional duration to check for overlap (default: 60 minutes)
   * @returns true if the artist is available, false if they have a conflicting booking
   */
  async isArtistAvailable(
    artistId: string,
    requestedDateTime: Date | string,
    durationMinutes = 60
  ): Promise<boolean> {
    const requestedStart = new Date(requestedDateTime);
    const requestedEnd = new Date(requestedStart.getTime() + durationMinutes * 60 * 1000);

    logger.debug({ artistId, requestedStart, requestedEnd }, 'Checking artist availability');

    // Find any bookings that overlap with the requested time slot
    // A booking overlaps if:
    // - Its start time is before the requested end AND
    // - Its end time is after the requested start
    const conflictingBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.artistId, artistId),
          // Only check confirmed or pending bookings (not cancelled, completed, etc.)
          or(eq(bookings.status, 'confirmed'), eq(bookings.status, 'pending')),
          // Check for time overlap
          lte(bookings.scheduledStartTime, requestedEnd),
          gte(bookings.scheduledEndTime, requestedStart)
        )
      )
      .limit(1);

    const isAvailable = conflictingBookings.length === 0;

    logger.debug(
      { artistId, isAvailable, conflictCount: conflictingBookings.length },
      'Artist availability check complete'
    );

    return isAvailable;
  }

  /**
   * Check availability for multiple artists at once
   * More efficient than calling isArtistAvailable for each artist individually
   *
   * @param artistIds - Array of artist user IDs to check
   * @param requestedDateTime - The requested start time
   * @param durationMinutes - Optional duration to check for overlap (default: 60 minutes)
   * @returns Map of artistId -> isAvailable
   */
  async checkMultipleArtistsAvailability(
    artistIds: string[],
    requestedDateTime: Date | string,
    durationMinutes = 60
  ): Promise<Map<string, boolean>> {
    if (artistIds.length === 0) {
      return new Map();
    }

    const requestedStart = new Date(requestedDateTime);
    const requestedEnd = new Date(requestedStart.getTime() + durationMinutes * 60 * 1000);

    logger.debug(
      { artistCount: artistIds.length, requestedStart, requestedEnd },
      'Checking multiple artists availability'
    );

    // Find all conflicting bookings for the given artists
    const conflictingBookings = await db
      .select({ artistId: bookings.artistId })
      .from(bookings)
      .where(
        and(
          // Filter to only the artists we care about
          inArray(bookings.artistId, artistIds),
          // Only check confirmed or pending bookings
          or(eq(bookings.status, 'confirmed'), eq(bookings.status, 'pending')),
          // Check for time overlap
          lte(bookings.scheduledStartTime, requestedEnd),
          gte(bookings.scheduledEndTime, requestedStart)
        )
      );

    // Create a set of artist IDs with conflicts
    const artistsWithConflicts = new Set(
      conflictingBookings.map((b) => b.artistId).filter((id): id is string => id !== null)
    );

    // Build the result map
    const availabilityMap = new Map<string, boolean>();
    for (const artistId of artistIds) {
      availabilityMap.set(artistId, !artistsWithConflicts.has(artistId));
    }

    logger.debug(
      { artistCount: artistIds.length, unavailableCount: artistsWithConflicts.size },
      'Multiple artists availability check complete'
    );

    return availabilityMap;
  }
}
