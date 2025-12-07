import * as bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import { userRoles, users } from '@524/database';
import { env } from '../config/env.js';
import { db } from '../db/client.js';

import type { AuthTokens, OAuthCallbackPayload, PhoneVerificationPayload } from '@524/shared/auth';

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    primaryRole: string;
    phoneNumber: string;
  };
  token: string;
}

export class AuthService {
  /**
   * Login with email and password
   */
  async loginWithEmail(email: string, password: string): Promise<LoginResponse | null> {
    // Find user by email with roles
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phoneNumber: users.phoneNumber,
        passwordHash: users.passwordHash,
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
      .where(eq(users.email, email))
      .groupBy(users.id)
      .limit(1);

    if (!user) {
      console.warn('[AuthService] Login failed - user not found', { email });
      return null;
    }

    if (user.isBanned) {
      const error = Object.assign(new Error('Account banned'), {
        status: 403,
        code: 'ACCOUNT_BANNED',
        reason: user.banReason,
        bannedAt: user.bannedAt,
      });
      throw error;
    }

    // Check if user has a password hash
    if (!user.passwordHash) {
      throw new Error('Password authentication not configured for this user');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      console.warn('[AuthService] Login failed - invalid password', { email });
      return null;
    }

    // Generate JWT token
    const primaryRole = user.roles?.[0] ?? 'customer';

    const token = jwt.sign(
      {
        user_id: user.id,
        role: primaryRole,
        roles: user.roles ?? [],
        phone_number: user.phoneNumber,
        token_version: user.tokenVersion ?? 1,
      },
      env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );

    if (!user.email) {
      console.warn('[AuthService] Login failed - missing email', { userId: user.id });
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles ?? [],
        primaryRole,
        phoneNumber: user.phoneNumber,
      },
      token,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
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
      .where(eq(users.id, userId))
      .groupBy(users.id)
      .limit(1);

    return user;
  }

  /**
   * Send OTP to phone number
   * TODO: Implement with SENS or other OTP provider
   */
  async sendOtp(_phoneNumber: string): Promise<void> {
    // TODO: Implement OTP sending via SENS
    console.log('[AuthService] sendOtp not yet implemented');
  }

  /**
   * Verify OTP code
   * TODO: Implement with SENS or other OTP provider
   */
  async verifyOtp(_payload: PhoneVerificationPayload): Promise<AuthTokens> {
    // TODO: Implement OTP verification
    throw new Error('OTP verification not yet implemented');
  }

  /**
   * Handle OAuth callback
   * TODO: Implement with Kakao, Naver, Apple, Google
   */
  async handleOAuthCallback(_payload: OAuthCallbackPayload): Promise<AuthTokens> {
    // TODO: Implement OAuth callback handling
    throw new Error('OAuth callback not yet implemented');
  }

  /**
   * Refresh access token using refresh token
   * TODO: Implement refresh token logic
   */
  async refreshTokens(_refreshToken: string): Promise<AuthTokens> {
    // TODO: Implement token refresh
    throw new Error('Token refresh not yet implemented');
  }
}
