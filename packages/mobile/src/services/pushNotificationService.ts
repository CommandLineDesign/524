import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { apiClient } from '../api/client';

const PUSH_TOKEN_KEY = 'push_notification_token';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class PushNotificationService {
  private static tokenRefreshListener: Notifications.EventSubscription | null = null;

  /**
   * Initialize push notifications.
   * Call this after successful login.
   */
  static async initialize(): Promise<string | null> {
    if (!Device.isDevice) {
      if (__DEV__) {
        console.log('[PushNotifications] Push notifications require a physical device');
      }
      return null;
    }

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        if (__DEV__) {
          console.log('[PushNotifications] Permission not granted');
        }
        return null;
      }

      // Get the push token
      const token = await PushNotificationService.getPushToken();

      if (token) {
        // Register with backend
        await PushNotificationService.registerToken(token);

        // Set up token refresh listener
        PushNotificationService.setupTokenRefreshListener();
      }

      return token;
    } catch (error) {
      if (__DEV__) {
        console.error('[PushNotifications] Failed to initialize:', error);
      }
      return null;
    }
  }

  /**
   * Get push token (Expo push token or FCM token)
   */
  private static async getPushToken(): Promise<string | null> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (projectId) {
        // Use Expo push token when EAS project is configured
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        return tokenData.data;
      }

      // Fall back to FCM token directly
      const tokenData = await Notifications.getDevicePushTokenAsync();
      return tokenData.data;
    } catch (error) {
      if (__DEV__) {
        console.error('[PushNotifications] Failed to get push token:', error);
      }
      return null;
    }
  }

  /**
   * Register token with backend
   */
  private static async registerToken(token: string): Promise<void> {
    try {
      const platform = Platform.OS as 'ios' | 'android';
      const deviceId = Constants.deviceId;
      const appVersion = Constants.expoConfig?.version;

      await apiClient.post('/api/v1/devices/register', {
        token,
        platform,
        deviceId,
        appVersion,
      });

      // Store token locally
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

      if (__DEV__) {
        console.log('[PushNotifications] Token registered successfully');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[PushNotifications] Failed to register token:', error);
      }
      throw error;
    }
  }

  /**
   * Set up listener for token refresh
   */
  private static setupTokenRefreshListener(): void {
    // Clean up existing listener
    if (PushNotificationService.tokenRefreshListener) {
      PushNotificationService.tokenRefreshListener.remove();
    }

    PushNotificationService.tokenRefreshListener = Notifications.addPushTokenListener(
      async (tokenData) => {
        if (__DEV__) {
          console.log('[PushNotifications] Token refreshed');
        }
        await PushNotificationService.registerToken(tokenData.data);
      }
    );
  }

  /**
   * Unregister device token (call on logout)
   */
  static async unregister(): Promise<void> {
    try {
      const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);

      if (storedToken) {
        await apiClient.post('/api/v1/devices/unregister', {
          token: storedToken,
        });
        await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
      }

      // Remove refresh listener
      if (PushNotificationService.tokenRefreshListener) {
        PushNotificationService.tokenRefreshListener.remove();
        PushNotificationService.tokenRefreshListener = null;
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[PushNotifications] Failed to unregister:', error);
      }
    }
  }

  /**
   * Add notification received listener (foreground)
   */
  static addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  static addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Get badge count
   */
  static async getBadgeCount(): Promise<number> {
    return Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  static async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear all notifications
   */
  static async clearAll(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
    await PushNotificationService.setBadgeCount(0);
  }

  /**
   * Check if permissions are granted
   */
  static async hasPermission(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Request notification permissions
   */
  static async requestPermission(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }
}
