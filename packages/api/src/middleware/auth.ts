import { userRoles, users } from '@524/database';
import { eq, sql } from 'drizzle-orm';
// Authentication middleware with mock support
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { MOCK_USERS, MockUser } from '../auth/mock-auth.js';
import { env } from '../config/env.js';
import { features } from '../config/features.js';
import { db } from '../db/client.js';
import { AuthService } from '../services/authService.js';
import { hasAllowedRole, selectPrimaryRole } from '../utils/roleHelpers.js';

const authService = new AuthService();

export interface AuthRequest extends Request {
  user?:
    | MockUser
    | {
        id: string;
        email: string;
        name: string;
        roles: string[];
        primaryRole: string;
        phoneNumber: string;
      }
    | (MockUser & { roles?: string[]; primaryRole?: string });
}

interface TokenPayload {
  user_id: string;
  role: 'customer' | 'artist' | 'admin' | 'support';
  roles?: string[];
  phone_number: string;
  token_version?: number;
  mock?: boolean;
}

/**
 * Main authentication middleware
 * Supports both mock and real authentication based on feature flag
 */
export function requireAuth(allowedRoles?: ('customer' | 'artist' | 'admin' | 'support')[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Check for Authorization header
      const authHeader = req.headers.authorization;

      // Mock auth: Allow special header for easy testing
      if (!features.USE_REAL_AUTH && req.headers['x-mock-user-id']) {
        const mockUserId = req.headers['x-mock-user-id'] as string;
        const mockUser = MOCK_USERS[mockUserId];

        if (!mockUser) {
          return res.status(401).json({
            error: 'Invalid mock user ID',
            available_users: Object.keys(MOCK_USERS),
          });
        }

        // Check role if specified
        if (allowedRoles && !allowedRoles.includes(mockUser.role)) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            required_roles: allowedRoles,
            your_role: mockUser.role,
          });
        }

        req.user = {
          ...mockUser,
          roles: [mockUser.role],
          primaryRole: mockUser.role,
        };
        return next();
      }

      // Standard JWT authentication
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'No token provided',
          hint: features.USE_REAL_AUTH
            ? 'Include Authorization: Bearer <token> header'
            : 'Use x-mock-user-id header or POST /api/v1/auth/mock/login',
        });
      }

      const token = authHeader.split('Bearer ')[1];

      // Verify JWT
      const decoded = jwt.verify(token, env.JWT_SECRET || 'dev-secret') as TokenPayload;

      // For mock tokens, get user from MOCK_USERS
      if (decoded.mock && !features.USE_REAL_AUTH) {
        const mockUser = MOCK_USERS[decoded.user_id];
        if (!mockUser) {
          return res.status(401).json({ error: 'Mock user not found' });
        }
        req.user = {
          ...mockUser,
          roles: [mockUser.role],
          primaryRole: mockUser.role,
        };
      } else {
        // Real auth: fetch user from database
        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            phoneNumber: users.phoneNumber,
            isBanned: users.isBanned,
            banReason: users.banReason,
            bannedAt: users.bannedAt,
            tokenVersion: users.tokenVersion,
            roles: sql<
              string[]
            >`coalesce(array_agg(distinct ${userRoles.role})::text[], ARRAY[]::text[])`,
          })
          .from(users)
          .leftJoin(userRoles, eq(users.id, userRoles.userId))
          .where(eq(users.id, decoded.user_id))
          .groupBy(users.id);

        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }

        if (user.isBanned) {
          return res.status(403).json({
            error: 'Account banned',
            reason: user.banReason,
            bannedAt: user.bannedAt,
          });
        }

        const tokenVersionFromToken = decoded.token_version ?? 1;
        const tokenVersionFromDb = user.tokenVersion ?? 1;
        if (tokenVersionFromToken !== tokenVersionFromDb) {
          return res.status(401).json({
            error: 'Session invalidated',
            code: 'SESSION_INVALIDATED',
            message: 'Please log in again.',
          });
        }

        const roles = user.roles ?? [];
        req.user = {
          id: user.id,
          email: user.email || '',
          name: user.name,
          roles,
          primaryRole: selectPrimaryRole(roles),
          phoneNumber: user.phoneNumber ?? '',
        };
      }

      // Check role permissions
      if (allowedRoles) {
        if (!req.user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const userRolesList = (req.user as { roles?: string[] }).roles ?? [];
        if (!hasAllowedRole(userRolesList, allowedRoles)) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            required_roles: allowedRoles,
            your_roles: userRolesList,
          });
        }
      }

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          error: 'Invalid token',
          code: 'TOKEN_INVALID',
        });
      }
      if (error instanceof jwt.TokenExpiredError) {
        // This code tells the frontend to attempt a token refresh
        return res.status(401).json({
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
        });
      }
      return res.status(500).json({
        error: 'Authentication failed',
        code: 'AUTH_ERROR',
      });
    }
  };
}

/**
 * Optional auth - doesn't fail if no token, but populates user if present
 */
export function optionalAuth() {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return next();
      }

      // Use the same logic as requireAuth but don't fail
      return requireAuth()(req, res, next);
    } catch (error) {
      // Continue without user
      next();
    }
  };
}

/**
 * Require specific role
 */
export function requireRole(role: 'customer' | 'artist' | 'admin' | 'support') {
  return requireAuth([role]);
}

/**
 * Require customer role
 */
export const requireCustomer = () => requireRole('customer');

/**
 * Require artist role
 */
export const requireArtist = () => requireRole('artist');

/**
 * Require admin role
 */
export const requireAdmin = () => requireRole('admin');
