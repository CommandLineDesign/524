import { and, eq, inArray } from 'drizzle-orm';

import { type DevicePlatform, type DeviceToken, deviceTokens } from '@524/database';

import { db } from '../db/client.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('device-token-repository');

export class DeviceTokenRepository {
  async upsertToken(data: {
    userId: string;
    token: string;
    platform: DevicePlatform;
    deviceId?: string;
    appVersion?: string;
  }): Promise<DeviceToken> {
    const { userId, token, platform, deviceId, appVersion } = data;

    // If deviceId provided, update existing record for that device
    if (deviceId) {
      const existing = await this.findByDeviceId(userId, deviceId);
      if (existing) {
        const [updated] = await db
          .update(deviceTokens)
          .set({
            token,
            platform,
            appVersion,
            isActive: true,
            lastUsedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(deviceTokens.id, existing.id))
          .returning();
        return updated;
      }
    }

    // Check if token already exists
    const existingToken = await this.findByToken(token);
    if (existingToken) {
      // Update ownership if token belongs to different user
      const [updated] = await db
        .update(deviceTokens)
        .set({
          userId,
          platform,
          deviceId,
          appVersion,
          isActive: true,
          lastUsedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(deviceTokens.id, existingToken.id))
        .returning();
      return updated;
    }

    // Insert new token
    const [record] = await db
      .insert(deviceTokens)
      .values({
        userId,
        token,
        platform,
        deviceId,
        appVersion,
        isActive: true,
        lastUsedAt: new Date(),
      })
      .returning();

    return record;
  }

  async findActiveByUserId(userId: string): Promise<DeviceToken[]> {
    return db
      .select()
      .from(deviceTokens)
      .where(and(eq(deviceTokens.userId, userId), eq(deviceTokens.isActive, true)));
  }

  async findByToken(token: string): Promise<DeviceToken | null> {
    const [record] = await db
      .select()
      .from(deviceTokens)
      .where(eq(deviceTokens.token, token))
      .limit(1);
    return record ?? null;
  }

  async findByDeviceId(userId: string, deviceId: string): Promise<DeviceToken | null> {
    const [record] = await db
      .select()
      .from(deviceTokens)
      .where(and(eq(deviceTokens.userId, userId), eq(deviceTokens.deviceId, deviceId)))
      .limit(1);
    return record ?? null;
  }

  async deactivateToken(token: string): Promise<void> {
    await db
      .update(deviceTokens)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(deviceTokens.token, token));

    logger.info({ token: `${token.substring(0, 20)}...` }, 'Device token deactivated');
  }

  async deactivateAllForUser(userId: string): Promise<void> {
    await db
      .update(deviceTokens)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(deviceTokens.userId, userId));
  }

  async removeToken(userId: string, token: string): Promise<void> {
    await db
      .delete(deviceTokens)
      .where(and(eq(deviceTokens.userId, userId), eq(deviceTokens.token, token)));
  }

  async touchToken(token: string): Promise<void> {
    await db
      .update(deviceTokens)
      .set({ lastUsedAt: new Date(), updatedAt: new Date() })
      .where(eq(deviceTokens.token, token));
  }

  async findActiveByUserIds(userIds: string[]): Promise<DeviceToken[]> {
    if (userIds.length === 0) return [];

    return db
      .select()
      .from(deviceTokens)
      .where(and(eq(deviceTokens.isActive, true), inArray(deviceTokens.userId, userIds)));
  }
}
