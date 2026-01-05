import AsyncStorage from '@react-native-async-storage/async-storage';
import { type StorageProvider, defaultStorageProvider } from './storage';

// Storage keys
const ACCESS_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

/**
 * Creates a TokenService with the specified storage provider.
 * Use this factory for testing with mock providers.
 */
export function createTokenService(secureStorage: StorageProvider) {
  return {
    /**
     * Get the current access token
     */
    async getAccessToken(): Promise<string | null> {
      try {
        return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      } catch (error) {
        return null;
      }
    },

    /**
     * Store access token with its expiration time
     * @param token - The JWT access token
     * @param expiresIn - Expiration time in seconds from now
     */
    async setAccessToken(token: string, expiresIn: number): Promise<void> {
      const expiryTime = Date.now() + expiresIn * 1000;
      await Promise.all([
        AsyncStorage.setItem(ACCESS_TOKEN_KEY, token),
        AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString()),
      ]);
    },

    /**
     * Get the refresh token from secure storage
     */
    async getRefreshToken(): Promise<string | null> {
      try {
        return await secureStorage.get(REFRESH_TOKEN_KEY);
      } catch (error) {
        if (__DEV__) {
          console.error('[TokenService] getRefreshToken failed:', error);
        }
        // Return null to allow graceful degradation, but error is logged for observability
        return null;
      }
    },

    /**
     * Store refresh token in secure storage
     */
    async setRefreshToken(token: string): Promise<void> {
      await secureStorage.set(REFRESH_TOKEN_KEY, token);
    },

    /**
     * Clear all authentication tokens
     */
    async clearAllTokens(): Promise<void> {
      await Promise.all([
        AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
        AsyncStorage.removeItem(TOKEN_EXPIRY_KEY),
        secureStorage.delete(REFRESH_TOKEN_KEY),
      ]);
    },

    /**
     * Check if the access token has expired
     */
    async isAccessTokenExpired(): Promise<boolean> {
      try {
        const expiryStr = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
        if (!expiryStr) {
          return true;
        }
        const expiryTime = Number.parseInt(expiryStr, 10);
        return Date.now() >= expiryTime;
      } catch (error) {
        return true;
      }
    },

    /**
     * Check if the access token is expiring soon (for proactive refresh)
     * @param thresholdSeconds - Time in seconds before expiry to consider "expiring soon"
     */
    async isAccessTokenExpiringSoon(thresholdSeconds = 300): Promise<boolean> {
      try {
        const expiryStr = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
        if (!expiryStr) {
          return true;
        }
        const expiryTime = Number.parseInt(expiryStr, 10);
        const threshold = thresholdSeconds * 1000;
        return Date.now() >= expiryTime - threshold;
      } catch (error) {
        return true;
      }
    },

    /**
     * Get the token expiry timestamp
     */
    async getTokenExpiry(): Promise<number | null> {
      try {
        const expiryStr = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
        if (!expiryStr) {
          return null;
        }
        return Number.parseInt(expiryStr, 10);
      } catch (error) {
        return null;
      }
    },

    /**
     * Store both tokens at once (convenience method for login)
     */
    async setTokens(accessToken: string, refreshToken: string, expiresIn: number): Promise<void> {
      await Promise.all([
        this.setAccessToken(accessToken, expiresIn),
        this.setRefreshToken(refreshToken),
      ]);
    },

    /**
     * Check if we have any tokens stored (for initial auth check)
     */
    async hasTokens(): Promise<boolean> {
      const [accessToken, refreshToken] = await Promise.all([
        this.getAccessToken(),
        this.getRefreshToken(),
      ]);
      return Boolean(accessToken || refreshToken);
    },
  };
}

/**
 * TokenService handles secure storage and retrieval of authentication tokens.
 * - Access tokens are stored in AsyncStorage (short-lived, acceptable risk)
 * - Refresh tokens are stored in SecureStore on native, AsyncStorage on web
 *
 * For testing, use createTokenService() with a mock StorageProvider.
 */
export const TokenService = createTokenService(defaultStorageProvider);
