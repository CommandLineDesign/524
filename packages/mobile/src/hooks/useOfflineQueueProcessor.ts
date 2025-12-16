import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';

import { useSendMessage } from '../query/messaging';
import { OfflineMessageQueue, QueuedMessage } from '../services/offlineMessageQueue';

/**
 * Hook that monitors network connectivity and processes offline message queue
 */
export function useOfflineQueueProcessor() {
  const sendMessageMutation = useSendMessage();
  const offlineQueue = OfflineMessageQueue.getInstance();

  useEffect(() => {
    // Subscribe to network state changes
    // biome-ignore lint/suspicious/noExplicitAny: NetInfo state type from third-party library
    const unsubscribe = NetInfo.addEventListener(async (state: any) => {
      if (state.isConnected && state.isInternetReachable) {
        // Network is back online, process the queue
        await processOfflineQueue();
      }
    });

    // Process queue on initial load if already online
    // biome-ignore lint/suspicious/noExplicitAny: NetInfo state type from third-party library
    NetInfo.fetch().then(async (state: any) => {
      if (state.isConnected && state.isInternetReachable) {
        await processOfflineQueue();
      }
    });

    return unsubscribe;
  }, []);

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
