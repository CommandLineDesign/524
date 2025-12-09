import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import type { AuthRequest } from '../middleware/auth.js';
import { ArtistService } from '../services/artistService.js';

const artistService = new ArtistService();

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
  })
  .strict();

export const ArtistController = {
  async getArtistProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await artistService.getArtistProfile(req.params.artistId);
      if (!profile) {
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
};
