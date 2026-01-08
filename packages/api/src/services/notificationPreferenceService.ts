import type { NotificationPreference } from '@524/database';

import { NotificationPreferenceRepository } from '../repositories/notificationPreferenceRepository.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('notification-preference-service');

export type NotificationPreferenceUpdate = Partial<
  Pick<
    NotificationPreference,
    | 'bookingCreated'
    | 'bookingConfirmed'
    | 'bookingDeclined'
    | 'bookingCancelled'
    | 'bookingInProgress'
    | 'bookingCompleted'
    | 'newMessage'
    | 'marketing'
  >
>;

export class NotificationPreferenceService {
  constructor(private readonly repository = new NotificationPreferenceRepository()) {}

  async getPreferences(userId: string): Promise<NotificationPreference> {
    logger.debug({ userId }, 'Getting notification preferences');

    const existing = await this.repository.findByUserId(userId);
    if (existing) {
      return existing;
    }

    // Create default preferences if none exist
    logger.info({ userId }, 'Creating default notification preferences');
    return this.repository.create({ userId });
  }

  async updatePreferences(
    userId: string,
    updates: NotificationPreferenceUpdate
  ): Promise<NotificationPreference> {
    logger.info({ userId, updates }, 'Updating notification preferences');

    return this.repository.upsert(userId, updates);
  }

  async isNotificationEnabled(userId: string, notificationType: string): Promise<boolean> {
    const prefs = await this.getPreferences(userId);

    const typeToPreference: Record<string, keyof NotificationPreference> = {
      booking_created: 'bookingCreated',
      booking_confirmed: 'bookingConfirmed',
      booking_declined: 'bookingDeclined',
      booking_cancelled: 'bookingCancelled',
      booking_in_progress: 'bookingInProgress',
      booking_completed: 'bookingCompleted',
      new_message: 'newMessage',
      marketing: 'marketing',
    };

    const prefKey = typeToPreference[notificationType];
    if (!prefKey) {
      // Unknown notification types are enabled by default
      return true;
    }

    return Boolean(prefs[prefKey]);
  }
}
