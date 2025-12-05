import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import { users } from '@524/database';
import { env } from '../config/env.js';
import { db } from '../db/client.js';

import type { AuthTokens, OAuthCallbackPayload, PhoneVerificationPayload } from '@524/shared/auth';

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    phoneNumber: string;
  };
  token: string;
}

export class AuthService {
  /**
   * Login with email and password
   */
  async loginWithEmail(email: string, password: string): Promise<LoginResponse | null> {
    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      console.warn('[AuthService] Login failed - user not found', { email });
      return null;
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
    const token = jwt.sign(
      {
        user_id: user.id,
        role: user.role,
        phone_number: user.phoneNumber,
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
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
      token,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

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
