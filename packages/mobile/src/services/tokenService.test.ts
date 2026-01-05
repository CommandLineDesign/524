import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StorageProvider } from './storage';
import { createTokenService } from './tokenService';

// AsyncStorage is mocked in jest.setup.js
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Mock StorageProvider for testing
function createMockStorageProvider(): StorageProvider & {
  _store: Map<string, string>;
} {
  const store = new Map<string, string>();
  return {
    _store: store,
    get: jest.fn(async (key: string) => store.get(key) ?? null),
    set: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    delete: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
}

describe('TokenService', () => {
  let mockStorageProvider: ReturnType<typeof createMockStorageProvider>;
  let tokenService: ReturnType<typeof createTokenService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageProvider = createMockStorageProvider();
    tokenService = createTokenService(mockStorageProvider);
  });

  describe('getAccessToken', () => {
    it('should retrieve access token from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('test-access-token');

      const result = await tokenService.getAccessToken();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('auth_token');
      expect(result).toBe('test-access-token');
    });

    it('should return null when no access token exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await tokenService.getAccessToken();

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await tokenService.getAccessToken();

      expect(result).toBeNull();
    });
  });

  describe('setAccessToken', () => {
    it('should store access token and expiry in AsyncStorage', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      const mockNow = 1000000;
      jest.spyOn(Date, 'now').mockReturnValue(mockNow);

      await tokenService.setAccessToken('new-token', 3600);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-token');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'token_expiry',
        (mockNow + 3600 * 1000).toString()
      );
    });
  });

  describe('getRefreshToken', () => {
    it('should retrieve refresh token from storage provider', async () => {
      mockStorageProvider._store.set('refresh_token', 'test-refresh-token');

      const result = await tokenService.getRefreshToken();

      expect(mockStorageProvider.get).toHaveBeenCalledWith('refresh_token');
      expect(result).toBe('test-refresh-token');
    });

    it('should return null when no refresh token exists', async () => {
      const result = await tokenService.getRefreshToken();

      expect(result).toBeNull();
    });
  });

  describe('setRefreshToken', () => {
    it('should store refresh token in storage provider', async () => {
      await tokenService.setRefreshToken('new-refresh-token');

      expect(mockStorageProvider.set).toHaveBeenCalledWith('refresh_token', 'new-refresh-token');
      expect(mockStorageProvider._store.get('refresh_token')).toBe('new-refresh-token');
    });
  });

  describe('clearAllTokens', () => {
    it('should clear all tokens from both storages', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);
      mockStorageProvider._store.set('refresh_token', 'some-token');

      await tokenService.clearAllTokens();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('token_expiry');
      expect(mockStorageProvider.delete).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('isAccessTokenExpired', () => {
    it('should return true when no expiry exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await tokenService.isAccessTokenExpired();

      expect(result).toBe(true);
    });

    it('should return true when token is expired', async () => {
      const pastTime = Date.now() - 1000;
      mockAsyncStorage.getItem.mockResolvedValue(pastTime.toString());

      const result = await tokenService.isAccessTokenExpired();

      expect(result).toBe(true);
    });

    it('should return false when token is not expired', async () => {
      const futureTime = Date.now() + 3600000;
      mockAsyncStorage.getItem.mockResolvedValue(futureTime.toString());

      const result = await tokenService.isAccessTokenExpired();

      expect(result).toBe(false);
    });
  });

  describe('isAccessTokenExpiringSoon', () => {
    it('should return true when token expires within threshold', async () => {
      const expiryTime = Date.now() + 60000; // 1 minute from now
      mockAsyncStorage.getItem.mockResolvedValue(expiryTime.toString());

      const result = await tokenService.isAccessTokenExpiringSoon(300); // 5 minute threshold

      expect(result).toBe(true);
    });

    it('should return false when token expires after threshold', async () => {
      const expiryTime = Date.now() + 600000; // 10 minutes from now
      mockAsyncStorage.getItem.mockResolvedValue(expiryTime.toString());

      const result = await tokenService.isAccessTokenExpiringSoon(300); // 5 minute threshold

      expect(result).toBe(false);
    });
  });

  describe('setTokens', () => {
    it('should store both access and refresh tokens', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      const mockNow = 1000000;
      jest.spyOn(Date, 'now').mockReturnValue(mockNow);

      await tokenService.setTokens('access-token', 'refresh-token', 3600);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'access-token');
      expect(mockStorageProvider.set).toHaveBeenCalledWith('refresh_token', 'refresh-token');
    });
  });

  describe('hasTokens', () => {
    it('should return true when access token exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('access-token');

      const result = await tokenService.hasTokens();

      expect(result).toBe(true);
    });

    it('should return true when refresh token exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockStorageProvider._store.set('refresh_token', 'refresh-token');

      const result = await tokenService.hasTokens();

      expect(result).toBe(true);
    });

    it('should return false when no tokens exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await tokenService.hasTokens();

      expect(result).toBe(false);
    });
  });

  describe('getTokenExpiry', () => {
    it('should return expiry timestamp', async () => {
      const expiryTime = 1234567890;
      mockAsyncStorage.getItem.mockResolvedValue(expiryTime.toString());

      const result = await tokenService.getTokenExpiry();

      expect(result).toBe(expiryTime);
    });

    it('should return null when no expiry exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await tokenService.getTokenExpiry();

      expect(result).toBeNull();
    });
  });
});
