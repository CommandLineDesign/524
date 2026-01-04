import type { NextFunction, Request, Response } from 'express';

import type { ArtistProfile } from '@524/shared/artists';
import type { AuthRequest } from '../middleware/auth.js';
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

      const updated = await artistService.updateArtistProfileById(artistId, filteredUpdates);
      res.json({ data: updated });
    } catch (error) {
      next(error);
    }
  },

  async activatePendingArtist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const artistId = req.params.artistId;
      const reviewerId = req.user?.id;

      const activated = await artistService.activatePendingArtist(artistId, reviewerId);
      res.json({ data: activated });
    } catch (error) {
      next(error);
    }
  },

  async listArtists(req: Request, res: Response, next: NextFunction) {
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
        (req.query.sortField as
          | 'stageName'
          | 'createdAt'
          | 'averageRating'
          | 'totalServices'
          | undefined) ??
        (req.query._sort as
          | 'stageName'
          | 'createdAt'
          | 'averageRating'
          | 'totalServices'
          | undefined) ??
        'createdAt';
      const sortOrder =
        (req.query.sortOrder as 'ASC' | 'DESC' | undefined) ??
        (req.query._order as 'ASC' | 'DESC' | undefined) ??
        'DESC';
      const search =
        (req.query.search as string | undefined) ?? (req.query.q as string | undefined);
      const verificationStatus = req.query.verificationStatus as
        | ArtistProfile['verificationStatus']
        | undefined;
      const isAcceptingBookings =
        req.query.isAcceptingBookings === 'true'
          ? true
          : req.query.isAcceptingBookings === 'false'
            ? false
            : undefined;

      const result = await artistService.getAllArtists({
        page: Number.isNaN(page) ? 1 : Math.max(page, 1),
        perPage: Number.isNaN(perPage) ? 25 : Math.max(perPage, 1),
        sortField,
        sortOrder,
        search,
        verificationStatus,
        isAcceptingBookings,
      });

      res.json({
        data: result.items,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  },

  async getArtist(req: Request, res: Response, next: NextFunction) {
    try {
      const artist = await artistService.getArtistDetailById(req.params.artistId);

      if (!artist) {
        res.status(404).json({ error: 'Artist not found' });
        return;
      }

      res.json({ data: artist });
    } catch (error) {
      next(error);
    }
  },

  async updateArtist(req: Request, res: Response, next: NextFunction) {
    try {
      const artistId = req.params.artistId;
      const updates = req.body ?? {};

      const allowedKeys = ['isAcceptingBookings', 'verificationStatus', 'reviewNotes'] as const;

      const filteredUpdates = allowedKeys.reduce<
        Partial<{
          isAcceptingBookings: boolean;
          verificationStatus: ArtistProfile['verificationStatus'];
          reviewNotes: string;
        }>
      >((acc, key) => {
        if (updates[key] !== undefined) {
          acc[key] = updates[key];
        }
        return acc;
      }, {});

      const updated = await artistService.updateArtistAdmin(artistId, filteredUpdates);
      res.json({ data: updated });
    } catch (error) {
      next(error);
    }
  },
};
