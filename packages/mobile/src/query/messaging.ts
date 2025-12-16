import NetInfo from '@react-native-community/netinfo';
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';

import { apiClient } from '../api/client';
import { useSocket } from '../hooks/useSocket';
import { OfflineMessageQueue } from '../services/offlineMessageQueue';
import { useAuthStore } from '../store/authStore';

export interface Conversation {
  id: string;
  bookingId?: string;
  customerId: string;
  artistId: string;
  status: string;
  lastMessageAt: string;
  unreadCountCustomer: number;
  unreadCountArtist: number;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    id: string;
    content?: string;
    messageType: string;
    sentAt: string;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  messageType: string;
  content?: string;
  images?: string[];
  bookingId?: string;
  sentAt: string;
  readAt?: string;
  createdAt: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
    total: number;
  };
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Query keys
export const messagingQueryKeys = {
  conversations: (userRole: string) => ['conversations', userRole],
  conversation: (conversationId: string) => ['conversation', conversationId],
  messages: (conversationId: string) => ['messages', conversationId],
  unreadCount: (userRole: string) => ['unreadCount', userRole],
};

/**
 * Hook to fetch conversations for the current user
 */
export function useConversations(userRole: 'customer' | 'artist') {
  return useInfiniteQuery({
    queryKey: messagingQueryKeys.conversations(userRole),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get<ConversationsResponse>('/messaging/conversations', {
        params: {
          limit: 20,
          offset: pageParam,
        },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.offset + lastPage.pagination.limit;
      }
      return undefined;
    },
    initialPageParam: 0,
  });
}

/**
 * Hook to fetch a single conversation
 */
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: messagingQueryKeys.conversation(conversationId),
    queryFn: async () => {
      const response = await apiClient.get<{ data: Conversation }>(
        `/messaging/conversations/${conversationId}`
      );
      return response.data.data;
    },
    enabled: !!conversationId,
  });
}

/**
 * Hook to fetch messages for a conversation
 */
export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  const query = useInfiniteQuery({
    queryKey: messagingQueryKeys.messages(conversationId),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get<MessagesResponse>(
        `/messaging/conversations/${conversationId}/messages`,
        {
          params: {
            limit: 50,
            offset: pageParam,
          },
        }
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.offset + lastPage.pagination.limit;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: !!conversationId,
  });

  // Listen for real-time message updates
  useEffect(() => {
    if (!socket || !isConnected || !conversationId) return;

    const handleNewMessage = (message: Message) => {
      // Add the new message to the cache
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        messagingQueryKeys.messages(conversationId),
        (oldData) => {
          if (!oldData) return oldData;

          // Check if message already exists (to avoid duplicates)
          const messageExists = oldData.pages.some((page: MessagesResponse) =>
            page.messages.some((m: Message) => m.id === message.id)
          );

          if (messageExists) return oldData;

          // Add to the first page (most recent)
          return {
            ...oldData,
            pages: [
              {
                ...oldData.pages[0],
                messages: [message, ...oldData.pages[0].messages],
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      );

      // Update conversation last message
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.conversation(conversationId),
      });

      // Update conversations list
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.conversations('customer'),
      });
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.conversations('artist'),
      });
    };

    const handleMessageRead = (data: { messageId: string; readBy: string }) => {
      // Update message read status in cache
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        messagingQueryKeys.messages(conversationId),
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: MessagesResponse) => ({
              ...page,
              messages: page.messages.map((message: Message) =>
                message.id === data.messageId
                  ? { ...message, readAt: new Date().toISOString() }
                  : message
              ),
            })),
          };
        }
      );
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:read', handleMessageRead);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:read', handleMessageRead);
    };
  }, [socket, isConnected, conversationId, queryClient]);

  return query;
}

/**
 * Hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const offlineQueue = OfflineMessageQueue.getInstance();

  return useMutation({
    mutationFn: async (params: {
      conversationId: string;
      messageType: 'text' | 'image' | 'system';
      content?: string;
      images?: string[];
      bookingId?: string;
    }) => {
      // Check network connectivity
      const networkState = await NetInfo.fetch();

      if (!networkState.isConnected || !networkState.isInternetReachable) {
        // Queue message for offline sending
        await offlineQueue.enqueueMessage(params);
        throw new Error('Message queued for sending when online');
      }

      // Send via REST API first (for persistence)
      const response = await apiClient.post<{ data: Message }>(
        `/messaging/conversations/${params.conversationId}/messages`,
        {
          messageType: params.messageType,
          content: params.content,
          images: params.images,
          bookingId: params.bookingId,
        }
      );
      return response.data.data;
    },
    onSuccess: (newMessage, variables) => {
      // Optimistically update the messages cache
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        messagingQueryKeys.messages(variables.conversationId),
        (oldData) => {
          if (!oldData) return oldData;

          // Check if message already exists
          const messageExists = oldData.pages.some((page: MessagesResponse) =>
            page.messages.some((m: Message) => m.id === newMessage.id)
          );

          if (messageExists) return oldData;

          // Add to the first page
          return {
            ...oldData,
            pages: [
              {
                ...oldData.pages[0],
                messages: [newMessage, ...oldData.pages[0].messages],
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      );

      // Update conversation last message
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.conversation(variables.conversationId),
      });

      // Update conversations list
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.conversations('customer'),
      });
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.conversations('artist'),
      });
    },
    onError: (error, variables) => {
      console.error('Failed to send message:', error);

      // If it's a network error, the message should already be queued
      if (error?.message === 'Message queued for sending when online') {
        // Optimistically add to UI with pending status
        const tempMessage: Message = {
          id: `temp_${Date.now()}`,
          conversationId: variables.conversationId,
          senderId: 'pending',
          senderRole: 'pending',
          messageType: variables.messageType,
          content: variables.content,
          images: variables.images,
          sentAt: new Date().toISOString(),
        };

        queryClient.setQueryData<InfiniteData<MessagesResponse>>(
          messagingQueryKeys.messages(variables.conversationId),
          (oldData) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: [
                {
                  ...oldData.pages[0],
                  messages: [tempMessage, ...oldData.pages[0].messages],
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        );
      }
    },
  });
}

/**
 * Hook to mark messages as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await apiClient.put(`/messaging/conversations/${conversationId}/read`);
      return response.data;
    },
    onSuccess: (_, conversationId) => {
      // Update conversation in cache
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.conversation(conversationId),
      });

      // Update conversations list
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.conversations('customer'),
      });
      queryClient.invalidateQueries({
        queryKey: messagingQueryKeys.conversations('artist'),
      });
    },
  });
}

/**
 * Hook to get unread message count
 */
export function useUnreadCount(userRole: 'customer' | 'artist') {
  return useQuery({
    queryKey: messagingQueryKeys.unreadCount(userRole),
    queryFn: async () => {
      const response = await apiClient.get<{ data: { unreadCount: number } }>(
        '/messaging/messages/unread-count'
      );
      return response.data.data.unreadCount;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
