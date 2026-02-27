import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, overlays } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

interface ConversationWithDetails {
  id: string;
  bookingId?: string;
  customerId: string;
  artistId: string;
  customerName?: string | null;
  artistName?: string | null;
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

interface ConversationListItemProps {
  conversation: ConversationWithDetails;
  currentUserRole: 'customer' | 'artist';
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ConversationListItem({ conversation, currentUserRole }: ConversationListItemProps) {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate('Chat', {
      conversationId: conversation.id,
    });
  };

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      return 'now';
    }
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    }
    if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    }
    return date.toLocaleDateString();
  };

  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) {
      return 'No messages yet';
    }

    switch (conversation.lastMessage.messageType) {
      case 'image':
        return '📷 Photo';
      case 'system':
        return conversation.lastMessage.content || 'System message';
      default:
        return conversation.lastMessage.content || 'Message';
    }
  };

  // Get the other user's name based on current user role
  const otherUserName =
    currentUserRole === 'customer'
      ? conversation.artistName || 'Artist'
      : conversation.customerName || 'Customer';

  // Get unread count based on current user role
  const unreadCount =
    currentUserRole === 'customer'
      ? (conversation.unreadCountCustomer ?? 0)
      : (conversation.unreadCountArtist ?? 0);

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{otherUserName.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.userName} numberOfLines={1}>
            {otherUserName}
          </Text>
          <Text style={styles.timestamp}>{formatLastMessageTime(conversation.lastMessageAt)}</Text>
        </View>

        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {getLastMessagePreview()}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: overlays.frostedGlass,
    borderWidth: 1,
    borderColor: colors.accentAlt,
    ...shadows.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textMuted,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: overlays.frostedGlassLight,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
});
