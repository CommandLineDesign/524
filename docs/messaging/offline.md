# Offline Support

## Overview

The messaging system provides comprehensive offline support, allowing users to continue chatting even without internet connectivity. Messages are queued locally and automatically sent when connection is restored.

## Architecture

### Offline Queue System

Messages sent while offline are stored in AsyncStorage and processed when connectivity returns.

```typescript
// packages/mobile/src/services/offlineMessageQueue.ts
export class OfflineMessageQueue {
  private static instance: OfflineMessageQueue;
  private isProcessing = false;

  // Singleton pattern for global queue management
  static getInstance(): OfflineMessageQueue {
    if (!OfflineMessageQueue.instance) {
      OfflineMessageQueue.instance = new OfflineMessageQueue();
    }
    return OfflineMessageQueue.instance;
  }
}
```

### Queue Storage

Messages are persisted using React Native AsyncStorage:

```typescript
const QUEUE_STORAGE_KEY = '@message_queue';

interface QueuedMessage {
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
```

## Implementation

### Message Sending with Offline Support

The `useSendMessage` hook automatically handles offline scenarios:

```typescript
// packages/mobile/src/query/messaging.ts
export function useSendMessage() {
  return useMutation({
    mutationFn: async (params) => {
      // Check network connectivity
      const networkState = await NetInfo.fetch();

      if (!networkState.isConnected || !networkState.isInternetReachable) {
        // Queue message for offline sending
        await offlineQueue.enqueueMessage(params);
        throw new Error('Message queued for sending when online');
      }

      // Send via API
      const response = await apiClient.post('/messaging/conversations/...', params);
      return response.data;
    },
    onError: (error, variables) => {
      if (error.message === 'Message queued for sending when online') {
        // Show optimistic UI updates
        showQueuedMessage(variables);
      }
    },
  });
}
```

### Network State Monitoring

The app monitors network changes to trigger queue processing:

```typescript
// packages/mobile/src/hooks/useOfflineQueueProcessor.ts
export function useOfflineQueueProcessor() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('Network restored, processing offline queue...');
        await processOfflineQueue();
      }
    });

    // Process queue on app start if already online
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected && state.isInternetReachable) {
        await processOfflineQueue();
      }
    });

    return unsubscribe;
  }, []);
}
```

### Queue Processing

When connectivity is restored, queued messages are processed:

```typescript
const processOfflineQueue = async () => {
  if (queue.isProcessing) return;

  queue.isProcessing = true;

  try {
    const messages = await queue.getQueue();
    const pendingMessages = messages.filter(msg => msg.retryCount < MAX_RETRY_ATTEMPTS);

    console.log(`Processing ${pendingMessages.length} queued messages`);

    for (const message of pendingMessages) {
      try {
        await sendMessage(message);
        await queue.dequeueMessage(message.id);
        console.log('Successfully sent queued message:', message.id);
      } catch (error) {
        console.error('Failed to send queued message:', message.id, error);

        // Increment retry count
        await queue.updateQueuedMessage(message.id, {
          retryCount: message.retryCount + 1,
          lastError: error.message,
        });

        // Remove after max retries
        if (message.retryCount + 1 >= MAX_RETRY_ATTEMPTS) {
          await queue.dequeueMessage(message.id);
        }
      }
    }
  } finally {
    queue.isProcessing = false;
  }
};
```

## User Experience

### Optimistic UI Updates

When messages are queued offline, the UI immediately shows them:

```typescript
// Add temporary message to UI
const tempMessage: Message = {
  id: `temp_${Date.now()}`,
  conversationId: variables.conversationId,
  senderId: 'current-user',
  senderRole: 'customer',
  messageType: variables.messageType,
  content: variables.content,
  sentAt: new Date().toISOString(),
  // Mark as pending for UI feedback
  pending: true,
};

// Add to messages list
queryClient.setQueryData(['messages', conversationId], (oldData) => ({
  ...oldData,
  pages: [{
    messages: [tempMessage, ...oldData.pages[0].messages],
    pagination: oldData.pages[0].pagination
  }]
}));
```

### Status Indicators

Messages show different states based on send status:

```typescript
const getMessageStatus = (message: Message) => {
  if (message.pending) return 'sending';
  if (message.error) return 'failed';
  return 'sent';
};

const renderMessageStatus = (message: Message) => {
  const status = getMessageStatus(message);

  switch (status) {
    case 'sending':
      return <ActivityIndicator size="small" />;
    case 'failed':
      return <ErrorIcon onPress={() => retrySend(message)} />;
    case 'sent':
      return <CheckIcon />;
  }
};
```

### Retry Mechanisms

Failed messages can be retried manually:

```typescript
const retrySend = async (message: Message) => {
  try {
    await sendMessageMutation.mutateAsync(message);
    // Remove from UI on success
  } catch (error) {
    // Show retry failed message
    Alert.alert('Retry Failed', 'Please check your connection and try again.');
  }
};
```

## Technical Details

### Queue Management

#### Storage Limits

- Maximum 1000 messages in queue
- Automatic cleanup of messages older than 24 hours
- Priority-based sending (newest first)

```typescript
const MAX_QUEUE_SIZE = 1000;
const MAX_MESSAGE_AGE = 24 * 60 * 60 * 1000; // 24 hours

const cleanupOldMessages = async () => {
  const queue = await getQueue();
  const now = Date.now();

  const validMessages = queue.filter(msg =>
    (now - msg.timestamp) < MAX_MESSAGE_AGE
  );

  if (validMessages.length !== queue.length) {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(validMessages));
  }
};
```

