import type { NextFunction, Request, Response } from 'express';

import type { AuthRequest } from '../middleware/auth.js';
import { ArtistService } from '../services/artistService.js';

const artistService = new ArtistService();

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
      const profile = await artistService.getArtistProfile(req.user.id);
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
      const profile = await artistService.updateArtistProfile(req.user.id, req.body);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  },

  async updateArtistProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await artistService.updateArtistProfile(req.params.artistId, req.body);
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
