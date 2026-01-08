import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PushNotificationService } from '../services/pushNotificationService';

export interface PushNotificationState {
  token: string | null;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

interface NotificationData {
  type?: string;
  bookingId?: string;
  chatId?: string;
  [key: string]: unknown;
}

/**
 * Hook to manage push notifications.
 * Initializes push notifications when user is authenticated,
 * handles notification taps for navigation, and provides state.
 */
export function usePushNotifications(isAuthenticated: boolean) {
  const [state, setState] = useState<PushNotificationState>({
    token: null,
    isEnabled: false,
    isLoading: false,
    error: null,
  });

  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const handleNotificationNavigation = useCallback(
    (data: NotificationData) => {
      const type = data.type;

      switch (type) {
        case 'booking_created':
        case 'booking_status_changed':
          if (data.bookingId) {
            navigation.navigate('BookingDetail', { bookingId: data.bookingId });
          }
          break;

        case 'new_message':
          if (data.chatId) {
            navigation.navigate('Chat', { chatId: data.chatId });
          }
          break;

        default:
          // For unknown notification types, navigate to notifications inbox when implemented
          break;
      }
    },
    [navigation]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      // Clean up when user logs out
      setState({
        token: null,
        isEnabled: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    // Initialize push notifications
    PushNotificationService.initialize()
      .then((token) => {
        setState({
          token,
          isEnabled: !!token,
          isLoading: false,
          error: null,
        });
      })
      .catch((error) => {
        setState({
          token: null,
          isEnabled: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize push notifications',
        });
      });

    // Listen for incoming notifications while app is foregrounded
    notificationListener.current = PushNotificationService.addNotificationReceivedListener(
      (notification) => {
        if (__DEV__) {
          console.log('[usePushNotifications] Notification received:', notification);
        }
        // Can show in-app toast/banner here if needed
      }
    );

    // Listen for notification taps
    responseListener.current = PushNotificationService.addNotificationResponseListener(
      (response) => {
        const data = response.notification.request.content.data as NotificationData;
        handleNotificationNavigation(data);
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated, handleNotificationNavigation]);

  /**
   * Manually refresh the push token
   */
  const refreshToken = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const token = await PushNotificationService.initialize();
      setState({
        token,
        isEnabled: !!token,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh token',
      }));
    }
  }, []);

  /**
   * Request notification permissions
   */
  const requestPermission = useCallback(async () => {
    const granted = await PushNotificationService.requestPermission();
    if (granted) {
      await refreshToken();
    }
    return granted;
  }, [refreshToken]);

  return {
    ...state,
    refreshToken,
    requestPermission,
  };
}
