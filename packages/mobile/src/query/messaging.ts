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
import { useSocket } from '../contexts/SocketContext';
import { OfflineMessageQueue } from '../services/offlineMessageQueue';
import { useAuthStore } from '../store/authStore';

export interface Conversation {
  id: string;
  bookingId?: string;
  customerId: string;
  artistId: string;
  status: string;
  lastMessageAt: Date;
  unreadCountCustomer: number;
  unreadCountArtist: number;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: {
    id: string;
    content?: string;
    messageType: string;
    sentAt: Date;
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
  createdAt?: string;
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
      const response = await apiClient.get<{
        success: boolean;
        data: Conversation[];
        pagination: { limit: number; offset: number; hasMore: boolean; total: number };
      }>('/api/v1/messaging/conversations', {
        params: {
          limit: '20',
          offset: pageParam.toString(),
        },
      });
      return {
        conversations: response.data.map((conv) => ({
          ...conv,
          lastMessageAt: new Date(conv.lastMessageAt),
          archivedAt: conv.archivedAt ? new Date(conv.archivedAt) : undefined,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          lastMessage: conv.lastMessage
            ? {
                ...conv.lastMessage,
                sentAt: new Date(conv.lastMessage.sentAt),
              }
            : undefined,
        })),
        pagination: response.pagination,
      };
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
      const response = await apiClient.get<{ success: boolean; data: Conversation }>(
        `/api/v1/messaging/conversations/${conversationId}`
      );
      return response.data;
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
      const response = await apiClient.get<{
        success: boolean;
        data: Message[];
        pagination: { limit: number; offset: number; hasMore: boolean };
      }>(`/api/v1/messaging/conversations/${conversationId}/messages`, {
        params: {
          limit: '50',
          offset: pageParam.toString(),
        },
      });
      return {
        messages: response.data,
        pagination: response.pagination,
      };
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
      console.log('[useMessages] Received new message via socket:', message.id);

      // Add the new message to the cache
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        messagingQueryKeys.messages(conversationId),
        (oldData) => {
          if (!oldData) {
            console.log('[useMessages] No existing data in cache');
            return oldData;
          }

          // Check if message already exists (to avoid duplicates)
          const messageExists = oldData.pages.some((page: MessagesResponse) =>
            page.messages.some((m: Message) => m.id === message.id)
          );

          if (messageExists) {
            console.log('[useMessages] Message already exists in cache, skipping');
            return oldData;
          }

          console.log('[useMessages] Adding new message to cache at beginning of first page');

          // Add to the first page (most recent) at the beginning
          // API returns messages in descending order (newest first)
          // So new messages go at index 0
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
      const response = await apiClient.post<{ success: boolean; data: Message }>(
        `/api/v1/messaging/conversations/${params.conversationId}/messages`,
        {
          messageType: params.messageType,
          content: params.content,
          images: params.images,
          bookingId: params.bookingId,
        }
      );
      return response.data;
    },
    onSuccess: (newMessage, variables) => {
      console.log('[useSendMessage] Message sent successfully:', newMessage.id);

      // Update the messages cache
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        messagingQueryKeys.messages(variables.conversationId),
        (oldData) => {
          if (!oldData) {
            console.log('[useSendMessage] No existing data in cache');
            return oldData;
          }

          // Check if message already exists (might have come via socket already)
          const messageExists = oldData.pages.some((page: MessagesResponse) =>
            page.messages.some((m: Message) => m.id === newMessage.id)
          );

          if (messageExists) {
            console.log(
              '[useSendMessage] Message already exists in cache (likely from socket), skipping'
            );
            return oldData;
          }

          console.log('[useSendMessage] Adding sent message to cache at beginning of first page');

          // Add to the first page (most recent) at the beginning
          // API returns messages in descending order (newest first)
          // So new messages go at index 0
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
      console.error('[useSendMessage] Failed to send message:', error);

      // If it's a network error, the message should already be queued
      if (error?.message === 'Message queued for sending when online') {
        console.log('[useSendMessage] Message queued for offline, adding temp message to UI');

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

            // Add to the first page (most recent) at the beginning
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
      // biome-ignore lint/suspicious/noExplicitAny: response data type for mark as read
      const response = await apiClient.put<{ success: boolean; data: any }>(
        `/api/v1/messaging/conversations/${conversationId}/read`
      );
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
 * Hook to create or get a conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { artistId: string; bookingId?: string }) => {
      const response = await apiClient.post<{ success: boolean; data: Conversation }>(
        '/api/v1/messaging/conversations',
        params
      );
      return response.data;
    },
    onSuccess: (newConversation) => {
      // Add the new conversation to the conversations cache
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
      const response = await apiClient.get<{ success: boolean; data: { unreadCount: number } }>(
        '/api/v1/messaging/messages/unread-count'
      );
      return response.data.unreadCount;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
