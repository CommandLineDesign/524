import { and, count, desc, eq, isNull } from 'drizzle-orm';

import { type NewNotification, type Notification, notifications } from '@524/database';

import { db } from '../db/client.js';

export class NotificationRepository {
  async create(data: NewNotification): Promise<Notification> {
    const [record] = await db.insert(notifications).values(data).returning();
    return record;
  }

  async findById(id: string): Promise<Notification | null> {
    const [record] = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
    return record ?? null;
  }

  async findByUserId(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<Notification[]> {
    const { limit = 20, offset = 0 } = options;

    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async countByUserId(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(eq(notifications.userId, userId));

    return result?.count ?? 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));

    return result?.count ?? 0;
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const [record] = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return record ?? null;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)))
      .returning({ id: notifications.id });

    return result.length;
  }
}
