import admin from 'firebase-admin';

import { features } from '../config/features.js';
import { DeviceTokenRepository } from '../repositories/deviceTokenRepository.js';
import { createLogger } from '../utils/logger.js';
import { DeviceTokenService } from './deviceTokenService.js';

const logger = createLogger('push-notification-service');

// FCM error codes that indicate invalid tokens
const INVALID_TOKEN_ERRORS = [
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
  'messaging/mismatched-credential',
];

let firebaseInitialized = false;

function ensureFirebaseInitialized(): boolean {
  if (firebaseInitialized) return true;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    logger.warn('Firebase not configured - push notifications disabled');
    return false;
  }

  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    logger.info('Firebase initialized for push notifications');
    return true;
  } catch (error) {
    logger.error({ error }, 'Failed to initialize Firebase');
    return false;
  }
}

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
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

  async sendToTopic(topic: string, payload: PushPayload): Promise<boolean> {
    if (!features.ENABLE_PUSH_NOTIFICATIONS) {
      return false;
    }

    if (!ensureFirebaseInitialized()) {
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data,
        android: {
          notification: {
            sound: payload.sound ?? 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              badge: payload.badge,
              sound: payload.sound ?? 'default',
            },
          },
        },
      };

      await admin.messaging().send(message);
      logger.info({ topic }, 'Topic notification sent successfully');
      return true;
    } catch (error) {
      logger.error({ error, topic }, 'Failed to send topic notification');
      return false;
    }
  }

  async subscribeToTopic(userId: string, topic: string): Promise<void> {
    if (!ensureFirebaseInitialized()) return;

    const tokens = await this.tokenService.getActiveTokensForUser(userId);

    if (tokens.length > 0) {
      await admin.messaging().subscribeToTopic(tokens, topic);
      logger.info({ userId, topic, tokenCount: tokens.length }, 'Subscribed to topic');
    }
  }

  async unsubscribeFromTopic(userId: string, topic: string): Promise<void> {
    if (!ensureFirebaseInitialized()) return;

    const tokens = await this.tokenService.getActiveTokensForUser(userId);

    if (tokens.length > 0) {
      await admin.messaging().unsubscribeFromTopic(tokens, topic);
      logger.info({ userId, topic }, 'Unsubscribed from topic');
    }
  }

  private async sendToTokens(tokens: string[], payload: PushPayload): Promise<SendResult> {
    if (!ensureFirebaseInitialized()) {
      return { successCount: 0, failureCount: tokens.length, invalidTokens: [] };
    }

    const invalidTokens: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    // FCM supports up to 500 tokens per multicast
    const batches = this.chunkArray(tokens, 500);

    for (const batch of batches) {
      try {
        const message: admin.messaging.MulticastMessage = {
          tokens: batch,
          notification: {
            title: payload.title,
            body: payload.body,
            imageUrl: payload.imageUrl,
          },
          data: payload.data,
          android: {
            notification: {
              sound: payload.sound ?? 'default',
            },
            priority: 'high',
          },
          apns: {
            payload: {
              aps: {
                badge: payload.badge,
                sound: payload.sound ?? 'default',
                'content-available': 1,
              },
            },
          },
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        successCount += response.successCount;
        failureCount += response.failureCount;

        // Handle failures and collect invalid tokens
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const errorCode = resp.error.code;
            if (INVALID_TOKEN_ERRORS.includes(errorCode)) {
              invalidTokens.push(batch[idx]);
            }
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
