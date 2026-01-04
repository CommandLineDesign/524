import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Storage keys
const ACCESS_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

/**
 * TokenService handles secure storage and retrieval of authentication tokens.
 * - Access tokens are stored in AsyncStorage (short-lived, acceptable risk)
 * - Refresh tokens are stored in SecureStore (long-lived, needs encryption)
 */
export const TokenService = {
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
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      // Security: Do not fallback to AsyncStorage for refresh tokens
      // Refresh tokens are security-critical and should only be stored in secure storage
      throw new Error('SecureStore is required for refresh token retrieval but is unavailable');
    }
  },

  /**
   * Store refresh token in secure storage
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      // Security: Do not fallback to AsyncStorage for refresh tokens
      // Refresh tokens are security-critical and should only be stored in secure storage
      throw new Error('SecureStore is required for refresh token storage but is unavailable');
    }
  },

  /**
   * Clear all authentication tokens
   */
  async clearAllTokens(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
      AsyncStorage.removeItem(TOKEN_EXPIRY_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {
        // Fallback: also try AsyncStorage
        return AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      }),
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
