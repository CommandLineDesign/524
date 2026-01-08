import { features } from '../config/features.js';
import { DeviceTokenRepository } from '../repositories/deviceTokenRepository.js';
import { createLogger } from '../utils/logger.js';
import { DeviceTokenService } from './deviceTokenService.js';

const logger = createLogger('push-notification-service');

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';

// Expo Push error codes that indicate invalid tokens
const INVALID_TOKEN_ERRORS = ['DeviceNotRegistered', 'InvalidCredentials'];

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: 'default' | null;
  badge?: number;
  ttl?: number;
  expiration?: number;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
}

interface ExpoPushResponse {
  data: ExpoPushTicket[];
}

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
  sound?: string;
}

export interface SendResult {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
}

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
    const batches = this.chunkArray(tokens, 100);

    for (const batch of batches) {
      try {
        const messages: ExpoPushMessage[] = batch.map((token) => ({
          to: token,
          title: payload.title,
          body: payload.body,
          data: payload.data,
          sound: (payload.sound as 'default' | null) ?? 'default',
          badge: payload.badge,
          priority: 'high' as const,
        }));

        const response = await fetch(EXPO_PUSH_API_URL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });

        if (!response.ok) {
          logger.error(
            { status: response.status, statusText: response.statusText },
            'Expo Push API request failed'
          );
          failureCount += batch.length;
          continue;
        }

        const result = (await response.json()) as ExpoPushResponse;

        // Process each ticket in the response
        result.data.forEach((ticket: ExpoPushTicket, idx: number) => {
          if (ticket.status === 'ok') {
            successCount++;
          } else {
            failureCount++;
            // Check if the error indicates an invalid token
            const errorCode = ticket.details?.error;
            if (errorCode && INVALID_TOKEN_ERRORS.includes(errorCode)) {
              invalidTokens.push(batch[idx]);
            }
            logger.warn(
              { token: batch[idx], error: ticket.message, errorCode },
              'Failed to send push notification'
            );
          }
        });
      } catch (error) {
        logger.error({ error, batchSize: batch.length }, 'Batch send failed');
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
    const batches = this.chunkArray(tokens, BATCH_SIZE);

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

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
