import { artistAvailability, artistProfiles, bookings } from '@524/database';
import { and, eq, gte, inArray, lte, or } from 'drizzle-orm';

import { db } from '../db/client.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('artist-availability');

/**
 * Get ISO week ID from a date (format: "YYYY-Www")
 */
function getWeekId(date: Date): string {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Get artist profile ID from user ID
 */
async function getArtistProfileId(userId: string): Promise<string | null> {
  const result = await db
    .select({ id: artistProfiles.id })
    .from(artistProfiles)
    .where(eq(artistProfiles.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0].id : null;
}

/**
 * Service for checking artist availability
 */
export class ArtistAvailabilityService {
  /**
   * Check if an artist is available at a specific date/time
   * An artist is unavailable if:
   * 1. They haven't declared this time slot as available in their schedule, OR
   * 2. They have an existing booking that overlaps with the requested time
   *
   * @param artistId - The artist's user ID
   * @param requestedDateTime - The requested start time (ISO string or Date)
   * @param durationMinutes - Optional duration to check for overlap (default: 60 minutes)
   * @returns true if the artist is available, false otherwise
   */
  async isArtistAvailable(
    artistId: string,
    requestedDateTime: Date | string,
    durationMinutes = 60
  ): Promise<boolean> {
    const requestedStart = new Date(requestedDateTime);
    const requestedEnd = new Date(requestedStart.getTime() + durationMinutes * 60 * 1000);

    logger.debug({ artistId, requestedStart, requestedEnd }, 'Checking artist availability');

    // Step 1: Check if the time slot is in the artist's declared schedule
    const artistProfileId = await getArtistProfileId(artistId);
    if (!artistProfileId) {
      logger.debug({ artistId }, 'Artist profile not found');
      return false;
    }

    const weekId = getWeekId(requestedStart);
    const availabilityRecord = await db
      .select({ slots: artistAvailability.slots })
      .from(artistAvailability)
      .where(
        and(eq(artistAvailability.artistId, artistProfileId), eq(artistAvailability.weekId, weekId))
      )
      .limit(1);

    if (availabilityRecord.length === 0) {
      logger.debug({ artistId, weekId }, 'No availability schedule found for this week');
      return false;
    }

    // Check if the requested start time matches any declared slots
    const slots = (availabilityRecord[0].slots as string[]) || [];
    const requestedSlot = requestedStart.toISOString();
    const hasScheduledSlot = slots.includes(requestedSlot);

    if (!hasScheduledSlot) {
      logger.debug({ artistId, requestedSlot }, 'Requested time not in artist schedule');
      return false;
    }

    // Step 2: Check for conflicting bookings
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
      { artistId, isAvailable, hasScheduledSlot, conflictCount: conflictingBookings.length },
      'Artist availability check complete'
    );

    return isAvailable;
  }

  /**
   * Check availability for multiple artists at once
   * More efficient than calling isArtistAvailable for each artist individually
   * Checks both declared schedule and booking conflicts
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

    // Step 1: Get artist profile IDs from user IDs
    const artistProfileRows = await db
      .select({ userId: artistProfiles.userId, profileId: artistProfiles.id })
      .from(artistProfiles)
      .where(inArray(artistProfiles.userId, artistIds));

    const userIdToProfileId = new Map(
      artistProfileRows.map((a) => [a.userId, a.profileId] as [string, string])
    );
    const profileIds = artistProfileRows.map((a) => a.profileId);

    // Step 2: Check declared schedules
    const weekId = getWeekId(requestedStart);
    const requestedSlot = requestedStart.toISOString();

    const availabilityRecords = await db
      .select({
        artistId: artistAvailability.artistId,
        slots: artistAvailability.slots,
      })
      .from(artistAvailability)
      .where(
        and(inArray(artistAvailability.artistId, profileIds), eq(artistAvailability.weekId, weekId))
      );

    // Build a set of artist user IDs that have the requested slot in their schedule
    const artistsWithScheduledSlot = new Set<string>();
    for (const record of availabilityRecords) {
      const slots = (record.slots as string[]) || [];

      // Normalize slots to UTC for timezone-agnostic comparison
      const normalizedSlots = slots.map((slot) => {
        try {
          return new Date(slot).toISOString();
        } catch {
          return slot; // Keep original if parsing fails
        }
      });

      if (normalizedSlots.includes(requestedSlot)) {
        // Find the user ID for this artist profile
        const userId = artistProfileRows.find((a) => a.profileId === record.artistId)?.userId;
        if (userId) {
          artistsWithScheduledSlot.add(userId);
        }
      }
    }

    // Step 3: Find all conflicting bookings for the given artists
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

    // Create a set of artist IDs with booking conflicts
    const artistsWithConflicts = new Set(
      conflictingBookings.map((b) => b.artistId).filter((id): id is string => id !== null)
    );

    // Step 4: Build the result map - artist is available if they have the slot scheduled AND no conflicts
    const availabilityMap = new Map<string, boolean>();
    for (const artistId of artistIds) {
      const hasScheduledSlot = artistsWithScheduledSlot.has(artistId);
      const hasConflict = artistsWithConflicts.has(artistId);
      availabilityMap.set(artistId, hasScheduledSlot && !hasConflict);
    }

    logger.debug(
      {
        artistCount: artistIds.length,
        withScheduledSlot: artistsWithScheduledSlot.size,
        withConflicts: artistsWithConflicts.size,
        availableCount: Array.from(availabilityMap.values()).filter((v) => v).length,
      },
      'Multiple artists availability check complete'
    );

    return availabilityMap;
  }
}
