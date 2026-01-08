import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  type InitializeResult,
  PushNotificationService,
} from '../services/pushNotificationService';

type FailureReason =
  | 'not_device'
  | 'permission_denied'
  | 'no_project_id'
  | 'token_error'
  | 'registration_error';

export interface PushNotificationState {
  token: string | null;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  failureReason: FailureReason | null;
}

interface NotificationData {
  type?: string;
  bookingId?: string;
  chatId?: string;
  [key: string]: unknown;
}

function getErrorMessage(result: InitializeResult): string | null {
  if (result.success) return null;

  switch (result.reason) {
    case 'not_device':
      return 'Push notifications require a physical device';
    case 'permission_denied':
      return 'Notification permission was denied';
    case 'no_project_id':
      return 'Push notifications not configured for this app';
    case 'token_error':
      return result.error?.message ?? 'Failed to get push token';
    case 'registration_error':
      return result.error?.message ?? 'Failed to register with server';
    default:
      return 'Unknown error occurred';
  }
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
    failureReason: null,
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

  const handleInitResult = useCallback((result: InitializeResult) => {
    if (result.success) {
      setState({
        token: result.token,
        isEnabled: true,
        isLoading: false,
        error: null,
        failureReason: null,
      });
    } else {
      setState({
        token: null,
        isEnabled: false,
        isLoading: false,
        error: getErrorMessage(result),
        failureReason: result.reason,
      });
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clean up when user logs out
      setState({
        token: null,
        isEnabled: false,
        isLoading: false,
        error: null,
        failureReason: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    // Initialize push notifications
    PushNotificationService.initialize().then(handleInitResult);

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
  }, [isAuthenticated, handleNotificationNavigation, handleInitResult]);

  /**
   * Manually refresh the push token
   */
  const refreshToken = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const result = await PushNotificationService.initialize();
    handleInitResult(result);
  }, [handleInitResult]);

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
