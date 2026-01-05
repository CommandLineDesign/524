import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { NativeStorageProvider } from './NativeStorageProvider';
import { WebStorageProvider } from './WebStorageProvider';

// AsyncStorage and SecureStore are mocked in jest.setup.js
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('NativeStorageProvider', () => {
  let provider: NativeStorageProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new NativeStorageProvider();
  });

  describe('get', () => {
    it('should retrieve value from SecureStore', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('test-value');

      const result = await provider.get('test-key');

      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('test-key');
      expect(result).toBe('test-value');
    });

    it('should return null when SecureStore returns null', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const result = await provider.get('test-key');

      expect(result).toBeNull();
    });

    it('should fallback to AsyncStorage when SecureStore fails', async () => {
      mockSecureStore.getItemAsync.mockRejectedValue(new Error('SecureStore error'));
      mockAsyncStorage.getItem.mockResolvedValue('fallback-value');

      const result = await provider.get('test-key');

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('test-key');
      expect(result).toBe('fallback-value');
    });
  });

  describe('set', () => {
    it('should store value in SecureStore', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      await provider.set('test-key', 'test-value');

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should fallback to AsyncStorage when SecureStore fails', async () => {
      mockSecureStore.setItemAsync.mockRejectedValue(new Error('SecureStore error'));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await provider.set('test-key', 'test-value');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
    });
  });

  describe('delete', () => {
    it('should delete value from SecureStore', async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      await provider.delete('test-key');

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('test-key');
    });

    it('should fallback to AsyncStorage when SecureStore fails', async () => {
      mockSecureStore.deleteItemAsync.mockRejectedValue(new Error('SecureStore error'));
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      await provider.delete('test-key');

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });
});

describe('WebStorageProvider', () => {
  let provider: WebStorageProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new WebStorageProvider();
  });

  describe('get', () => {
    it('should retrieve value from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('test-value');

      const result = await provider.get('test-key');

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('test-key');
      expect(result).toBe('test-value');
    });

    it('should return null when AsyncStorage returns null', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await provider.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store value in AsyncStorage', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await provider.set('test-key', 'test-value');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
    });
  });

  describe('delete', () => {
    it('should delete value from AsyncStorage', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      await provider.delete('test-key');

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });
});
