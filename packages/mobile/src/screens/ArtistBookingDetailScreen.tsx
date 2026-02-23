import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingStatusBadge } from '../components/bookings/BookingStatusBadge';
import { BookingStatusHistory } from '../components/bookings/BookingStatusHistory';
import { formatCurrency, formatSchedule } from '../components/bookings/bookingDisplay';
import type { RootStackParamList } from '../navigation/AppNavigator';
import {
  useAcceptBookingMutation,
  useBookingDetail,
  useCompleteBookingMutation,
  useDeclineBookingMutation,
  useUpdateBookingStatusMutation,
} from '../query/bookings';
import { useCreateConversation } from '../query/messaging';
import { colors } from '../theme/colors';

// Helper function to get user-friendly error messages from API errors
function getBookingErrorMessage(
  error: unknown,
  action: 'accept' | 'decline' | 'complete' | 'start'
): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('not found') || message.includes('404')) {
      return '예약을 찾을 수 없습니다.';
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return '이 예약을 수정할 권한이 없습니다.';
    }
    if (message.includes('only pending') || message.includes('409')) {
      return '대기 중인 예약만 처리할 수 있습니다.';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return '네트워크 오류가 발생했습니다. 다시 시도해 주세요.';
    }

    // Return the original message if it's already user-friendly Korean
    if (message.includes('예약') || message.includes('실패') || message.includes('오류')) {
      return error.message;
    }
  }

  // Fallback messages
  if (action === 'accept') return '예약 승인에 실패했습니다.';
  if (action === 'decline') return '예약 거절에 실패했습니다.';
  if (action === 'complete') return '예약 완료 처리에 실패했습니다.';
  if (action === 'start') return '서비스 시작에 실패했습니다.';
  return '예약 처리에 실패했습니다.';
}

type ArtistBookingDetailNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ArtistBookingDetail'
>;
type ArtistBookingDetailRouteProp = RouteProp<RootStackParamList, 'ArtistBookingDetail'>;

export function ArtistBookingDetailScreen() {
  const navigation = useNavigation<ArtistBookingDetailNavProp>();
  const route = useRoute<ArtistBookingDetailRouteProp>();
  const bookingId = route.params.bookingId;

  const { data, isLoading, isError, refetch } = useBookingDetail(bookingId);
  const acceptMutation = useAcceptBookingMutation();
  const declineMutation = useDeclineBookingMutation();
  const completeMutation = useCompleteBookingMutation();
  const updateStatusMutation = useUpdateBookingStatusMutation();
  const createConversationMutation = useCreateConversation();

  const isPending = data?.status === 'pending';
  const canStartService = data?.status === 'confirmed' && data?.paymentStatus === 'paid';
  const canComplete = data?.status === 'in_progress' && data?.paymentStatus === 'paid';

  const handleAccept = () => {
    if (!data) return;
    acceptMutation.mutate(data.id, {
      onSuccess: () => {
        Alert.alert('예약을 확정했습니다');
      },
      onError: (error) => {
        const message = getBookingErrorMessage(error, 'accept');
        Alert.alert('승인 실패', message);
      },
    });
  };

  const handleDecline = () => {
    if (!data) return;
    declineMutation.mutate(
      { bookingId: data.id },
      {
        onSuccess: () => {
          Alert.alert('예약을 거절했습니다');
          navigation.goBack();
        },
        onError: (error) => {
          const message = getBookingErrorMessage(error, 'decline');
          Alert.alert('거절 실패', message);
        },
      }
    );
  };

  const handleComplete = () => {
    if (!data) return;
    completeMutation.mutate(data.id, {
      onSuccess: () => {
        Alert.alert('예약을 완료 처리했습니다', '고객이 이제 리뷰를 작성할 수 있습니다.');
      },
      onError: (error) => {
        const message = getBookingErrorMessage(error, 'complete');
        Alert.alert('완료 처리 실패', message);
      },
    });
  };

  const handleStartService = () => {
    if (!data) return;
    updateStatusMutation.mutate(
      { bookingId: data.id, status: 'in_progress' },
      {
        onSuccess: () => {
          Alert.alert('서비스가 시작되었습니다');
        },
        onError: (error) => {
          const message = getBookingErrorMessage(error, 'start');
          Alert.alert('서비스 시작 실패', message);
        },
      }
    );
  };

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

  const paymentStatusLabel = data.paymentStatus?.trim() || '정보 없음';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.bookingNumber}>{data.bookingNumber}</Text>
            <Text style={styles.title}>예약 요청 상세</Text>
          </View>
          <BookingStatusBadge status={data.status} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>일정</Text>
          <Text style={styles.primaryText}>
            {formatSchedule(data.scheduledDate, data.scheduledStartTime, data.scheduledEndTime)}
          </Text>
          <Text style={styles.secondaryText}>예약 ID: {data.id}</Text>
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
          <Text style={styles.sectionTitle}>진행 상태</Text>
          <Text style={styles.primaryText}>결제 상태: {paymentStatusLabel}</Text>
          <BookingStatusHistory history={data.statusHistory} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메시지</Text>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={async () => {
              try {
                if (!data?.customerId) {
                  Alert.alert('오류', '고객 정보를 찾을 수 없습니다.');
                  return;
                }

                const conversation = await createConversationMutation.mutateAsync({
                  artistId: data.artistId,
                  bookingId: bookingId,
                });

                navigation.navigate('Chat', {
                  conversationId: conversation.id,
                  bookingId: bookingId,
                });
              } catch (error) {
                console.error('Failed to create conversation:', error);
                Alert.alert(
                  '메시지 시작 실패',
                  '대화를 시작할 수 없습니다. 잠시 후 다시 시도해 주세요.'
                );
              }
            }}
          >
            <Text style={styles.messageButtonText}>고객에게 메시지 보내기</Text>
          </TouchableOpacity>
        </View>

        {isPending ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>응답</Text>
            <Text style={styles.secondaryText}>예약을 수락하거나 거절할 수 있습니다.</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={handleDecline}
                disabled={declineMutation.isPending}
              >
                {declineMutation.isPending ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.declineText}>거절</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAccept}
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.acceptText}>확정</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : canStartService ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>서비스 시작</Text>
            <Text style={styles.secondaryText}>고객이 도착했으면 서비스를 시작하세요.</Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={handleStartService}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.startText}>서비스 시작</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : canComplete ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>서비스 완료</Text>
            <Text style={styles.secondaryText}>
              서비스를 완료했으면 완료 처리하여 고객이 리뷰를 작성할 수 있도록 하세요.
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => {
                console.log('Complete service button pressed');
                handleComplete();
              }}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.completeText}>완료 처리</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>응답</Text>
            <Text style={styles.secondaryText}>이 예약은 더 이상 응답이 필요하지 않습니다.</Text>
          </View>
        )}
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
    color: colors.error,
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
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  completeButton: {
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  declineText: {
    color: colors.text,
    fontWeight: '700',
  },
  acceptText: {
    color: colors.background,
    fontWeight: '700',
  },
  completeText: {
    color: colors.background,
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  startText: {
    color: colors.background,
    fontWeight: '700',
  },
  messageButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  messageButtonText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '600',
  },
});
