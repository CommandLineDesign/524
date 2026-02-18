import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import type { AuthRequest } from '../middleware/auth.js';
import { ArtistAvailabilityScheduleService } from '../services/artistAvailabilityScheduleService.js';
import { ArtistAvailabilityService } from '../services/artistAvailabilityService.js';
import { ArtistService } from '../services/artistService.js';
import { ReviewService } from '../services/reviewService.js';
import { createLogger } from '../utils/logger.js';
import { parsePaginationParams } from '../utils/pagination.js';

const artistService = new ArtistService();
const reviewService = new ReviewService();
const availabilityScheduleService = new ArtistAvailabilityScheduleService();
const availabilityService = new ArtistAvailabilityService();
const logger = createLogger('artist-controller');

const availabilityUpdateSchema = z.object({
  slots: z.array(z.string()).default([]),
});

const weekIdSchema = z
  .string()
  .regex(/^\d{4}-W\d{2}$/, 'Invalid week ID format. Expected: YYYY-Www');

const artistProfileUpdateSchema = z
  .object({
    stageName: z.string().trim().min(1, 'Stage name is required').optional(),
    bio: z.string().trim().max(1000, 'Bio is too long').optional(),
    specialties: z.array(z.string().trim()).optional(),
    yearsExperience: z.number().int().min(0).max(100).optional(),
    businessRegistrationNumber: z.string().trim().optional(),
    serviceRadiusKm: z.number().nonnegative().optional(),
    primaryLocation: z
      .object({
        latitude: z.number(),
        longitude: z.number(),
        address: z.string().trim().optional(),
      })
      .optional(),
    isAcceptingBookings: z.boolean().optional(),
    portfolioImages: z
      .array(
        z.object({
          url: z.string().url(),
          caption: z.string().trim().optional(),
          serviceCategory: z.enum(['hair', 'makeup', 'combo']).optional(),
        })
      )
      .optional(),
    services: z
      .array(
        z.object({
          name: z.string().trim().min(1, 'Service name is required'),
          description: z.string().trim().optional(),
          price: z.number().nonnegative(),
        })
      )
      .optional(),
    profileImageUrl: z.string().url().optional(),
    servicePrices: z
      .object({
        hair: z.number().int().min(10000).max(500000).optional(),
        makeup: z.number().int().min(10000).max(500000).optional(),
      })
      .nullable()
      .optional(),
  })
  .strict();

/**
 * Validates that portfolio has at least one image for each service specialty
 * Returns error message if validation fails, null if valid
 */
function validateCategorizedPortfolio(
  portfolioImages: Array<{ url: string; caption?: string; serviceCategory?: string }> | undefined,
  specialties: string[] | undefined
): string | null {
  if (!portfolioImages || portfolioImages.length === 0) {
    return null; // Allow empty portfolios (will be enforced in onboarding)
  }

  if (!specialties || specialties.length === 0) {
    return null; // No specialties = no category requirements
  }

  // Filter out 'combo' as it's not a distinct category
  const distinctSpecialties = specialties.filter((s) => s !== 'combo');

  if (distinctSpecialties.length === 0) {
    return null; // Only combo specialty, no specific requirements
  }

  // For each distinct specialty, ensure at least one image exists
  for (const specialty of distinctSpecialties) {
    const hasImage = portfolioImages.some((img) => img.serviceCategory === specialty);
    if (!hasImage) {
      return `At least one portfolio image required for ${specialty} service`;
    }
  }

  return null;
}

