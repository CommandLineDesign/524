# Mobile Implementation Guide

## Overview

The messaging system is fully integrated into the React Native mobile app, providing a native chat experience with offline support, real-time updates, and seamless booking integration.

## Setup and Dependencies

### Package Installation

Add the following to `packages/mobile/package.json`:

```json
{
  "dependencies": {
    "socket.io-client": "^4.6.0",
    "react-native-gifted-chat": "^2.4.0",
    "react-native-image-picker": "^7.0.0",
    "react-native-fast-image": "^8.6.3",
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@react-native-community/netinfo": "^11.3.1"
  }
}
```

### iOS Setup

Add to `ios/Podfile`:

```ruby
pod 'react-native-image-picker', :path => '../node_modules/react-native-image-picker'
pod 'react-native-netinfo', :path => '../node_modules/@react-native-community/netinfo'
```

### Android Setup

Add to `android/app/build.gradle`:

```gradle
android {
  // ...
  defaultConfig {
    // ...
    missingDimensionStrategy 'react-native-camera', 'general'
  }
}
```

## Core Components

### Screen Structure

#### ChatsListScreen
Main screen displaying all user conversations.

```typescript
// packages/mobile/src/screens/ChatsListScreen.tsx
import { ConversationListItem } from '../components/messaging/ConversationListItem';

export function ChatsListScreen() {
  const { data: conversations, refetch, hasNextPage, fetchNextPage } = useConversations(userRole);

  return (
    <SafeAreaView>
      <FlatList
        data={conversations}
        renderItem={({ item }) => <ConversationListItem conversation={item} />}
        onEndReached={() => hasNextPage && fetchNextPage()}
        refreshControl={<RefreshControl onRefresh={refetch} />}
      />
    </SafeAreaView>
  );
}
```

#### ChatScreen
Individual conversation view with message history.

```typescript
// packages/mobile/src/screens/ChatScreen.tsx
import { GiftedChat, IMessage } from 'react-native-gifted-chat';

export function ChatScreen() {
  const { conversationId } = useRoute().params;
  const { data: messages } = useMessages(conversationId);
  const sendMessage = useSendMessage();

  const giftedMessages = messages?.map(convertToGiftedChat) || [];

  return (
    <GiftedChat
      messages={giftedMessages}
      onSend={(msgs) => handleSend(msgs)}
      user={currentUser}
      loadEarlier={hasNextPage}
      onLoadEarlier={handleLoadEarlier}
    />
  );
}
```

### Component Library

#### ConversationListItem
Displays a conversation preview in the list.

```typescript
interface ConversationListItemProps {
  conversation: Conversation;
}

export function ConversationListItem({ conversation }: ConversationListItemProps) {
  const handlePress = () => {
    navigation.navigate('Chat', { conversationId: conversation.id });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container}>
        <Avatar source={{ uri: conversation.otherUserAvatar }} />
        <View style={styles.content}>
          <Text style={styles.userName}>{conversation.otherUserName}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {conversation.lastMessage?.content}
          </Text>
        </View>
        {conversation.unreadCount > 0 && (
          <Badge count={conversation.unreadCount} />
        )}
      </View>
    </TouchableOpacity>
  );
}
```

## React Query Integration

### Hooks Usage

#### useConversations
Fetch user's conversations with pagination.

```typescript
const {
  data: conversationsData,
  isLoading,
  hasNextPage,
  fetchNextPage,
  refetch
} = useConversations(userRole);

const conversations = conversationsData?.pages.flatMap(page => page.conversations) || [];
```

#### useConversation
Get single conversation details.

```typescript
const { data: conversation, isLoading } = useConversation(conversationId);
```

#### useMessages
Fetch messages for a conversation.

```typescript
const {
  data: messagesData,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage
} = useMessages(conversationId);

const messages = messagesData?.pages.flatMap(page => page.messages) || [];
```

#### useSendMessage
Send messages with optimistic updates.

```typescript
const sendMessage = useSendMessage();

const handleSend = async (messages: IMessage[]) => {
  const message = messages[0];
  await sendMessage.mutateAsync({
    conversationId,
    messageType: 'text',
    content: message.text,
  });
};
```

#### useUnreadCount
Get total unread message count.

```typescript
const { data: unreadCount } = useUnreadCount(userRole);
```

