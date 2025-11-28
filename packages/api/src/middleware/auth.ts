// Authentication middleware with mock support
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { features } from '../config/features.js';
import { MOCK_USERS, MockUser } from '../auth/mock-auth.js';
import { AuthService } from '../services/authService.js';

const authService = new AuthService();

export interface AuthRequest extends Request {
  user?: MockUser | {
    id: string;
    email: string;
    name: string;
    role: string;
    phoneNumber: string;
  };
}

interface TokenPayload {
  user_id: string;
  role: 'customer' | 'artist' | 'admin';
  phone_number: string;
  mock?: boolean;
}

/**
 * Main authentication middleware
 * Supports both mock and real authentication based on feature flag
 */
export function requireAuth(allowedRoles?: ('customer' | 'artist' | 'admin')[]) {
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
        
        req.user = mockUser;
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
      const decoded = jwt.verify(
        token, 
        env.JWT_SECRET || 'dev-secret'
      ) as TokenPayload;
      
      // For mock tokens, get user from MOCK_USERS
      if (decoded.mock && !features.USE_REAL_AUTH) {
        const mockUser = MOCK_USERS[decoded.user_id];
        if (!mockUser) {
          return res.status(401).json({ error: 'Mock user not found' });
        }
        req.user = mockUser;
      } else {
        // Real auth: fetch user from database
        const user = await authService.getUserById(decoded.user_id);
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }
        req.user = {
          id: user.id,
          email: user.email || '',
          name: user.name,
          role: user.role,
          phoneNumber: user.phoneNumber,
        };
      }
      
      // Check role permissions
      if (allowedRoles && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required_roles: allowedRoles,
          your_role: req.user.role,
        });
      }
      
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(500).json({ error: 'Authentication failed' });
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
export function requireRole(role: 'customer' | 'artist' | 'admin') {
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

