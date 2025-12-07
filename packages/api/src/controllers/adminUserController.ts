import type { NextFunction, Request, Response } from 'express';

import type { AuthRequest } from '../middleware/auth.js';
import { UserService } from '../services/userService.js';

const userService = new UserService();

export const AdminUserController = {
  async listUsers(req: Request, res: Response, next: NextFunction) {
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
        (req.query.sortField as 'createdAt' | 'name' | 'email' | undefined) ??
        (req.query._sort as 'createdAt' | 'name' | 'email' | undefined) ??
        'createdAt';
      const sortOrder =
        (req.query.sortOrder as 'ASC' | 'DESC' | undefined) ??
        (req.query._order as 'ASC' | 'DESC' | undefined) ??
        'DESC';
      const role = req.query.role as 'customer' | 'artist' | 'admin' | 'support' | undefined;
      const search = req.query.search as string | undefined;

      const result = await userService.getUsers({
        page: Number.isNaN(page) ? 1 : Math.max(page, 1),
        perPage: Number.isNaN(perPage) ? 25 : Math.max(perPage, 1),
        sortField,
        sortOrder,
        role,
        search,
      });

      res.json({
        data: result.items,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { name, email, phoneNumber, isActive, isVerified } = req.body;

      const updates: {
        name?: string;
        email?: string | null;
        phoneNumber?: string;
        isActive?: boolean;
        isVerified?: boolean;
      } = {};

      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email === '' ? null : email;
      if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
      if (isActive !== undefined) updates.isActive = isActive;
      if (isVerified !== undefined) updates.isVerified = isVerified;

      const updated = await userService.updateUser(req.params.id, updates, req.user.id);

      res.json({ data: updated });
    } catch (error) {
      next(error);
    }
  },
};
