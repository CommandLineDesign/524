import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { StorageProvider } from './StorageProvider';

/**
 * Native platform storage provider using SecureStore with AsyncStorage fallback.
 * Used on iOS and Android for secure storage of sensitive data like refresh tokens.
 */
export class NativeStorageProvider implements StorageProvider {
  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      if (__DEV__) {
        console.error('[NativeStorageProvider] SecureStore.getItemAsync failed:', error);
      }
      // Do not fall back to AsyncStorage for reads - this would silently downgrade security
      // by reading potentially sensitive tokens from insecure storage
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      if (__DEV__) {
        console.error('[NativeStorageProvider] SecureStore.setItemAsync failed:', error);
        console.warn(
          'SecureStore unavailable, falling back to AsyncStorage. This is acceptable for development but not recommended for production.'
        );
      }
      await AsyncStorage.setItem(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      if (__DEV__) {
        console.error('[NativeStorageProvider] SecureStore.deleteItemAsync failed:', error);
      }
      // Fallback: also try AsyncStorage in case value was stored there
      await AsyncStorage.removeItem(key);
    }
  }
}