#### Memory Management

- Queue is loaded into memory only when needed
- Automatic cleanup on app launch
- Background processing doesn't block UI

### Error Handling

#### Network Errors

Different error types are handled appropriately:

```typescript
const handleSendError = (error: Error, message: QueuedMessage) => {
  if (error.message.includes('network') || error.message.includes('timeout')) {
    // Network error - queue for retry
    enqueueMessage(message);
  } else if (error.message.includes('unauthorized')) {
    // Auth error - don't retry
    showAuthError();
  } else {
    // Other error - allow manual retry
    markMessageFailed(message.id, error.message);
  }
};
```

#### Recovery Strategies

- **Exponential backoff**: Wait longer between retries
- **Smart retry logic**: Don't retry auth failures
- **User feedback**: Clear status indicators and retry options

### Performance Considerations

#### Battery Impact

Offline queue processing is optimized for battery life:

```typescript
// Only process queue when:
- Network connectivity is restored
- App is in foreground (optional)
- Battery level is above threshold
- User has enabled background sync
```

#### Storage Optimization

- Messages compressed before storage
- Automatic cleanup of sent messages
- Efficient serialization (avoid large objects)

## Testing

### Unit Tests

```typescript
describe('OfflineMessageQueue', () => {
  beforeEach(() => {
    mockAsyncStorage.clear();
  });

  it('should enqueue messages correctly', async () => {
    const queue = OfflineMessageQueue.getInstance();
    await queue.enqueueMessage({
      conversationId: 'conv-1',
      messageType: 'text',
      content: 'Hello offline!',
    });

    const stored = await queue.getQueue();
    expect(stored).toHaveLength(1);
    expect(stored[0].content).toBe('Hello offline!');
  });

  it('should process queue on network restore', async () => {
    // Mock network offline
    NetInfo.fetch.mockResolvedValue({ isConnected: false });

    // Send message (should queue)
    await sendMessage('Offline message');

    // Mock network restore
    NetInfo.fetch.mockResolvedValue({ isConnected: true });

    // Process queue
    await processOfflineQueue();

    // Verify message was sent
    expect(apiClient.post).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
describe('Offline Messaging Flow', () => {
  it('should handle complete offline->online cycle', async () => {
    // 1. Go offline
    simulateNetworkOffline();

    // 2. Send multiple messages
    await sendMessage('Message 1');
    await sendMessage('Message 2');

    // 3. Verify queued
    const queue = await getOfflineQueue();
    expect(queue).toHaveLength(2);

    // 4. Come back online
    simulateNetworkOnline();

    // 5. Verify auto-processing
    await waitFor(() => {
      expect(queue).toHaveLength(0);
    });

    // 6. Verify messages sent
    expect(apiClient.post).toHaveBeenCalledTimes(2);
  });
});
```

### Edge Cases

#### App Termination

Messages remain queued if app is killed during processing:

```typescript
it('should persist queue across app restarts', async () => {
  // Send message while offline
  await sendOfflineMessage();

  // Simulate app restart
  reloadApp();

  // Queue should still exist
  const queue = await getOfflineQueue();
  expect(queue).toHaveLength(1);
});
```

#### Large Queues

System handles large message backlogs gracefully:

```typescript
it('should handle large message queues', async () => {
  // Queue 500 messages
  for (let i = 0; i < 500; i++) {
    await enqueueMessage(`Message ${i}`);
  }

  // Process in batches
  await processOfflineQueue();

  // Should not crash or timeout
  expect(queue).toHaveLength(0);
});
```

## Monitoring

### Queue Metrics

Track offline queue health:

```typescript
const queueStats = await queue.getQueueStats();
// {
//   total: 5,
//   pending: 3,
//   failed: 2
// }
```

### Performance Monitoring

```typescript
// Track queue processing time
const startTime = Date.now();
await processOfflineQueue();
const processingTime = Date.now() - startTime;

// Log performance metrics
logger.info('Queue processing completed', {
  processingTime,
  messagesProcessed: processedCount,
  messagesFailed: failedCount,
});
```

## Troubleshooting

### Common Issues

#### Messages Not Queuing

```typescript
// Check AsyncStorage permissions
AsyncStorage.getItem(QUEUE_KEY).then(queue => {
  console.log('Queue contents:', queue);
});

// Verify network detection
NetInfo.fetch().then(state => {
  console.log('Network state:', state);
});
```

#### Queue Not Processing

```typescript
// Check processing flag
console.log('Is processing:', queue.isProcessing);

// Verify network listener
NetInfo.addEventListener(state => {
  console.log('Network changed:', state);
});
```

#### Memory Issues

```typescript
// Check queue size
const stats = await queue.getQueueStats();
console.log('Queue stats:', stats);

// Clear old messages
await queue.cleanupOldMessages();
```

### Debug Tools

```typescript
// Enable offline debugging
import { logger } from '../utils/logger';

logger.enable('offline-queue');
logger.enable('network-detection');

// View queue contents
const queue = await OfflineMessageQueue.getInstance().getQueue();
console.table(queue);
```

This offline support system ensures a seamless messaging experience even with intermittent connectivity.
