import { eq } from 'drizzle-orm';

import {
  type NewNotificationPreference,
  type NotificationPreference,
  notificationPreferences,
} from '@524/database';

import { db } from '../db/client.js';

export class NotificationPreferenceRepository {
  async findByUserId(userId: string): Promise<NotificationPreference | null> {
    const [record] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);
    return record ?? null;
  }

  async create(data: NewNotificationPreference): Promise<NotificationPreference> {
    const [record] = await db.insert(notificationPreferences).values(data).returning();
    return record;
  }

  async update(
    userId: string,
    data: Partial<Omit<NotificationPreference, 'id' | 'userId' | 'createdAt'>>
  ): Promise<NotificationPreference | null> {
    const [record] = await db
      .update(notificationPreferences)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.userId, userId))
      .returning();
    return record ?? null;
  }

  async upsert(
    userId: string,
    data: Partial<Omit<NotificationPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<NotificationPreference> {
    const existing = await this.findByUserId(userId);

    if (existing) {
      const updated = await this.update(userId, data);
      if (!updated) {
        throw new Error(`Failed to update notification preferences for user ${userId}`);
      }
      return updated;
    }

    return this.create({ userId, ...data });
  }
}
