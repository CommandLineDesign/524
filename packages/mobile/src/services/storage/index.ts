import { Platform } from 'react-native';
import { NativeStorageProvider } from './NativeStorageProvider';
import type { StorageProvider } from './StorageProvider';
import { WebStorageProvider } from './WebStorageProvider';

export type { StorageProvider } from './StorageProvider';
export { NativeStorageProvider } from './NativeStorageProvider';
export { WebStorageProvider } from './WebStorageProvider';

/**
 * Create the appropriate storage provider for the current platform.
 * - iOS/Android: NativeStorageProvider (SecureStore with AsyncStorage fallback)
 * - Web: WebStorageProvider (AsyncStorage only)
 */
export function createStorageProvider(): StorageProvider {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return new NativeStorageProvider();
  }
  return new WebStorageProvider();
}

/**
 * Default storage provider instance for the current platform.
 * Use this for most cases. For testing, inject a mock provider instead.
 */
export const defaultStorageProvider = createStorageProvider();
