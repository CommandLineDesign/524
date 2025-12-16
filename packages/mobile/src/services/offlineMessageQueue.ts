import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QueuedMessage {
  id: string;
  conversationId: string;
  messageType: 'text' | 'image' | 'system';
  content?: string;
  images?: string[];
  bookingId?: string;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

const QUEUE_STORAGE_KEY = '@message_queue';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds

/**
 * Offline message queue service using AsyncStorage
 */
export class OfflineMessageQueue {
  private static instance: OfflineMessageQueue;
  private isProcessing = false;

  static getInstance(): OfflineMessageQueue {
    if (!OfflineMessageQueue.instance) {
      OfflineMessageQueue.instance = new OfflineMessageQueue();
    }
    return OfflineMessageQueue.instance;
  }

  /**
   * Add a message to the offline queue
   */
  async enqueueMessage(
    message: Omit<QueuedMessage, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<void> {
    try {
      const queuedMessage: QueuedMessage = {
        ...message,
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
      };

      const existingQueue = await this.getQueue();
      const updatedQueue = [...existingQueue, queuedMessage];

      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updatedQueue));

      console.log('Message added to offline queue:', queuedMessage.id);
    } catch (error) {
      console.error('Failed to enqueue message:', error);
      throw error;
    }
  }

  /**
   * Get all queued messages
   */
  async getQueue(): Promise<QueuedMessage[]> {
    try {
      const queueJson = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Failed to get message queue:', error);
      return [];
    }
  }

  /**
   * Remove a message from the queue (successful send)
   */
  async dequeueMessage(messageId: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const updatedQueue = queue.filter((msg) => msg.id !== messageId);
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updatedQueue));

      console.log('Message removed from queue:', messageId);
    } catch (error) {
      console.error('Failed to dequeue message:', error);
    }
  }

  /**
   * Update a message in the queue (failed retry)
   */
  async updateQueuedMessage(messageId: string, updates: Partial<QueuedMessage>): Promise<void> {
    try {
      const queue = await this.getQueue();
      const messageIndex = queue.findIndex((msg) => msg.id === messageId);

      if (messageIndex === -1) return;

      queue[messageIndex] = { ...queue[messageIndex], ...updates };
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to update queued message:', error);
    }
  }

  /**
   * Process the offline queue when back online
   */
  async processQueue(sendFunction: (message: QueuedMessage) => Promise<void>): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      const queue = await this.getQueue();
      const messagesToProcess = queue.filter((msg) => msg.retryCount < MAX_RETRY_ATTEMPTS);

      console.log(`Processing ${messagesToProcess.length} queued messages`);

      for (const message of messagesToProcess) {
        try {
          await sendFunction(message);
          await this.dequeueMessage(message.id);
          console.log('Successfully sent queued message:', message.id);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Failed to send queued message:', message.id, error);

          // Increment retry count
          await this.updateQueuedMessage(message.id, {
            retryCount: message.retryCount + 1,
            lastError: errorMessage,
          });

          // If max retries reached, remove from queue
          if (message.retryCount + 1 >= MAX_RETRY_ATTEMPTS) {
            console.log('Max retries reached, removing message from queue:', message.id);
            await this.dequeueMessage(message.id);
          } else {
            // Wait before next retry
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          }
        }
      }
    } catch (error) {
      console.error('Error processing message queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Clear all messages from the queue (e.g., on logout)
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
      console.log('Message queue cleared');
    } catch (error) {
      console.error('Failed to clear message queue:', error);
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    total: number;
    pending: number;
    failed: number;
  }> {
    try {
      const queue = await this.getQueue();
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      return {
        total: queue.length,
        pending: queue.filter((msg) => msg.retryCount < MAX_RETRY_ATTEMPTS).length,
        failed: queue.filter(
          (msg) => msg.retryCount >= MAX_RETRY_ATTEMPTS || now - msg.timestamp > maxAge
        ).length,
      };
    } catch (error) {
      console.error('Failed to get queue stats:', error);
      return { total: 0, pending: 0, failed: 0 };
    }
  }
}