## Socket.io Integration

### Connection Management

```typescript
// packages/mobile/src/hooks/useSocket.ts
export function useSocket() {
  const { user, token } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user || !token) return;

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => socket.disconnect();
  }, [user, token]);

  return { socket, isConnected };
}
```

### Real-time Updates

```typescript
// Automatic message updates
useEffect(() => {
  if (!socket || !conversationId) return;

  const handleNewMessage = (message) => {
    queryClient.setQueryData(['messages', conversationId], (oldData) => ({
      ...oldData,
      pages: [{
        messages: [message, ...oldData.pages[0].messages],
        pagination: oldData.pages[0].pagination
      }, ...oldData.pages.slice(1)]
    }));
  };

  socket.on('message:new', handleNewMessage);
  return () => socket.off('message:new', handleNewMessage);
}, [socket, conversationId]);
```

## Offline Support

### Message Queue

```typescript
// packages/mobile/src/services/offlineMessageQueue.ts
export class OfflineMessageQueue {
  static getInstance(): OfflineMessageQueue { /* singleton */ }

  async enqueueMessage(message: QueuedMessage): Promise<void> {
    const queue = await this.getQueue();
    queue.push(message);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }

  async processQueue(sendFunction: (msg) => Promise<void>): Promise<void> {
    const queue = await this.getQueue();
    for (const message of queue) {
      try {
        await sendFunction(message);
        await this.dequeueMessage(message.id);
      } catch (error) {
        // Handle retry logic
      }
    }
  }
}
```

### Network State Monitoring

```typescript
// packages/mobile/src/hooks/useOfflineQueueProcessor.ts
export function useOfflineQueueProcessor() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected && state.isInternetReachable) {
        await offlineQueue.processQueue(sendMessage);
      }
    });
    return unsubscribe;
  }, []);
}
```

## Image Handling

### Image Picker Integration

```typescript
// packages/mobile/src/screens/ChatScreen.tsx
const handleImagePicker = useCallback(async () => {
  const options = {
    mediaType: 'photo',
    quality: 0.8,
    includeBase64: false,
  };

  const result = await launchImageLibrary(options);
  if (result.assets?.[0]) {
    const asset = result.assets[0];
    await processAndUploadImage(asset.uri, conversationId);
  }
}, [conversationId]);
```

### Upload Service

```typescript
// packages/mobile/src/services/imageUploadService.ts
export async function processAndUploadImage(
  imageUri: string,
  conversationId: string
): Promise<UploadResult> {
  // Compress image
  const compressed = await compressImageForMessaging(imageUri);

  // Get signed upload URL
  const { data } = await apiClient.post('/messaging/upload-image', {
    fileName: compressed.fileName,
    fileType: 'image/jpeg',
    conversationId,
  });

  // Upload to S3
  await uploadToS3(data.uploadUrl, compressed.uri, 'image/jpeg');

  return {
    publicUrl: data.publicUrl,
    key: data.key,
  };
}
```

## Navigation Integration

### Route Configuration

```typescript
// packages/mobile/src/navigation/AppNavigator.tsx
export type RootStackParamList = {
  // ... existing routes
  ChatsList: undefined;
  Chat: {
    conversationId?: string;
    artistId?: string;
    customerId?: string;
    bookingId?: string;
  };
};
```

### Deep Linking from Bookings

```typescript
// packages/mobile/src/screens/BookingDetailScreen.tsx
const createConversationMutation = useCreateConversation();

const handleMessageArtist = async () => {
  try {
    const conversation = await createConversationMutation.mutateAsync({
      artistId: data.artistId,
      bookingId: bookingId,
    });
    
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      bookingId: bookingId,
    });
  } catch (error) {
    Alert.alert('Failed to start conversation');
  }
};
```

### Accessing Messages from Navigation

#### Customer Navigation Menu
Customers access their messages through the hamburger menu:

```typescript
// packages/mobile/src/components/NavigationMenu.tsx
const menuItems = [
  { label: 'Home', screen: 'Welcome' },
  { label: 'My Bookings', screen: 'BookingsList' },
  { label: 'Messages', screen: 'ChatsList' },  // New
  // ...
];
```

#### Artist Navigation Menu
Artists have a dedicated navigation menu with access to bookings and messages:

