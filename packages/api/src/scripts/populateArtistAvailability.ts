#!/usr/bin/env node
/**
 * Script to populate all artists with default availability (7am - 10pm KST) for the next 30 days
 * Run with: npx tsx src/scripts/populateArtistAvailability.ts
 *
 * All times are stored in UTC. Slot times (7 AM - 10 PM) are Korea Standard Time (UTC+9).
 */

import { artistProfiles } from '@524/database';
import { addUTCDays, getUTCWeekId, startOfUTCDay } from '@524/shared';
import { db } from '../db/client.js';
import { ArtistAvailabilityScheduleService } from '../services/artistAvailabilityScheduleService.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('populate-availability');
const scheduleService = new ArtistAvailabilityScheduleService();

// Korea Standard Time offset from UTC (UTC+9)
const KST_OFFSET_HOURS = 9;

/**
 * Generate 30-minute time slots for a given date between 7am and 10pm KST
 * Generates slots in UTC that represent Korean local times
 */
function generateDaySlots(dateUTC: Date): string[] {
  const slots: string[] = [];

  // Get start of day in UTC
  const dayStartUTC = startOfUTCDay(dateUTC);

  // Generate slots from 7:00 AM to 9:30 PM KST (last slot starts at 9:30 PM, ends at 10:00 PM)
  // 7:00 AM KST = 22:00 UTC (previous day) when KST is UTC+9
  // But we want to generate for the same Korean calendar day, so:
  // For a Korean day, 7 AM KST = 7 - 9 = -2 = 22:00 UTC (previous day)
  // For a Korean day, 10 PM KST = 22 - 9 = 13:00 UTC (same day)
  //
  // Since we're iterating over UTC days but want Korean business hours,
  // we calculate the UTC time that corresponds to each Korean hour.
  for (let kstHour = 7; kstHour < 22; kstHour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Convert KST hour to UTC: KST hour - 9 = UTC hour
      // This can be negative, which Date.UTC handles correctly
      const utcHour = kstHour - KST_OFFSET_HOURS;
      const slotDate = new Date(
        Date.UTC(
          dayStartUTC.getUTCFullYear(),
          dayStartUTC.getUTCMonth(),
          dayStartUTC.getUTCDate(),
          utcHour,
          minute,
          0,
          0
        )
      );
      slots.push(slotDate.toISOString());
    }
  }

  return slots;
}

/**
 * Generate slots for the next 30 days grouped by week
 */
function generateNext30DaysSlots(): Map<string, string[]> {
  const weekSlotsMap = new Map<string, string[]>();
  const today = new Date();

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = addUTCDays(today, dayOffset);

    const weekId = getUTCWeekId(date);
    const daySlots = generateDaySlots(date);

    // Add to existing week or create new entry
    const existingSlots = weekSlotsMap.get(weekId) || [];
    weekSlotsMap.set(weekId, [...existingSlots, ...daySlots]);
  }

  return weekSlotsMap;
}

async function main() {
  try {
    logger.info('Starting artist availability population script');

    // Get all artist profiles with stageName for better logging
    const artists = await db
      .select({
        id: artistProfiles.id,
        stageName: artistProfiles.stageName,
        accountStatus: artistProfiles.accountStatus,
      })
      .from(artistProfiles);

    if (artists.length === 0) {
      logger.info('No artists found in database');
      return;
    }

    logger.info({ artistCount: artists.length }, 'Found artists to populate');

    // Log each artist found
    artists.forEach((artist, index) => {
      logger.info(
        {
          index: index + 1,
          artistId: artist.id,
          stageName: artist.stageName,
          accountStatus: artist.accountStatus,
        },
        'Artist found'
      );
    });

    // Generate slots for next 30 days
    const weekSlotsMap = generateNext30DaysSlots();
    logger.info({ weekCount: weekSlotsMap.size }, 'Generated week slots');

    let successCount = 0;
    let errorCount = 0;

    // Populate availability for each artist
    for (const artist of artists) {
      try {
        logger.info({ artistId: artist.id, stageName: artist.stageName }, 'Processing artist');
        for (const [weekId, slots] of weekSlotsMap.entries()) {
          await scheduleService.updateAvailabilityForWeek(artist.id, weekId, slots);
        }
        successCount++;
        logger.info(
          { artistId: artist.id, stageName: artist.stageName },
          'Successfully populated availability'
        );
      } catch (error) {
        errorCount++;
        logger.error(
          { artistId: artist.id, stageName: artist.stageName, error },
          'Failed to populate availability for artist'
        );
      }
    }

    logger.info(
      {
        total: artists.length,
        success: successCount,
        errors: errorCount,
      },
      'Availability population complete'
    );
  } catch (error) {
    logger.error({ error }, 'Script failed with error');
    process.exit(1);
  }
}

main()
  .then(() => {
    logger.info('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error({ error }, 'Unhandled error in script');
    process.exit(1);
  });
