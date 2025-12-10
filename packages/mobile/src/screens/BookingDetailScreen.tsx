import type { BookingStatus } from '@524/shared';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { useBookingDetail } from '../query/bookings';
import { colors } from '../theme/colors';

type BookingDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'BookingDetail'>;
type BookingDetailRouteProp = RouteProp<RootStackParamList, 'BookingDetail'>;

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: '대기',
  confirmed: '확정',
  paid: '결제 완료',
  in_progress: '진행 중',
  completed: '완료',
  cancelled: '취소됨',
};

function formatCurrency(amount?: number) {
  if (typeof amount !== 'number') return '-';
  return `${amount.toLocaleString('ko-KR')}원`;
}

function formatSchedule(dateIso?: string, startIso?: string, endIso?: string) {
  if (!dateIso && !startIso) return '일정 미정';
  const start = startIso ?? dateIso;
  const startDate = start ? new Date(start) : null;
  const endDate = endIso ? new Date(endIso) : null;

  if (!startDate) return '일정 미정';

  const y = startDate.getFullYear();
  const m = String(startDate.getMonth() + 1).padStart(2, '0');
  const d = String(startDate.getDate()).padStart(2, '0');
  const startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(
    startDate.getMinutes()
  ).padStart(2, '0')}`;
  const endTime = endDate
    ? `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(
        2,
        '0'
      )}`
    : null;

  return endTime ? `${y}.${m}.${d} ${startTime} - ${endTime}` : `${y}.${m}.${d} ${startTime}`;
}

function formatStatusTimestamp(iso?: string) {
  if (!iso) return '시간 정보 없음';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  return `${y}.${m}.${d} ${hh}:${mm}`;
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const baseStyle =
    status === 'cancelled'
      ? styles.statusCancelled
      : status === 'completed'
        ? styles.statusCompleted
        : styles.statusDefault;

  return (
    <View style={[styles.statusBadge, baseStyle]}>
      <Text style={styles.statusText}>{STATUS_LABELS[status] ?? status}</Text>
    </View>
  );
}

export function BookingDetailScreen() {
  const navigation = useNavigation<BookingDetailNavProp>();
  const route = useRoute<BookingDetailRouteProp>();
  const bookingId = route.params.bookingId;

  const { data, isLoading, isError, refetch } = useBookingDetail(bookingId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.muted}>예약 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.error}>예약 정보를 불러오지 못했어요.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryText}>목록으로 돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const timezoneLabel = data.timezone?.trim() || '미지정';
  const paymentStatusLabel = data.paymentStatus?.trim() || '정보 없음';
  const historyItems = [...(data.statusHistory ?? [])].sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime();
    const bTime = new Date(b.timestamp).getTime();
    const safeATime = Number.isNaN(aTime) ? 0 : aTime;
    const safeBTime = Number.isNaN(bTime) ? 0 : bTime;
    return safeATime - safeBTime;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.bookingNumber}>{data.bookingNumber}</Text>
            <Text style={styles.title}>예약 상세</Text>
          </View>
          <StatusBadge status={data.status} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>일정</Text>
          <Text style={styles.primaryText}>
            {formatSchedule(data.scheduledDate, data.scheduledStartTime, data.scheduledEndTime)}
          </Text>
          <Text style={styles.secondaryText}>타임존: {timezoneLabel}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>아티스트</Text>
          <Text style={styles.primaryText}>{data.artistName ?? '아티스트 미정'}</Text>
          <Text style={styles.secondaryText}>예약 번호: {data.id}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>서비스</Text>
          {(data.services ?? []).map((service) => (
            <View key={service.id} style={styles.serviceRow}>
              <View>
                <Text style={styles.primaryText}>{service.name}</Text>
                <Text style={styles.secondaryText}>{service.durationMinutes}분</Text>
              </View>
              <Text style={styles.primaryText}>{formatCurrency(service.price)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.serviceRow}>
            <Text style={styles.primaryText}>총 금액</Text>
            <Text style={styles.total}>{formatCurrency(data.totalAmount)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이용 장소</Text>
          <Text style={styles.primaryText}>{data.location?.addressLine ?? '주소 정보 없음'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>진행 상태</Text>
          <Text style={styles.primaryText}>결제 상태: {paymentStatusLabel}</Text>
          {historyItems.length ? (
            <View style={styles.historyList}>
              {historyItems.map((entry, index) => (
                <View
                  key={`${entry.status}-${entry.timestamp}-${index}`}
                  style={styles.historyItem}
                >
                  <Text style={styles.primaryText}>
                    {STATUS_LABELS[entry.status as BookingStatus] ?? entry.status}
                  </Text>
                  <Text style={styles.secondaryText}>{formatStatusTimestamp(entry.timestamp)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.secondaryText}>상태 이력이 아직 없습니다.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추가 동작</Text>
          <Text style={styles.secondaryText}>
            취소 및 변경은 곧 제공될 예정입니다. 현재는 확인만 가능합니다.
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.disabledButton, styles.halfButton]} disabled>
              <Text style={styles.disabledText}>예약 취소 (준비 중)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.disabledButton, styles.halfButton]} disabled>
              <Text style={styles.disabledText}>일정 변경 (준비 중)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextGroup: {
    gap: 4,
  },
  bookingNumber: {
    fontSize: 13,
    color: colors.subtle,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  primaryText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  secondaryText: {
    fontSize: 13,
    color: colors.muted,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: colors.background,
  },
  muted: {
    color: colors.muted,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  retryText: {
    color: colors.background,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  disabledButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  halfButton: {
    flex: 1,
  },
  disabledText: {
    color: colors.muted,
    fontWeight: '600',
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
