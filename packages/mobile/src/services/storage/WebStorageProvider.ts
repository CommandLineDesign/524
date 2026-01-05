import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageProvider } from './StorageProvider';

/**
 * Web platform storage provider using AsyncStorage.
 * SecureStore is not available on web, so we use AsyncStorage directly.
 */
export class WebStorageProvider implements StorageProvider {
  private hasWarnedAboutSecurity = false;

  async get(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  }

  async set(key: string, value: string): Promise<void> {
    if (!this.hasWarnedAboutSecurity) {
      console.warn(
        'Running on web platform - tokens stored in AsyncStorage (less secure than native SecureStore)'
      );
      this.hasWarnedAboutSecurity = true;
    }
    await AsyncStorage.setItem(key, value);
  }

  async delete(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}
