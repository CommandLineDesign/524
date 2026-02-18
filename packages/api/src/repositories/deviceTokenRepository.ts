import { and, eq, inArray, lt } from 'drizzle-orm';

import { type DevicePlatform, type DeviceToken, deviceTokens } from '@524/database';
import { addUTCDays } from '@524/shared';

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

    // Log only a hash suffix to avoid exposing token content
    const tokenHash = token.length > 8 ? token.slice(-8) : '***';
    logger.info({ tokenSuffix: tokenHash }, 'Device token deactivated');
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

  /**
   * Deactivate tokens that haven't been used in the specified number of days.
   * This helps clean up stale tokens from devices that are no longer active.
   * @param daysInactive Number of days of inactivity before deactivation (default: 30)
   * @returns Number of tokens deactivated
   */
  async deactivateStaleTokens(daysInactive = 30): Promise<number> {
    const cutoffDate = addUTCDays(new Date(), -daysInactive);

    const result = await db
      .update(deviceTokens)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(deviceTokens.isActive, true), lt(deviceTokens.lastUsedAt, cutoffDate)))
      .returning({ id: deviceTokens.id });

    const count = result.length;
    if (count > 0) {
      logger.info({ count, daysInactive }, 'Deactivated stale device tokens');
    }

    return count;
  }

  /**
   * Delete tokens that have been inactive for a long period.
   * Call this periodically to clean up old records.
   * @param daysInactive Number of days of inactivity before deletion (default: 90)
   * @returns Number of tokens deleted
   */
  async deleteStaleTokens(daysInactive = 90): Promise<number> {
    const cutoffDate = addUTCDays(new Date(), -daysInactive);

    const result = await db
      .delete(deviceTokens)
      .where(and(eq(deviceTokens.isActive, false), lt(deviceTokens.updatedAt, cutoffDate)))
      .returning({ id: deviceTokens.id });

    const count = result.length;
    if (count > 0) {
      logger.info({ count, daysInactive }, 'Deleted old inactive device tokens');
    }

    return count;
  }
}
