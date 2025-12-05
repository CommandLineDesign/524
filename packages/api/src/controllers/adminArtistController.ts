import type { NextFunction, Request, Response } from 'express';

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
};