export const ArtistController = {
  async getArtistProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { artistId } = req.params;

      // Log for debugging ID confusion issues
      logger.debug({ artistId }, 'Fetching artist profile by ID');

      const profile = await artistService.getArtistProfile(artistId);
      if (!profile) {
        // Log warning to help identify if wrong ID type is being passed
        logger.warn({ artistId }, 'Artist profile not found - check if correct ID type used');
        res.status(404).json({ error: 'Artist not found' });
        return;
      }

      res.json(profile);
    } catch (error) {
      next(error);
    }
  },

  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const profile = await artistService.getArtistProfileByUserId(req.user.id);
      if (!profile) {
        res.status(404).json({ error: 'Artist profile not found' });
        return;
      }
      res.json(profile);
    } catch (error) {
      next(error);
    }
  },

  async updateMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const result = artistProfileUpdateSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: 'Invalid profile data', details: result.error.flatten() });
        return;
      }

      // Validate categorized portfolio if updating portfolio or specialties
      const validationError = validateCategorizedPortfolio(
        result.data.portfolioImages,
        result.data.specialties
      );
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      const profile = await artistService.updateMyArtistProfile(req.user.id, result.data);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  },

  async updateArtistProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = artistProfileUpdateSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: 'Invalid profile data', details: result.error.flatten() });
        return;
      }

      // Validate categorized portfolio if updating portfolio or specialties
      const validationError = validateCategorizedPortfolio(
        result.data.portfolioImages,
        result.data.specialties
      );
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      const profile = await artistService.updateArtistProfile(req.params.artistId, result.data);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  },

  async searchArtists(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await artistService.searchArtists({
        query: req.query.query as string,
        occasion: req.query.occasion as string,
        serviceType: req.query.serviceType as string,
      });
      res.json(results);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/artists/search/filtered
   * Search artists filtered by service type, location, and availability
   * Used by home screen carousels to show nearby available artists
   */
  async searchArtistsFiltered(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceType, lat, lng, dateTime, radiusKm } = req.query;

      // Validate required parameters
      if (!serviceType || !lat || !lng || !dateTime) {
        res.status(400).json({
          error: 'Missing required parameters: serviceType, lat, lng, dateTime',
        });
        return;
      }

      // Validate serviceType
      const validServiceTypes = ['hair', 'makeup', 'combo'];
      if (!validServiceTypes.includes(serviceType as string)) {
        res.status(400).json({
          error: `Invalid serviceType. Must be one of: ${validServiceTypes.join(', ')}`,
        });
        return;
      }

      // Parse and validate coordinates
      const latitude = Number.parseFloat(lat as string);
      const longitude = Number.parseFloat(lng as string);
      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        res.status(400).json({ error: 'Invalid coordinates: lat and lng must be numbers' });
        return;
      }

      // Validate dateTime is a valid ISO string
      const parsedDateTime = new Date(dateTime as string);
      if (Number.isNaN(parsedDateTime.getTime())) {
        res.status(400).json({ error: 'Invalid dateTime: must be a valid ISO date string' });
        return;
      }

      const results = await artistService.searchArtistsFiltered({
        serviceType: serviceType as 'hair' | 'makeup' | 'combo',
        latitude,
        longitude,
        dateTime: dateTime as string,
        radiusKm: radiusKm ? Number.parseFloat(radiusKm as string) : undefined,
      });

      // Cache for 1 minute (private since results are personalized by location/time)
      res.set('Cache-Control', 'private, max-age=60');
      res.json(results);
    } catch (error) {
      logger.error({ error }, 'Failed to search filtered artists');
      next(error);
    }
  },

  /**
   * GET /api/v1/artists/:artistId/reviews
   * Get reviews for a specific artist (public endpoint)
   */
  async getArtistReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { artistId } = req.params;

      // artistId from URL is artistProfileId, but reviews.artistId references users.id
      // Need to fetch the artist profile to get the userId
      const artistProfile = await artistService.getArtistProfile(artistId);
      if (!artistProfile) {
        res.status(404).json({ error: 'Artist not found' });
        return;
      }

      // Parse pagination params
      const { limit, offset } = parsePaginationParams(req.query, { limit: 10, maxLimit: 50 });

      // Using +1 pagination pattern for hasMore detection
      // Tradeoff: fetches one extra record that's discarded to avoid separate COUNT query
      // Acceptable since review objects are lightweight and this avoids N+1 query problem
      const { reviews: reviewsToReturn, hasMore } =
        await reviewService.getReviewsForArtistWithPagination(artistProfile.userId, limit, offset);

      // Cache reviews for 1 minute (client) and 5 minutes (CDN) to reduce backend load
      // Add stale-while-revalidate for better consistency between client and CDN caching
      res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60');

      res.json({
        reviews: reviewsToReturn,
        pagination: {
          limit,
          offset,
          hasMore,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get artist reviews');
      next(error);
    }
  },

  /**
   * GET /api/v1/artists/:artistId/reviews/stats
   * Get aggregate review statistics for a specific artist (public endpoint)
   */
  async getArtistReviewStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { artistId } = req.params;

      // artistId from URL is artistProfileId, but reviews.artistId references users.id
      // Need to fetch the artist profile to get the userId
      const artistProfile = await artistService.getArtistProfile(artistId);
      if (!artistProfile) {
        res.status(404).json({ error: 'Artist not found' });
        return;
      }

      const stats = await reviewService.getArtistReviewStats(artistProfile.userId);

      // Cache stats for 1 minute (client) and 5 minutes (CDN) to reduce backend load
      // Add stale-while-revalidate for better consistency between client and CDN caching
      res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=60');

      res.json(stats);
    } catch (error) {
      logger.error({ error }, 'Failed to get artist review stats');
      next(error);
    }
  },

  /**
   * GET /api/v1/artists/me/availability/:weekId
   * Get the authenticated artist's availability for a specific week
   */
  async getMyAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { weekId } = req.params;

      // Validate week ID format
      const weekIdResult = weekIdSchema.safeParse(weekId);
      if (!weekIdResult.success) {
        res
          .status(400)
          .json({ error: 'Invalid week ID format. Expected: YYYY-Www (e.g., 2026-W07)' });
        return;
      }

      // Get artist profile ID from user ID
      const artistId = await availabilityScheduleService.getArtistIdFromUserId(req.user.id);
      if (!artistId) {
        res.status(404).json({ error: 'Artist profile not found' });
        return;
      }

      const availability = await availabilityScheduleService.getAvailabilityForWeek(
        artistId,
        weekId
      );

      res.json({
        data: availability || { weekId, slots: [], updatedAt: null },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get artist availability');
      next(error);
    }
  },

  /**
   * PUT /api/v1/artists/me/availability/:weekId
   * Update the authenticated artist's availability for a specific week
   */
  async updateMyAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { weekId } = req.params;

      // Validate week ID format
      const weekIdResult = weekIdSchema.safeParse(weekId);
      if (!weekIdResult.success) {
        res
          .status(400)
          .json({ error: 'Invalid week ID format. Expected: YYYY-Www (e.g., 2026-W07)' });
        return;
      }

      // Validate request body
      const bodyResult = availabilityUpdateSchema.safeParse(req.body);
      if (!bodyResult.success) {
        res
          .status(400)
          .json({ error: 'Invalid request body', details: bodyResult.error.flatten() });
        return;
      }

      // Get artist profile ID from user ID
      const artistId = await availabilityScheduleService.getArtistIdFromUserId(req.user.id);
      if (!artistId) {
        res.status(404).json({ error: 'Artist profile not found' });
        return;
      }

      const availability = await availabilityScheduleService.updateAvailabilityForWeek(
        artistId,
        weekId,
        bodyResult.data.slots
      );

      res.json({ data: availability });
    } catch (error) {
      logger.error({ error }, 'Failed to update artist availability');
      next(error);
    }
  },

  /**
   * GET /api/v1/artists/:artistId/check-availability
   * Check if a specific artist is available at a specific date/time
   * Public endpoint used by artist detail screen
   */
  async checkArtistAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { artistId } = req.params;
      const { dateTime } = req.query;

      if (!dateTime || typeof dateTime !== 'string') {
        res.status(400).json({ error: 'Missing or invalid dateTime parameter' });
        return;
      }

      // Validate dateTime is a valid ISO string
      const parsedDateTime = new Date(dateTime);
      if (Number.isNaN(parsedDateTime.getTime())) {
        res.status(400).json({ error: 'Invalid dateTime: must be a valid ISO date string' });
        return;
      }

      // artistId from URL is the artist profile ID, but isArtistAvailable expects user ID
      // Get the artist profile to retrieve the user ID
      const artistProfile = await artistService.getArtistProfile(artistId);
      if (!artistProfile) {
        res.status(404).json({ error: 'Artist not found' });
        return;
      }

      const isAvailable = await availabilityService.isArtistAvailable(
        artistProfile.userId,
        dateTime
      );

      // Cache for 30 seconds since availability can change
      res.set('Cache-Control', 'private, max-age=30');
      res.json({ isAvailable });
    } catch (error) {
      logger.error({ error }, 'Failed to check artist availability');
      next(error);
    }
  },
};
