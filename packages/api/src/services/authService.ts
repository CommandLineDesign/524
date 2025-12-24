import * as bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import { artistProfiles, userRoles, users } from '@524/database';
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
    onboardingCompleted: boolean;
  };
  token: string;
}

export class AuthService {
  /**
   * Register a user with email + password
   */
  async registerWithEmail(params: {
    email: string;
    password: string;
    role: 'customer' | 'artist';
    name?: string;
    phoneNumber?: string | null;
    birthYear?: number | null;
  }): Promise<LoginResponse> {
    const email = params.email.trim().toLowerCase();
    const password = params.password;
    const role = params.role;

    if (!this.isValidEmail(email)) {
      throw Object.assign(new Error('Invalid email'), { status: 400 });
    }

    if (!this.isValidPassword(password)) {
      throw Object.assign(
        new Error('Password must be at least 8 characters and include a letter and number'),
        {
          status: 400,
        }
      );
    }

    // Ensure email is unique
    const [existingEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingEmail) {
      throw Object.assign(new Error('Email already in use'), { status: 409, code: 'EMAIL_IN_USE' });
    }

    // Ensure phone number is unique (if provided)
    if (params.phoneNumber?.trim()) {
      const normalizedPhone = params.phoneNumber.replace(/[-\s]/g, '');
      const [existingPhone] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.phoneNumber, normalizedPhone))
        .limit(1);
      if (existingPhone) {
        throw Object.assign(new Error('Phone number already in use'), {
          status: 409,
          code: 'PHONE_IN_USE',
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const name = params.name?.trim() || email.split('@')[0] || 'New user';

    const newUser: Partial<typeof users.$inferInsert> = {
      email,
      passwordHash,
      name,
      role,
      phoneVerified: false,
      isActive: true,
      isVerified: false,
    };

    if (params.phoneNumber?.trim()) {
      newUser.phoneNumber = params.phoneNumber.trim();
    }

    if (params.birthYear) {
      newUser.birthYear = params.birthYear;
    }

    const createdUserId = await db.transaction(async (tx) => {
      const [createdUser] = await tx
        .insert(users)
        .values(newUser as typeof users.$inferInsert)
        .returning({
          id: users.id,
        });

      if (!createdUser) {
        throw Object.assign(new Error('Failed to create user'), { status: 500 });
      }

      await tx
        .insert(userRoles)
        .values({
          userId: createdUser.id,
          role,
        })
        .onConflictDoNothing();

      if (role === 'artist') {
        const safeStageName = name || 'New Artist';
        await tx.insert(artistProfiles).values({
          userId: createdUser.id,
          stageName: safeStageName,
          yearsExperience: 0,
          serviceRadiusKm: '0',
          primaryLocation: {
            latitude: 0,
            longitude: 0,
          },
          verificationStatus: 'pending_review',
          isAcceptingBookings: false,
        });
      }

      return createdUser.id;
    });

    // Reuse login flow to issue token
    const loginResult = await this.loginWithEmail(email, password);
    if (!loginResult) {
      throw Object.assign(new Error('Login failed after signup'), { status: 500 });
    }
    return loginResult;
  }

  /**
   * Check if email and/or phone number are available for registration
   */
  async checkAvailability(params: {
    email?: string;
    phoneNumber?: string;
  }): Promise<{ emailAvailable: boolean; phoneAvailable: boolean }> {
    let emailAvailable = true;
    let phoneAvailable = true;

    if (params.email?.trim()) {
      const normalizedEmail = params.email.trim().toLowerCase();
      const [existingEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);
      emailAvailable = !existingEmail;
    }

    if (params.phoneNumber?.trim()) {
      const normalizedPhone = params.phoneNumber.replace(/[-\s]/g, '');
      const [existingPhone] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.phoneNumber, normalizedPhone))
        .limit(1);
      phoneAvailable = !existingPhone;
    }

    return { emailAvailable, phoneAvailable };
  }

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  private isValidPassword(password: string) {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  }

  /**
   * Login with email and password
   */
  async loginWithEmail(email: string, password: string): Promise<LoginResponse | null> {
    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email with roles
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phoneNumber: users.phoneNumber,
        passwordHash: users.passwordHash,
        onboardingCompleted: users.onboardingCompleted,
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
      .where(eq(users.email, normalizedEmail))
      .groupBy(users.id)
      .limit(1);

    if (!user) {
      console.warn('[AuthService] Login failed - user not found', { email: normalizedEmail });
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
      console.warn('[AuthService] Login failed - invalid password', { email: normalizedEmail });
      return null;
    }

    // Generate JWT token
    const primaryRole = user.roles?.[0] ?? 'customer';

    const token = jwt.sign(
      {
        user_id: user.id,
        role: primaryRole,
        roles: user.roles ?? [],
        phone_number: user.phoneNumber ?? '',
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
        phoneNumber: user.phoneNumber ?? '',
        onboardingCompleted: Boolean(user.onboardingCompleted),
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
