import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { apiClient } from '../api/client';

const PUSH_TOKEN_KEY = 'push_notification_token';

// Android notification channel configuration
const BOOKING_CHANNEL_ID = 'booking-notifications';

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

export type InitializeResult =
  | { success: true; token: string }
  | {
      success: false;
      reason:
        | 'not_device'
        | 'permission_denied'
        | 'no_project_id'
        | 'token_error'
        | 'registration_error';
      error?: Error;
    };

export class PushNotificationService {
  private static tokenRefreshListener: Notifications.EventSubscription | null = null;
  private static isInitialized = false;

  /**
   * Initialize push notifications.
   * Call this after successful login.
   * Returns a result object indicating success/failure with reason.
   */
  static async initialize(): Promise<InitializeResult> {
    if (!Device.isDevice) {
      if (__DEV__) {
        console.log('[PushNotifications] Push notifications require a physical device');
      }
      return { success: false, reason: 'not_device' };
    }

    try {
      // Set up Android notification channel
      if (Platform.OS === 'android') {
        await PushNotificationService.setupAndroidChannel();
      }

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
        return { success: false, reason: 'permission_denied' };
      }

      // Get the push token
      const tokenResult = await PushNotificationService.getPushToken();

      if (!tokenResult.success) {
        return tokenResult;
      }

      const token = tokenResult.token;

      // Register with backend - this can fail and caller should know
      try {
        await PushNotificationService.registerToken(token);
      } catch (error) {
        return {
          success: false,
          reason: 'registration_error',
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }

      // Set up token refresh listener
      PushNotificationService.setupTokenRefreshListener();
      PushNotificationService.isInitialized = true;

      return { success: true, token };
    } catch (error) {
      if (__DEV__) {
        console.error('[PushNotifications] Failed to initialize:', error);
      }
      return {
        success: false,
        reason: 'token_error',
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Set up Android notification channel for booking notifications
   */
  private static async setupAndroidChannel(): Promise<void> {
    await Notifications.setNotificationChannelAsync(BOOKING_CHANNEL_ID, {
      name: 'Booking Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
    });
  }

  /**
   * Get Expo Push Token for sending notifications via Expo's push service.
   * The backend uses Expo Push API, so we need ExpoPushToken format.
   */
  private static async getPushToken(): Promise<
    | { success: true; token: string }
    | { success: false; reason: 'no_project_id' | 'token_error'; error?: Error }
  > {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        if (__DEV__) {
          console.warn(
            '[PushNotifications] No EAS projectId configured. ' +
              'Push notifications require an EAS project. ' +
              'Run `eas init` to configure your project.'
          );
        }
        return { success: false, reason: 'no_project_id' };
      }

      // Get Expo Push Token (format: ExponentPushToken[xxxx])
      // This is required for Expo Push API on the backend
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      return { success: true, token: tokenData.data };
    } catch (error) {
      if (__DEV__) {
        console.error('[PushNotifications] Failed to get push token:', error);
      }
      return {
        success: false,
        reason: 'token_error',
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Register token with backend
   */
  private static async registerToken(token: string): Promise<void> {
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
        try {
          await PushNotificationService.registerToken(tokenData.data);
        } catch (error) {
          // Log but don't crash on refresh failure - will retry on next refresh
          if (__DEV__) {
            console.error('[PushNotifications] Failed to register refreshed token:', error);
          }
        }
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

      PushNotificationService.isInitialized = false;
    } catch (error) {
      if (__DEV__) {
        console.error('[PushNotifications] Failed to unregister:', error);
      }
      // Still clear local state even if API call fails
      await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
      if (PushNotificationService.tokenRefreshListener) {
        PushNotificationService.tokenRefreshListener.remove();
        PushNotificationService.tokenRefreshListener = null;
      }
      PushNotificationService.isInitialized = false;
    }
  }

  /**
   * Check if push notifications are initialized
   */
  static getIsInitialized(): boolean {
    return PushNotificationService.isInitialized;
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
