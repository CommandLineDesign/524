// Expo Push Notification Types and Utilities
// Single source of truth for Expo Push API interactions

export const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';

// Expo Push error codes that indicate invalid/expired tokens
export const INVALID_TOKEN_ERRORS = ['DeviceNotRegistered', 'InvalidCredentials'] as const;

export interface ExpoPushMessage {
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

export interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
}

export interface ExpoPushResponse {
  data: ExpoPushTicket[];
}

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
  sound?: 'default' | null;
  channelId?: string;
}

export interface SendResult {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
}

/**
 * Check if an Expo Push error indicates an invalid token that should be deactivated
 */
export function isInvalidTokenError(errorCode: string | undefined): boolean {
  return (
    errorCode !== undefined &&
    INVALID_TOKEN_ERRORS.includes(errorCode as (typeof INVALID_TOKEN_ERRORS)[number])
  );
}

/**
 * Split an array into chunks of specified size
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Send push notifications via Expo Push API
 * Returns tickets for tracking delivery status
 */
export async function sendExpoPushNotifications(
  messages: ExpoPushMessage[],
  options?: { retries?: number; retryDelayMs?: number }
): Promise<ExpoPushResponse> {
  const { retries = 3, retryDelayMs = 1000 } = options ?? {};

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
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
        // Retry on server errors (5xx), but not client errors (4xx)
        if (response.status >= 500 && attempt < retries - 1) {
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          await sleep(retryDelayMs * 2 ** attempt); // Exponential backoff
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return (await response.json()) as ExpoPushResponse;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Retry on network errors
      if (attempt < retries - 1) {
        await sleep(retryDelayMs * 2 ** attempt);
      }
    }
  }

  throw lastError ?? new Error('Failed to send push notifications');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
