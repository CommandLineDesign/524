import type { DevicePlatform } from '@524/database';

import { DeviceTokenRepository } from '../repositories/deviceTokenRepository.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('device-token-service');

export interface RegisterDevicePayload {
  userId: string;
  token: string;
  platform: DevicePlatform;
  deviceId?: string;
  appVersion?: string;
}

export class DeviceTokenService {
  constructor(private readonly repository = new DeviceTokenRepository()) {}

  async registerDevice(payload: RegisterDevicePayload) {
    logger.info({ userId: payload.userId, platform: payload.platform }, 'Registering device token');

    const deviceToken = await this.repository.upsertToken({
      userId: payload.userId,
      token: payload.token,
      platform: payload.platform,
      deviceId: payload.deviceId,
      appVersion: payload.appVersion,
    });

    logger.info(
      { userId: payload.userId, deviceId: deviceToken.id },
      'Device token registered successfully'
    );

    return {
      id: deviceToken.id,
      platform: deviceToken.platform,
      registeredAt: deviceToken.createdAt,
    };
  }

  async unregisterDevice(userId: string, token: string): Promise<void> {
    logger.info({ userId }, 'Unregistering device token');
    await this.repository.removeToken(userId, token);
  }

  async unregisterAllDevices(userId: string): Promise<void> {
    logger.info({ userId }, 'Unregistering all device tokens');
    await this.repository.deactivateAllForUser(userId);
  }

  async getActiveTokensForUser(userId: string): Promise<string[]> {
    const tokens = await this.repository.findActiveByUserId(userId);
    return tokens.map((t) => t.token);
  }

  async handleInvalidToken(token: string): Promise<void> {
    logger.warn({ token: `${token.substring(0, 20)}...` }, 'Marking token as invalid');
    await this.repository.deactivateToken(token);
  }
}
