import type { NextFunction, Response } from 'express';
import { z } from 'zod';

import type { AuthRequest } from '../middleware/auth.js';
import { DeviceTokenService } from '../services/deviceTokenService.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('device-controller');

const deviceTokenService = new DeviceTokenService();

const registerDeviceSchema = z.object({
  token: z.string().min(1, 'Token is required').max(512),
  platform: z.enum(['ios', 'android', 'web']),
  deviceId: z.string().max(255).optional(),
  appVersion: z.string().max(50).optional(),
});

const unregisterDeviceSchema = z.object({
  token: z.string().min(1, 'Token is required').max(512),
});

export const DeviceController = {
  async registerDevice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const parsed = registerDeviceSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Invalid request',
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await deviceTokenService.registerDevice({
        userId,
        token: parsed.data.token,
        platform: parsed.data.platform,
        deviceId: parsed.data.deviceId,
        appVersion: parsed.data.appVersion,
      });

      logger.info({ userId, platform: parsed.data.platform }, 'Device registered');

      res.status(201).json({
        success: true,
        device: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async unregisterDevice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const parsed = unregisterDeviceSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Invalid request',
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      await deviceTokenService.unregisterDevice(userId, parsed.data.token);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async unregisterAllDevices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      await deviceTokenService.unregisterAllDevices(userId);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
};
