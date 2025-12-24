import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { processAndUploadImage } from '../services/imageUploadService';

import { useSocket } from '../contexts/SocketContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useConversation, useMessages, useSendMessage } from '../query/messaging';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';

type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

export function ChatScreen() {
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const route = useRoute<ChatScreenRouteProp>();
  const { user } = useAuthStore();
  const { socket, isConnected } = useSocket();

  const { conversationId, artistId, customerId, bookingId } = route.params || {};

  // If we have artist/customer IDs but no conversation ID, we need to create/get the conversation
  // For now, we'll assume conversationId is provided
  if (!conversationId) {
    return (
      <View style={styles.container}>
        <Text>Conversation ID is required</Text>
      </View>
    );
  }

  const conversationIdToUse = conversationId;

  const { data: conversation, isLoading: conversationLoading } = useConversation(conversationId);

  const {
    data: messagesData,
    isLoading: messagesLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId);

  const sendMessageMutation = useSendMessage();

  const [isTyping, setIsTyping] = useState(false);

  // Convert API messages to GiftedChat format
  const giftedChatMessages = useMemo(() => {
    if (!messagesData?.pages || !user) return [];

    const allMessages = messagesData.pages.flatMap((page) => page.messages);

    console.log(`[ChatScreen] Converting ${allMessages.length} messages for GiftedChat`);
    if (allMessages.length > 0) {
      console.log(
        '[ChatScreen] First message in array:',
        allMessages[0]?.id,
        allMessages[0]?.sentAt
      );
      console.log(
        '[ChatScreen] Last message in array:',
        allMessages[allMessages.length - 1]?.id,
        allMessages[allMessages.length - 1]?.sentAt
      );
    }

    // Map messages to GiftedChat format
    const mapped = allMessages.map(
      (message): IMessage => ({
        _id: message.id,
        text: message.content || '',
        createdAt: new Date(message.sentAt),
        user: {
          _id: message.senderId,
          name: message.senderRole === 'artist' ? 'Artist' : 'Customer', // TODO: Get actual names
          avatar: undefined, // TODO: Add user avatars
        },
        image: message.images?.[0], // Use first image if present
        // Add custom properties
        messageType: message.messageType,
        bookingId: message.bookingId,
      })
    );

    // GiftedChat expects messages sorted in DESCENDING order by createdAt
    // (newest message at index 0, which displays at bottom of screen)
    const sorted = mapped.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA; // Descending order (newest first)
    });

    console.log('[ChatScreen] GiftedChat messages array length:', sorted.length);
    if (sorted.length > 0) {
      console.log(
        '[ChatScreen] GiftedChat first message (index 0, should be newest):',
        sorted[0]?._id,
        sorted[0]?.createdAt
      );
      console.log(
        '[ChatScreen] GiftedChat last message (should be oldest):',
        sorted[sorted.length - 1]?._id,
        sorted[sorted.length - 1]?.createdAt
      );
    }

    return sorted;
  }, [messagesData, user]);

  const handleSend = useCallback(
    async (messages: IMessage[] = []) => {
      if (!conversationIdToUse || !user) return;

      const message = messages[0];
      if (!message) return;

      console.log('[ChatScreen] Sending message:', message.text);

      try {
        await sendMessageMutation.mutateAsync({
          conversationId: conversationIdToUse,
          messageType: 'text',
          content: message.text,
          bookingId: route.params?.bookingId,
        });
        console.log('[ChatScreen] Message sent successfully');
      } catch (error) {
        console.error('[ChatScreen] Failed to send message:', error);
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    },
    [conversationIdToUse, user, sendMessageMutation, route.params?.bookingId]
  );

  const handleImagePicker = useCallback(async () => {
    if (!conversationIdToUse) return;

    const options = {
      mediaType: 'photo' as const,
      quality: 1 as any,
      includeBase64: false,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel || response.errorMessage || !response.assets?.[0]) {
        return;
      }

      const asset = response.assets[0];

      if (!asset.uri) {
        Alert.alert('Error', 'Invalid image selected');
        return;
      }

      try {
        // Process and upload the image
        const uploadResult = await processAndUploadImage(asset.uri, conversationIdToUse);

        // Send message with the uploaded image URL
        await sendMessageMutation.mutateAsync({
          conversationId: conversationIdToUse,
          messageType: 'image',
          images: [uploadResult.publicUrl],
          bookingId: route.params?.bookingId,
        });
      } catch (error) {
        console.error('Image upload failed:', error);
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'Failed to send image. Please try again.'
        );
      }
    });
  }, [conversationIdToUse, sendMessageMutation, route.params?.bookingId]);

  const handleTyping = useCallback(
    (text: string) => {
      if (!socket || !conversationIdToUse) return;

      if (text.length > 0 && !isTyping) {
        socket.emit('typing:start', conversationIdToUse);
        setIsTyping(true);
      } else if (text.length === 0 && isTyping) {
        socket.emit('typing:stop', conversationIdToUse);
        setIsTyping(false);
      }
    },
    [socket, conversationIdToUse, isTyping]
  );

  // Load more messages
  const handleLoadEarlier = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Custom send button
  const renderSend = useCallback(
    (props: Send['props']) => (
      <Send {...props}>
        <View style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </View>
      </Send>
    ),
    []
  );

  // Custom input toolbar with image button
  const renderInputToolbar = useCallback(
    (props: InputToolbar['props']) => (
      <View>
        <View style={styles.inputToolbar}>
          <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
            <Text style={styles.imageButtonText}>📷</Text>
          </TouchableOpacity>
        </View>
        <InputToolbar {...props} />
      </View>
    ),
    [handleImagePicker]
  );

  useEffect(() => {
    if (socket && conversationIdToUse && isConnected) {
      console.log('[ChatScreen] Joining conversation:', conversationIdToUse);
      socket.emit('join:conversation', conversationIdToUse);
    }
  }, [socket, conversationIdToUse, isConnected]);

  useEffect(() => {
    return () => {
      if (socket && conversationIdToUse) {
        console.log('[ChatScreen] Leaving conversation:', conversationIdToUse);
        socket.emit('leave:conversation', conversationIdToUse);
      }
    };
  }, [socket, conversationIdToUse]);

  if (conversationLoading || messagesLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Conversation not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentUser = {
    _id: user?.id || 'unknown',
    name: user?.primaryRole === 'artist' ? 'You (Artist)' : 'You (Customer)',
    avatar: undefined, // TODO: Add user avatar
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <GiftedChat
          messages={giftedChatMessages}
          onSend={handleSend}
          user={currentUser}
          loadEarlier={hasNextPage}
          onLoadEarlier={handleLoadEarlier}
          isLoadingEarlier={isFetchingNextPage}
          onInputTextChanged={handleTyping}
          renderSend={renderSend}
          renderInputToolbar={renderInputToolbar}
          messagesContainerStyle={styles.messagesContainer}
          placeholder="Type a message..."
          showAvatarForEveryMessage={false}
          renderAvatar={null} // Disable avatars for now
          alwaysShowSend
          scrollToBottomStyle={styles.scrollToBottom}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.muted,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.background,
    fontWeight: '600',
  },
  messagesContainer: {
    backgroundColor: colors.background,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    marginVertical: 4,
    fontSize: 16,
    color: colors.text,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 4,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  imageButton: {
    padding: 8,
    marginRight: 8,
  },
  imageButtonText: {
    fontSize: 20,
  },
  scrollToBottom: {
    backgroundColor: colors.primary,
  },
});
