import crypto from 'crypto';

import type { User } from '@524/database';
import type { AuthTokens, OAuthCallbackPayload, PhoneVerificationPayload } from '@524/shared/auth';

import { createLogger } from '../../utils/logger.js';

const logger = createLogger('auth:strategy');

export class KoreanAuthStrategy {
  async authenticateWithPhone(payload: PhoneVerificationPayload): Promise<User> {
    logger.info({ phoneNumber: payload.phoneNumber }, 'Phone verification request received');
    return this.findOrCreateUser({ phoneNumber: payload.phoneNumber });
  }

  async authenticateWithOAuth(payload: OAuthCallbackPayload): Promise<User> {
    logger.info({ provider: payload.provider }, 'OAuth callback handled');
    return this.findOrCreateUser({ oauthProvider: payload.provider, oauthId: payload.code });
  }

  async refreshTokens(_refreshToken: string): Promise<AuthTokens> {
    return {
      accessToken: `access-${crypto.randomUUID()}`,
      refreshToken: `refresh-${crypto.randomUUID()}`,
      expiresIn: 60 * 60
    };
  }

  generateTokenPair(user: User): AuthTokens {
    return {
      accessToken: `access-${user.id}`,
      refreshToken: `refresh-${user.id}`,
      expiresIn: 60 * 60
    };
  }

  private async findOrCreateUser(props: {
    phoneNumber?: string;
    oauthProvider?: string;
    oauthId?: string;
  }): Promise<User> {
    // TODO: integrate with real persistence layer
    return {
      id: crypto.randomUUID(),
      phoneNumber: props.phoneNumber ?? '000-0000-0000',
      phoneVerified: true,
      role: 'customer',
      name: 'Pending User',
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      firebaseUid: null,
      kakaoId: props.oauthProvider === 'kakao' ? props.oauthId ?? null : null,
      naverId: props.oauthProvider === 'naver' ? props.oauthId ?? null : null,
      appleId: props.oauthProvider === 'apple' ? props.oauthId ?? null : null,
      email: null,
      profileImageUrl: null,
      birthYear: null,
      gender: null,
      language: 'ko',
      timezone: 'Asia/Seoul',
      notificationPreferences: null,
      deactivatedAt: null
    } as unknown as User;
  }
}

