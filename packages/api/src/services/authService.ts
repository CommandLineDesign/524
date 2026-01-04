import * as crypto from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { and, eq, isNotNull, isNull, lt, or, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { artistProfiles, refreshTokens, userRoles, users } from '@524/database';
import { env } from '../config/env.js';
import { db } from '../db/client.js';

import type { AuthTokens, OAuthCallbackPayload, PhoneVerificationPayload } from '@524/shared/auth';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 900 seconds
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  primaryRole: string;
  phoneNumber: string;
  onboardingCompleted: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface RefreshTokenPayload {
  user_id: string;
  token_version: number;
  family_id: string;
  jti: string; // unique token identifier
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
      return null;
    }

    if (!user.email) {
      console.warn('[AuthService] Login failed - missing email', { userId: user.id });
      return null;
    }

    const primaryRole = user.roles?.[0] ?? 'customer';
    const tokenVersion = user.tokenVersion ?? 1;

    // Generate token pair with a new family ID (fresh login)
    const familyId = uuidv4();
    const { accessToken, refreshToken } = await this.generateTokenPair({
      userId: user.id,
      primaryRole,
      roles: user.roles ?? [],
      phoneNumber: user.phoneNumber ?? '',
      tokenVersion,
      familyId,
    });

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
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
    };
  }

  /**
   * Generate a pair of access and refresh tokens
   */
  private async generateTokenPair(params: {
    userId: string;
    primaryRole: string;
    roles: string[];
    phoneNumber: string;
    tokenVersion: number;
    familyId: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, primaryRole, roles, phoneNumber, tokenVersion, familyId } = params;

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      {
        user_id: userId,
        role: primaryRole,
        roles,
        phone_number: phoneNumber,
        token_version: tokenVersion,
      },
      env.JWT_SECRET || 'dev-secret',
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // Generate refresh token (longer-lived)
    const jti = uuidv4();
    const refreshToken = jwt.sign(
      {
        user_id: userId,
        token_version: tokenVersion,
        family_id: familyId,
        jti,
      } as RefreshTokenPayload,
      env.JWT_REFRESH_SECRET || env.JWT_SECRET || 'fallback-secret',
      { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` }
    );

    // Hash the refresh token for storage (don't store plain tokens)
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    // Store refresh token in database
    await db.insert(refreshTokens).values({
      userId,
      tokenHash,
      familyId,
      expiresAt,
    });

    return { accessToken, refreshToken };
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
   * Implements token rotation: old refresh token is revoked and new pair is issued
   */
  async refreshTokens(refreshTokenString: string): Promise<AuthTokens> {
    // Clean up expired and old revoked refresh tokens opportunistically
    await db
      .delete(refreshTokens)
      .where(
        or(
          lt(refreshTokens.expiresAt, new Date()),
          and(
            isNotNull(refreshTokens.revokedAt),
            lt(refreshTokens.revokedAt, sql`NOW() - INTERVAL '7 days'`)
          )
        )
      );

    // Verify the refresh token signature
    let payload: RefreshTokenPayload;
    try {
      payload = jwt.verify(
        refreshTokenString,
        env.JWT_REFRESH_SECRET || env.JWT_SECRET || 'fallback-secret'
      ) as RefreshTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw Object.assign(new Error('Refresh token expired'), {
          status: 401,
          code: 'REFRESH_TOKEN_EXPIRED',
        });
      }
      throw Object.assign(new Error('Invalid refresh token'), {
        status: 401,
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    const { user_id: userId, token_version: tokenVersion, family_id: familyId } = payload;

    // Hash the token to look it up in database
    const tokenHash = crypto.createHash('sha256').update(refreshTokenString).digest('hex');

    // Find the token in database
    const [storedToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt)
        )
      )
      .limit(1);

    if (!storedToken) {
      // Token not found or already revoked - possible token reuse attack
      // Revoke all tokens in this family as a security measure
      await this.revokeTokenFamily(familyId);
      throw Object.assign(new Error('Refresh token not found or revoked'), {
        status: 401,
        code: 'REFRESH_TOKEN_REVOKED',
      });
    }

    // Check if token has expired (belt and suspenders - JWT also checks this)
    if (storedToken.expiresAt < new Date()) {
      throw Object.assign(new Error('Refresh token expired'), {
        status: 401,
        code: 'REFRESH_TOKEN_EXPIRED',
      });
    }

    // Get the user to verify token version and get current data
    const user = await this.getUserById(userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), {
        status: 401,
        code: 'USER_NOT_FOUND',
      });
    }

    // Check if user has been banned
    if (user.isBanned) {
      throw Object.assign(new Error('Account banned'), {
        status: 403,
        code: 'ACCOUNT_BANNED',
      });
    }

    // Verify token version matches (allows forced logout by incrementing user's tokenVersion)
    if (user.tokenVersion !== tokenVersion) {
      // Token version mismatch - user has been logged out on all devices
      await this.revokeTokenFamily(familyId);
      throw Object.assign(new Error('Session invalidated'), {
        status: 401,
        code: 'SESSION_INVALIDATED',
      });
    }

    // Revoke the old refresh token (token rotation)
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, storedToken.id));

    // Generate new token pair with same family ID
    const primaryRole = user.roles?.[0] ?? 'customer';
    const { accessToken, refreshToken } = await this.generateTokenPair({
      userId: user.id,
      primaryRole,
      roles: user.roles ?? [],
      phoneNumber: user.phoneNumber ?? '',
      tokenVersion: user.tokenVersion ?? 1,
      familyId, // Keep same family for tracking
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
    };
  }

  /**
   * Revoke all refresh tokens for a user (logout from all devices)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));

    // Also increment token version to invalidate any tokens not yet in database
    await db
      .update(users)
      .set({ tokenVersion: sql`${users.tokenVersion} + 1` })
      .where(eq(users.id, userId));
  }

  /**
   * Revoke all tokens in a family (for detecting token reuse attacks)
   */
  async revokeTokenFamily(familyId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.familyId, familyId), isNull(refreshTokens.revokedAt)));
  }

  /**
   * Revoke a specific refresh token (single device logout)
   */
  async revokeRefreshToken(refreshTokenString: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(refreshTokenString).digest('hex');
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }
}
