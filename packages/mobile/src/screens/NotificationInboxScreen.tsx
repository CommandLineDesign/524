import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NotificationItem } from '../api/client';
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from '../hooks/useNotifications';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { formatRelativeTime } from '../utils/dateDisplay';

type NotificationNavProp = NativeStackNavigationProp<RootStackParamList, 'NotificationInbox'>;

function NotificationItemRow({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: () => void;
}) {
  const isUnread = !item.readAt;

  return (
    <TouchableOpacity
      style={[styles.notificationItem, isUnread && styles.notificationItemUnread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, isUnread && styles.notificationTitleUnread]}>
            {item.title}
          </Text>
          {isUnread && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationBody} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.notificationTime}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.subtle} />
    </TouchableOpacity>
  );
}

export function NotificationInboxScreen() {
  const navigation = useNavigation<NotificationNavProp>();
  const { data: notifications, isLoading, isError, refetch, isRefetching } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleNotificationPress = useCallback(
    (notification: NotificationItem) => {
      // Mark as read
      if (!notification.readAt) {
        markAsRead.mutate(notification.id);
      }

      // Navigate based on notification type
      const data = notification.data;
      if (!data) return;

      switch (data.type) {
        case 'booking_created':
        case 'booking_status_changed':
          if (data.bookingId) {
            navigation.navigate('BookingDetail', { bookingId: data.bookingId });
          }
          break;
        case 'new_message':
          if (data.chatId) {
            navigation.navigate('Chat', { conversationId: data.chatId });
          }
          break;
        default:
          // Unknown type - just mark as read
          break;
      }
    },
    [navigation, markAsRead]
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  const hasUnread = notifications?.some((n) => !n.readAt);

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <NotificationItemRow item={item} onPress={() => handleNotificationPress(item)} />
    ),
    [handleNotificationPress]
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>알림</Text>
        {hasUnread && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
          >
            <Text style={styles.markAllText}>모두 읽음</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.mutedText}>알림을 불러오는 중...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>알림을 불러오지 못했어요.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : notifications?.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="notifications-off-outline" size={48} color={colors.subtle} />
          <Text style={styles.mutedText}>아직 알림이 없어요</Text>
          <Text style={styles.mutedTextSmall}>새로운 소식이 있으면 여기에 표시됩니다.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  listContent: {
    paddingBottom: 24,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  notificationItemUnread: {
    backgroundColor: colors.surfaceHighlight,
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  notificationTitleUnread: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notificationBody: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.subtle,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  mutedText: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
  },
  mutedTextSmall: {
    fontSize: 13,
    color: colors.subtle,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  retryText: {
    color: colors.background,
    fontWeight: '600',
  },
});
