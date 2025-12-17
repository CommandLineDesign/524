import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo/lib/typescript/src/internal/types';
import { useEffect } from 'react';

import { useSendMessage } from '../query/messaging';
import { OfflineMessageQueue, QueuedMessage } from '../services/offlineMessageQueue';
import { useAuthStore } from '../store/authStore';

/**
 * Hook that monitors network connectivity and processes offline message queue
 */
export function useOfflineQueueProcessor() {
  const { user } = useAuthStore();
  const sendMessageMutation = useSendMessage();
  const offlineQueue = OfflineMessageQueue.getInstance();

  useEffect(() => {
    // Only process queue if user is authenticated
    if (!user) return;

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(async (state: NetInfoState) => {
      if (state.isConnected && state.isInternetReachable) {
        // Network is back online, process the queue
        await processOfflineQueue();
      }
    });

    // Process queue on initial load if already online
    NetInfo.fetch().then(async (state: NetInfoState) => {
      if (state.isConnected && state.isInternetReachable) {
        await processOfflineQueue();
      }
    });

    return unsubscribe;
  }, [user]);

  const processOfflineQueue = async () => {
    try {
      await offlineQueue.processQueue(async (queuedMessage: QueuedMessage) => {
        // Send the queued message
        await sendMessageMutation.mutateAsync({
          conversationId: queuedMessage.conversationId,
          messageType: queuedMessage.messageType,
          content: queuedMessage.content,
          images: queuedMessage.images,
          bookingId: queuedMessage.bookingId,
        });
      });
    } catch (error) {
      console.error('Error processing offline queue:', error);
    }
  };

  return {
    processQueue: processOfflineQueue,
  };
}
