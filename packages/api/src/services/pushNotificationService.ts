import {
  type ExpoPushMessage,
  type ExpoPushTicket,
  type PushPayload,
  type SendResult,
  chunkArray,
  isInvalidTokenError,
  sendExpoPushNotifications,
} from '@524/notifications';

import { features } from '../config/features.js';
import { DeviceTokenRepository } from '../repositories/deviceTokenRepository.js';
import { createLogger } from '../utils/logger.js';
import { DeviceTokenService } from './deviceTokenService.js';

const logger = createLogger('push-notification-service');

// Android notification channel for booking-related notifications
const BOOKING_CHANNEL_ID = 'booking-notifications';

export type { PushPayload, SendResult };

export class PushNotificationService {
  private tokenService: DeviceTokenService;
  private tokenRepository: DeviceTokenRepository;

  constructor() {
    this.tokenService = new DeviceTokenService();
    this.tokenRepository = new DeviceTokenRepository();
  }

  async sendToUser(userId: string, payload: PushPayload): Promise<SendResult> {
    if (!features.ENABLE_PUSH_NOTIFICATIONS) {
      logger.debug({ userId }, 'Push notifications disabled, skipping');
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    const tokens = await this.tokenService.getActiveTokensForUser(userId);

    if (tokens.length === 0) {
      logger.debug({ userId }, 'No active tokens for user');
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    return this.sendToTokens(tokens, payload);
  }

  async sendToUsers(userIds: string[], payload: PushPayload): Promise<SendResult> {
    if (!features.ENABLE_PUSH_NOTIFICATIONS) {
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    const deviceTokens = await this.tokenRepository.findActiveByUserIds(userIds);
    const tokens = deviceTokens.map((t) => t.token);

    if (tokens.length === 0) {
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    return this.sendToTokens(tokens, payload);
  }

  private async sendToTokens(tokens: string[], payload: PushPayload): Promise<SendResult> {
    const invalidTokens: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Expo Push API supports up to 100 messages per request
    const batches = chunkArray(tokens, 100);

    for (const batch of batches) {
      try {
        const messages: ExpoPushMessage[] = batch.map((token) => ({
          to: token,
          title: payload.title,
          body: payload.body,
          data: payload.data,
          sound: payload.sound ?? 'default',
          badge: payload.badge,
          priority: 'high' as const,
          channelId: payload.channelId ?? BOOKING_CHANNEL_ID,
        }));

        const result = await sendExpoPushNotifications(messages, {
          retries: 3,
          retryDelayMs: 1000,
        });

        // Process each ticket in the response
        result.data.forEach((ticket: ExpoPushTicket, idx: number) => {
          if (ticket.status === 'ok') {
            successCount++;
          } else {
            failureCount++;
            // Check if the error indicates an invalid token
            if (isInvalidTokenError(ticket.details?.error)) {
              invalidTokens.push(batch[idx]);
            }
            logger.warn(
              {
                tokenPrefix: batch[idx].substring(0, 10),
                error: ticket.message,
                errorCode: ticket.details?.error,
              },
              'Failed to send push notification'
            );
          }
        });
      } catch (error) {
        logger.error({ error, batchSize: batch.length }, 'Batch send failed after retries');
        failureCount += batch.length;
      }
    }

    // Deactivate invalid tokens in background (don't block response)
    if (invalidTokens.length > 0) {
      this.deactivateInvalidTokens(invalidTokens).catch((error) => {
        logger.error({ error }, 'Background token deactivation failed');
      });
    }

    logger.info(
      { successCount, failureCount, invalidTokenCount: invalidTokens.length },
      'Push notification batch complete'
    );

    return { successCount, failureCount, invalidTokens };
  }

  private async deactivateInvalidTokens(tokens: string[]): Promise<void> {
    const BATCH_SIZE = 10; // Limit concurrent deactivations
    const batches = chunkArray(tokens, BATCH_SIZE);

    for (const batch of batches) {
      try {
        await Promise.all(batch.map((token) => this.tokenService.handleInvalidToken(token)));
      } catch (error) {
        logger.error(
          { error, batchSize: batch.length },
          'Failed to deactivate invalid tokens batch'
        );
        // Continue with remaining batches even if one fails
      }
    }

    logger.info({ count: tokens.length }, 'Finished deactivating invalid tokens');
  }
}