```typescript
// packages/mobile/src/components/ArtistNavigationMenu.tsx
const artistMenuItems = [
  { label: 'My Bookings', screen: 'ArtistBookingsList' },
  { label: 'Messages', screen: 'ChatsList' },
  // ...
];
```

Both menus are accessible via the hamburger icon in the app header.

## State Management

### Auth Store Integration

```typescript
// packages/mobile/src/store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  // ... other auth state
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  // Auth state and actions
}));
```

### Booking Integration

```typescript
// packages/mobile/src/store/bookingStore.ts
interface BookingState {
  currentBooking: Booking | null;
  // ... other booking state
}

export const useBookingStore = create<BookingState & BookingActions>((set, get) => ({
  // Booking state and actions
}));
```

## UI/UX Patterns

### Message Status Indicators

```typescript
// Message status: sent, delivered, read
const renderMessageStatus = (message: IMessage) => {
  if (message.pending) return <PendingIndicator />;
  if (message.sent) return <SentIndicator />;
  if (message.received) return <DeliveredIndicator />;
  if (message.read) return <ReadIndicator />;
};
```

### Typing Indicators

```typescript
// packages/mobile/src/components/messaging/TypingIndicator.tsx
export function TypingIndicator({ isTyping }: { isTyping: boolean }) {
  if (!isTyping) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Typing...</Text>
      <AnimatedDots />
    </View>
  );
}
```

### Unread Badges

```typescript
// packages/mobile/src/components/messaging/UnreadBadge.tsx
export function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.count}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}
```

## Error Handling

### Network Errors

```typescript
const sendMessage = useSendMessage();

try {
  await sendMessage.mutateAsync(messageData);
} catch (error) {
  if (error.message === 'Message queued for sending when online') {
    showOfflineToast();
  } else {
    showErrorToast('Failed to send message');
  }
}
```

### Socket Connection Errors

```typescript
useEffect(() => {
  if (!isConnected) {
    showConnectionWarning();
  }
}, [isConnected]);
```

## Performance Optimization

### Message Pagination

```typescript
const PAGE_SIZE = 50;

const { data, hasNextPage, fetchNextPage } = useMessages(conversationId, {
  limit: PAGE_SIZE,
});

const handleLoadEarlier = () => {
  if (hasNextPage) {
    fetchNextPage();
  }
};
```

### Image Caching

```typescript
import FastImage from 'react-native-fast-image';

// Preload conversation avatars
FastImage.preload([
  { uri: conversation.otherUserAvatar },
]);
```

### Memory Management

```typescript
// Clear message cache when leaving chat
useEffect(() => {
  return () => {
    queryClient.removeQueries(['messages', conversationId]);
  };
}, [conversationId]);
```

## Testing

### Component Testing

```typescript
import { render, fireEvent } from '@testing-library/react-native';

describe('ChatScreen', () => {
  it('renders messages correctly', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Hello!')).toBeTruthy();
  });

  it('sends messages on submit', () => {
    const mockSend = jest.fn();
    // Test implementation
  });
});
```

### Integration Testing

```typescript
describe('Messaging Flow', () => {
  it('handles offline message queue', async () => {
    // Mock network offline
    NetInfo.fetch.mockResolvedValue({ isConnected: false });

    // Send message
    await sendMessage('Hello offline!');

    // Verify queued
    const queue = await OfflineMessageQueue.getInstance().getQueue();
    expect(queue).toHaveLength(1);
  });
});
```

## Troubleshooting

### Common Issues

#### Socket Connection Fails
```typescript
// Check token validity
console.log('Token:', token);

// Verify WebSocket URL
console.log('WS URL:', WS_URL);
```

#### Messages Not Sending
```typescript
// Check network connectivity
NetInfo.fetch().then(state => console.log('Network:', state));

// Verify conversation access
const hasAccess = await conversationService.validateConversationAccess(conversationId, userId);
console.log('Access:', hasAccess);
```

#### Images Not Uploading
```typescript
// Check S3 permissions
console.log('Upload URL:', uploadUrl);

// Verify file compression
console.log('Compressed size:', compressedImage.fileSize);
```

### Debug Logging

```typescript
// Enable detailed logging
import { logger } from '../utils/logger';

logger.enable('messaging');
logger.enable('websocket');
```

This mobile implementation provides a native, performant chat experience with offline support and real-time updates.