#!/usr/bin/env node
/**
 * Script to populate all artists with default availability (7am - 10pm) for the next 30 days
 * Run with: npx tsx src/scripts/populateArtistAvailability.ts
 */

import { artistProfiles } from '@524/database';
import { db } from '../db/client.js';
import { ArtistAvailabilityScheduleService } from '../services/artistAvailabilityScheduleService.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('populate-availability');
const scheduleService = new ArtistAvailabilityScheduleService();

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
 * Generate 30-minute time slots for a given date between 7am and 10pm
 */
function generateDaySlots(date: Date): string[] {
  const slots: string[] = [];
  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);

  // Generate slots from 7:00 AM to 9:30 PM (last slot starts at 9:30 PM, ends at 10:00 PM)
  for (let hour = 7; hour < 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotDate = new Date(baseDate);
      slotDate.setHours(hour, minute, 0, 0);
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
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);

    const weekId = getWeekId(date);
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
