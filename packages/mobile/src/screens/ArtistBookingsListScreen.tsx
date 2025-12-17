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

import { ArtistNavigationMenu } from '../components/ArtistNavigationMenu';
import { MenuButton } from '../components/MenuButton';
import { BookingCard } from '../components/bookings/BookingCard';
import { STATUS_LABELS } from '../components/bookings/bookingDisplay';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useArtistBookings } from '../query/bookings';
import { colors } from '../theme/colors';

type ArtistBookingsNavProp = NativeStackNavigationProp<RootStackParamList, 'ArtistBookingsList'>;

const STATUS_CHIPS: Array<{ value: BookingStatus | 'all'; label: string }> = [
  { value: 'pending', label: STATUS_LABELS.pending },
  { value: 'all', label: '전체' },
  { value: 'confirmed', label: STATUS_LABELS.confirmed },
  { value: 'declined', label: STATUS_LABELS.declined },
  { value: 'cancelled', label: STATUS_LABELS.cancelled },
  { value: 'completed', label: STATUS_LABELS.completed },
];

export function ArtistBookingsListScreen() {
  const navigation = useNavigation<ArtistBookingsNavProp>();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('pending');
  const [menuVisible, setMenuVisible] = useState(false);

  const {
    data: bookings,
    isLoading,
    isError,
    refetch,
    isRefetching,
    isFetching,
  } = useArtistBookings(statusFilter === 'all' ? undefined : statusFilter);

  const sortedBookings = useMemo(
    () =>
      (bookings ?? []).slice().sort((a, b) => {
        const aDate = new Date(a.scheduledDate ?? a.scheduledStartTime).getTime();
        const bDate = new Date(b.scheduledDate ?? b.scheduledStartTime).getTime();
        return bDate - aDate;
      }),
    [bookings]
  );

  const handleSelectBooking = (bookingId: string) => {
    navigation.navigate('ArtistBookingDetail', { bookingId });
  };

  const renderItem = ({ item }: { item: BookingSummary }) => (
    <BookingCard booking={item} onPress={() => handleSelectBooking(item.id)} hideArtist />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>예약 요청</Text>
          <Text style={styles.subtitle}>대기 중인 예약을 확인하고 응답하세요.</Text>
        </View>
        <MenuButton onPress={() => setMenuVisible(true)} />
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

      {isFetching ? (
        <View style={styles.centered} testID="loading-indicator">
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.mutedText}>
            {isLoading ? '예약을 불러오는 중...' : '필터를 적용하는 중...'}
          </Text>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>예약을 불러오지 못했어요. 다시 시도해 주세요.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
            testID="retry-button"
          >
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : sortedBookings.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.mutedText}>표시할 예약이 없어요.</Text>
          <Text style={styles.mutedTextSmall}>새로운 예약 요청이 오면 여기에 표시됩니다.</Text>
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
      <ArtistNavigationMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  header: {
    flex: 1,
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
