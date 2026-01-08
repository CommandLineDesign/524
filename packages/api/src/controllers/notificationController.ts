import type { NextFunction, Response } from 'express';
import { z } from 'zod';

import type { AuthRequest } from '../middleware/auth.js';
import { NotificationRepository } from '../repositories/notificationRepository.js';
import { NotificationPreferenceService } from '../services/notificationPreferenceService.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('notification-controller');

const notificationPreferenceService = new NotificationPreferenceService();
const notificationRepository = new NotificationRepository();

const updatePreferencesSchema = z.object({
  bookingCreated: z.boolean().optional(),
  bookingConfirmed: z.boolean().optional(),
  bookingDeclined: z.boolean().optional(),
  bookingCancelled: z.boolean().optional(),
  bookingInProgress: z.boolean().optional(),
  bookingCompleted: z.boolean().optional(),
  newMessage: z.boolean().optional(),
  marketing: z.boolean().optional(),
});

const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const NotificationController = {
  async getPreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const preferences = await notificationPreferenceService.getPreferences(userId);

      res.json({
        preferences: {
          bookingCreated: preferences.bookingCreated,
          bookingConfirmed: preferences.bookingConfirmed,
          bookingDeclined: preferences.bookingDeclined,
          bookingCancelled: preferences.bookingCancelled,
          bookingInProgress: preferences.bookingInProgress,
          bookingCompleted: preferences.bookingCompleted,
          newMessage: preferences.newMessage,
          marketing: preferences.marketing,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const parsed = updatePreferencesSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Invalid request',
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const preferences = await notificationPreferenceService.updatePreferences(
        userId,
        parsed.data
      );

      logger.info({ userId }, 'Notification preferences updated');

      res.json({
        preferences: {
          bookingCreated: preferences.bookingCreated,
          bookingConfirmed: preferences.bookingConfirmed,
          bookingDeclined: preferences.bookingDeclined,
          bookingCancelled: preferences.bookingCancelled,
          bookingInProgress: preferences.bookingInProgress,
          bookingCompleted: preferences.bookingCompleted,
          newMessage: preferences.newMessage,
          marketing: preferences.marketing,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const parsed = paginationSchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Invalid request',
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const [notifications, total] = await Promise.all([
        notificationRepository.findByUserId(userId, {
          limit: parsed.data.limit,
          offset: parsed.data.offset,
        }),
        notificationRepository.countByUserId(userId),
      ]);

      res.json({
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          data: n.data,
          readAt: n.readAt,
          createdAt: n.createdAt,
        })),
        total,
        hasMore: parsed.data.offset + notifications.length < total,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const count = await notificationRepository.getUnreadCount(userId);

      res.json({ unreadCount: count });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Notification ID is required' });
        return;
      }

      // Verify notification belongs to user
      const notification = await notificationRepository.findById(id);
      if (!notification) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }

      if (notification.userId !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const updated = await notificationRepository.markAsRead(id);
      if (!updated) {
        res.status(404).json({ error: 'Failed to update notification' });
        return;
      }

      res.json({
        notification: {
          id: updated.id,
          type: updated.type,
          title: updated.title,
          body: updated.body,
          data: updated.data,
          readAt: updated.readAt,
          createdAt: updated.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const count = await notificationRepository.markAllAsRead(userId);

      logger.info({ userId, count }, 'Marked all notifications as read');

      res.json({ success: true, markedCount: count });
    } catch (error) {
      next(error);
    }
  },
};
