import { artistAvailability, artistProfiles } from '@524/database';
import { and, eq } from 'drizzle-orm';

import { db } from '../db/client.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('artist-availability-schedule');

export interface AvailabilityData {
  weekId: string;
  slots: string[];
  updatedAt: Date;
}

/**
 * Service for managing artist weekly availability schedules.
 * This is different from ArtistAvailabilityService which checks availability against bookings.
 * This service manages the artist's declared available time slots on a week-by-week basis.
 */
export class ArtistAvailabilityScheduleService {
  /**
   * Get an artist's availability for a specific week
   * @param artistId - The artist profile ID (not user ID)
   * @param weekId - ISO week ID (e.g., "2026-W07")
   * @returns Availability data or null if not set
   */
  async getAvailabilityForWeek(artistId: string, weekId: string): Promise<AvailabilityData | null> {
    logger.debug({ artistId, weekId }, 'Getting availability for week');

    const result = await db
      .select({
        weekId: artistAvailability.weekId,
        slots: artistAvailability.slots,
        updatedAt: artistAvailability.updatedAt,
      })
      .from(artistAvailability)
      .where(and(eq(artistAvailability.artistId, artistId), eq(artistAvailability.weekId, weekId)))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      weekId: row.weekId,
      slots: (row.slots as string[]) || [],
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Get an artist's availability for multiple weeks
   * @param artistId - The artist profile ID
   * @param weekIds - Array of ISO week IDs
   * @returns Map of weekId to availability data
   */
  async getAvailabilityForWeeks(
    artistId: string,
    weekIds: string[]
  ): Promise<Map<string, AvailabilityData>> {
    if (weekIds.length === 0) {
      return new Map();
    }

    logger.debug(
      { artistId, weekCount: weekIds.length },
      'Getting availability for multiple weeks'
    );

    const results = await db
      .select({
        weekId: artistAvailability.weekId,
        slots: artistAvailability.slots,
        updatedAt: artistAvailability.updatedAt,
      })
      .from(artistAvailability)
      .where(eq(artistAvailability.artistId, artistId));

    const availabilityMap = new Map<string, AvailabilityData>();
    for (const row of results) {
      if (weekIds.includes(row.weekId)) {
        availabilityMap.set(row.weekId, {
          weekId: row.weekId,
          slots: (row.slots as string[]) || [],
          updatedAt: row.updatedAt,
        });
      }
    }

    return availabilityMap;
  }

  /**
   * Update an artist's availability for a specific week (upsert)
   * @param artistId - The artist profile ID
   * @param weekId - ISO week ID (e.g., "2026-W07")
   * @param slots - Array of ISO datetime strings representing selected slots
   * @returns Updated availability data
   */
  async updateAvailabilityForWeek(
    artistId: string,
    weekId: string,
    slots: string[]
  ): Promise<AvailabilityData> {
    logger.debug({ artistId, weekId, slotCount: slots.length }, 'Updating availability for week');

    // Validate week ID format
    if (!/^\d{4}-W\d{2}$/.test(weekId)) {
      throw new Error(`Invalid week ID format: ${weekId}. Expected format: YYYY-Www`);
    }

    const now = new Date();

    // Use upsert (insert on conflict update)
    const result = await db
      .insert(artistAvailability)
      .values({
        artistId,
        weekId,
        slots,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [artistAvailability.artistId, artistAvailability.weekId],
        set: {
          slots,
          updatedAt: now,
        },
      })
      .returning({
        weekId: artistAvailability.weekId,
        slots: artistAvailability.slots,
        updatedAt: artistAvailability.updatedAt,
      });

    const row = result[0];
    logger.info({ artistId, weekId, slotCount: slots.length }, 'Availability updated');

    return {
      weekId: row.weekId,
      slots: (row.slots as string[]) || [],
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Get an artist profile ID from user ID
   * @param userId - The user ID
   * @returns Artist profile ID or null if not found
   */
  async getArtistIdFromUserId(userId: string): Promise<string | null> {
    const result = await db
      .select({ id: artistProfiles.id })
      .from(artistProfiles)
      .where(eq(artistProfiles.userId, userId))
      .limit(1);

    return result.length > 0 ? result[0].id : null;
  }

  /**
   * Delete availability for a specific week
   * @param artistId - The artist profile ID
   * @param weekId - ISO week ID
   * @returns true if deleted, false if not found
   */
  async deleteAvailabilityForWeek(artistId: string, weekId: string): Promise<boolean> {
    logger.debug({ artistId, weekId }, 'Deleting availability for week');

    const result = await db
      .delete(artistAvailability)
      .where(and(eq(artistAvailability.artistId, artistId), eq(artistAvailability.weekId, weekId)))
      .returning({ id: artistAvailability.id });

    return result.length > 0;
  }
}
