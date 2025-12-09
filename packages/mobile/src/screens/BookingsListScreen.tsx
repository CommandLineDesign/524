import type { BookingStatus, BookingSummary } from '@524/shared';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
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

import type { RootStackParamList } from '../navigation/AppNavigator';
import { useCustomerBookings } from '../query/bookings';
import { colors } from '../theme/colors';

type BookingsNavProp = NativeStackNavigationProp<RootStackParamList, 'BookingsList'>;

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: '대기',
  confirmed: '확정',
  paid: '결제 완료',
  in_progress: '진행 중',
  completed: '완료',
  cancelled: '취소됨',
};

const STATUS_CHIPS: Array<{ value: BookingStatus | 'all'; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: STATUS_LABELS.pending },
  { value: 'confirmed', label: STATUS_LABELS.confirmed },
  { value: 'paid', label: STATUS_LABELS.paid },
  { value: 'in_progress', label: STATUS_LABELS.in_progress },
  { value: 'completed', label: STATUS_LABELS.completed },
  { value: 'cancelled', label: STATUS_LABELS.cancelled },
];

function formatCurrency(amount?: number) {
  if (typeof amount !== 'number') return '-';
  return `${amount.toLocaleString('ko-KR')}원`;
}

function formatSchedule(dateIso?: string, startIso?: string) {
  if (!dateIso && !startIso) return '일정 미정';

  const base = startIso ?? dateIso;
  const parsed = base ? new Date(base) : null;
  if (!parsed) return '일정 미정';

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function ServiceSummary({ services }: { services: { name: string }[] }) {
  const primary = services?.[0]?.name ?? '서비스 정보 없음';
  const extraCount = Math.max((services?.length ?? 0) - 1, 0);
  const label = extraCount > 0 ? `${primary} 외 ${extraCount}건` : primary;

  return <Text style={styles.serviceText}>{label}</Text>;
}

export function BookingsListScreen() {
  const navigation = useNavigation<BookingsNavProp>();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  const {
    data: bookings,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useCustomerBookings(statusFilter === 'all' ? undefined : statusFilter);

  const sortedBookings = useMemo(
    () =>
      (bookings ?? []).slice().sort((a, b) => {
        const aDate = new Date(a.scheduledDate).getTime();
        const bDate = new Date(b.scheduledDate).getTime();
        return bDate - aDate;
      }),
    [bookings]
  );

  const handleSelectBooking = (bookingId: string) => {
    navigation.navigate('BookingDetail', { bookingId });
  };

  const renderItem = ({ item }: { item: BookingSummary }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelectBooking(item.id)}
      accessibilityRole="button"
    >
      <View style={styles.cardHeader}>
        <Text style={styles.bookingNumber}>{item.bookingNumber}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === 'cancelled'
              ? styles.statusCancelled
              : item.status === 'completed'
                ? styles.statusCompleted
                : styles.statusDefault,
          ]}
        >
          <Text style={styles.statusText}>
            {STATUS_LABELS[item.status as BookingStatus] ?? item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <ServiceSummary services={item.services ?? []} />
        <Text style={styles.artistText}>{item.artistName ?? '아티스트 미정'}</Text>
        <Text style={styles.scheduleText}>
          {formatSchedule(item.scheduledDate, item.scheduledStartTime)}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.footerLabel}>총 금액</Text>
        <Text style={styles.amount}>{formatCurrency(item.totalAmount)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>내 예약</Text>
        <Text style={styles.subtitle}>지난 예약과 예정된 예약을 한 곳에서 확인하세요.</Text>
      </View>

      <View style={styles.filters}>
        {STATUS_CHIPS.map((chip) => {
          const isActive = statusFilter === chip.value;
          return (
            <TouchableOpacity
              key={chip.value}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setStatusFilter(chip.value)}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.mutedText}>예약을 불러오는 중...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>예약을 불러오지 못했어요. 다시 시도해 주세요.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : sortedBookings.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.mutedText}>표시할 예약이 없어요.</Text>
          <Text style={styles.mutedTextSmall}>새로운 예약을 진행하면 여기에 표시됩니다.</Text>
        </View>
      ) : (
        <FlatList
          data={sortedBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.subtle,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  filterChipActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  filterText: {
    color: colors.subtle,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingNumber: {
    fontSize: 13,
    color: colors.subtle,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  statusDefault: {
    backgroundColor: '#eef2ff',
  },
  statusCompleted: {
    backgroundColor: '#ecfdf3',
  },
  statusCancelled: {
    backgroundColor: '#fef2f2',
  },
  cardBody: {
    gap: 4,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  artistText: {
    fontSize: 14,
    color: colors.subtle,
  },
  scheduleText: {
    fontSize: 13,
    color: colors.muted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  footerLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  mutedText: {
    fontSize: 14,
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
    color: '#b91c1c',
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
