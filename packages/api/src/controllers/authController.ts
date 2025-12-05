import type { NextFunction, Request, Response } from 'express';

import { AuthService } from '../services/authService.js';

const authService = new AuthService();

export const AuthController = {
  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.sendOtp(req.body.phoneNumber);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyOtp({
        phoneNumber: req.body.phoneNumber,
        code: req.body.code,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async oauthCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.handleOAuthCallback({
        provider: req.body.provider,
        code: req.body.code,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async refreshTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.refreshTokens(req.body.refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
