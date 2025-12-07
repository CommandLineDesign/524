import type { NextFunction, Request, Response } from 'express';

import type { ArtistProfile } from '@524/shared/artists';
import { ArtistService } from '../services/artistService.js';

const artistService = new ArtistService();

export const AdminArtistController = {
  async listPendingArtists(req: Request, res: Response, next: NextFunction) {
    try {
      const page =
        typeof req.query.page === 'string'
          ? Number.parseInt(req.query.page, 10)
          : typeof req.query._page === 'string'
            ? Number.parseInt(req.query._page, 10)
            : 1;
      const perPage =
        typeof req.query.perPage === 'string'
          ? Number.parseInt(req.query.perPage, 10)
          : typeof req.query._perPage === 'string'
            ? Number.parseInt(req.query._perPage, 10)
            : 25;
      const sortField =
        (req.query.sortField as 'signupDate' | undefined) ??
        (req.query._sort as 'signupDate' | undefined) ??
        'signupDate';
      const sortOrder =
        (req.query.sortOrder as 'ASC' | 'DESC' | undefined) ??
        (req.query._order as 'ASC' | 'DESC' | undefined) ??
        'DESC';

      const result = await artistService.getPendingArtists({
        page: Number.isNaN(page) ? 1 : Math.max(page, 1),
        perPage: Number.isNaN(perPage) ? 25 : Math.max(perPage, 1),
        sortField,
        sortOrder,
      });

      res.json({
        data: result.items,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPendingArtist(req: Request, res: Response, next: NextFunction) {
    try {
      const artist = await artistService.getPendingArtistById(req.params.artistId);

      if (!artist) {
        res.status(404).json({ error: 'Pending artist not found' });
        return;
      }

      res.json({ data: artist });
    } catch (error) {
      next(error);
    }
  },

  async updatePendingArtist(req: Request, res: Response, next: NextFunction) {
    try {
      const artistId = req.params.artistId;
      const updates = req.body ?? {};

      const allowedKeys: (keyof ArtistProfile)[] = [
        'stageName',
        'bio',
        'specialties',
        'yearsExperience',
        'portfolioImages',
        'services',
      ];

      const filteredUpdates = allowedKeys.reduce<Partial<ArtistProfile>>((acc, key) => {
        if (updates[key] !== undefined) {
          acc[key] = updates[key];
        }
        return acc;
      }, {});

      const updated = await artistService.updateArtistProfile(artistId, filteredUpdates);
      res.json({ data: updated });
    } catch (error) {
      next(error);
    }
  },
};
