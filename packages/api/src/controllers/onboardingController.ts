import type { NextFunction, Response } from 'express';

import type { AuthRequest } from '../middleware/auth.js';
import { OnboardingService } from '../services/onboardingService.js';

const onboardingService = new OnboardingService();

export const OnboardingController = {
  async getState(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const state = await onboardingService.getState(req.user.id);
      res.json(state);
    } catch (error) {
      next(error);
    }
  },

  async saveResponse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const payload = req.body;
      if (!payload?.step) {
        res.status(400).json({ error: 'Missing onboarding step' });
        return;
      }

      const state = await onboardingService.upsertResponse(req.user.id, payload);
      res.status(201).json(state);
    } catch (error) {
      next(error);
    }
  },

  async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const state = await onboardingService.markComplete(req.user.id);
      res.json(state);
    } catch (error) {
      next(error);
    }
  },
};
