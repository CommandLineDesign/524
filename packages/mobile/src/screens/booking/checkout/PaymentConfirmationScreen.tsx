import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { createBooking, getArtistById } from '../../../api/client';
import { BookingLayout, ContinueButton, OccasionTypeahead } from '../../../components/booking';
import { paymentStrings } from '../../../constants/bookingOptions';
import { useAuthStore } from '../../../store/authStore';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { borderRadius, colors, spacing } from '../../../theme';

interface PaymentConfirmationScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  onExit?: () => void;
  showBackButton?: boolean;
  progress: number;
}

export function PaymentConfirmationScreen({
  onContinue,
  onBack,
  onExit,
  showBackButton = false,
  progress,
}: PaymentConfirmationScreenProps) {
  const {
    selectedArtistId,
    selectedDate,
    selectedTimeSlot,
    serviceType,
    location,
    occasion,
    setOccasion,
    customerNotes,
    setCustomerNotes,
    buildBookingPayload,
  } = useBookingFlowStore();

  const user = useAuthStore((state) => state.user);
  const [notes, setNotes] = useState(customerNotes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch artist data
  const {
    data: artist,
    isLoading: isArtistLoading,
    isError: isArtistError,
  } = useQuery({
    queryKey: ['artist', selectedArtistId],
    queryFn: () => (selectedArtistId ? getArtistById(selectedArtistId) : Promise.reject()),
    enabled: Boolean(selectedArtistId),
  });

  // Build price items from artist's service prices based on selected service type
  const priceItems = useMemo(() => {
    if (!artist) return [];

    const items: Array<{ name: string; price: number }> = [];

    if ((serviceType === 'hair' || serviceType === 'combo') && artist.servicePrices?.hair) {
      items.push({ name: '헤어', price: artist.servicePrices.hair });
    }
    if ((serviceType === 'makeup' || serviceType === 'combo') && artist.servicePrices?.makeup) {
      items.push({ name: '메이크업', price: artist.servicePrices.makeup });
    }

    return items;
  }, [artist, serviceType]);

  // Calculate totals from price items
  const totalAmount = priceItems.reduce((sum, item) => sum + item.price, 0);
  const estimatedDuration = priceItems.length * 60; // Default 60 min per service

  const handleNotesChange = (text: string) => {
    setNotes(text);
    setCustomerNotes(text);
  };

  const handleConfirm = async () => {
    if (!user?.id) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    // Pass artist prices to build the booking payload
    const payload = buildBookingPayload(user.id, artist?.servicePrices);
    if (!payload) {
      Alert.alert(
        '정보가 부족해요',
        '서비스, 아티스트, 일정 정보를 모두 선택한 후 다시 시도해주세요.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await createBooking(payload);
      Alert.alert('예약 요청 완료', '예약이 성공적으로 생성되었습니다.');
      onContinue();
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      Alert.alert('예약에 실패했습니다', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = () => {
    if (!selectedDate) return '-';
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekday}) ${selectedTimeSlot ?? ''}`;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `약 ${hours}시간 ${mins}분`;
    if (hours > 0) return `약 ${hours}시간`;
    return `약 ${mins}분`;
  };

  return (
    <BookingLayout
      title={paymentStrings.title}
      subtitle={paymentStrings.subtitle}
      showCloseButton={Boolean(onExit)}
      onClose={onExit}
      onBack={onBack}
      showBackButton={showBackButton}
      scrollable={false}
      footer={
        <View style={styles.footerContent}>
          <ContinueButton
            label={paymentStrings.confirmButton}
            onPress={handleConfirm}
            loading={isSubmitting}
            subtitle={paymentStrings.termsNotice}
          />
        </View>
      }
      testID="payment-confirmation-screen"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Artist Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{paymentStrings.sections.artist}</Text>
          {isArtistLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : isArtistError || !artist ? (
            <Text style={styles.sectionValue}>선택된 아티스트</Text>
          ) : (
            <>
              <Text style={styles.sectionValue}>{artist.stageName}</Text>
              {artist.specialties && artist.specialties.length > 0 && (
                <Text style={styles.sectionSubvalue}>{artist.specialties.join(', ')}</Text>
              )}
            </>
          )}
        </View>

        {/* Date & Time Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{paymentStrings.sections.dateTime}</Text>
          <Text style={styles.sectionValue}>{formatDateTime()}</Text>
          <Text style={styles.sectionSubvalue}>{formatDuration(estimatedDuration)}</Text>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{paymentStrings.sections.services}</Text>
          {priceItems.length > 0 ? (
            priceItems.map((item, index) => (
              <View key={`${item.name}-${index}`} style={styles.treatmentRow}>
                <Text style={styles.treatmentName}>{item.name}</Text>
                <Text style={styles.treatmentPrice}>{item.price.toLocaleString('ko-KR')}원</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>선택된 서비스가 없습니다</Text>
          )}
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{paymentStrings.sections.location}</Text>
          <Text style={styles.sectionValue}>{location ?? '-'}</Text>
        </View>

        {/* Occasion Section */}
        <View style={[styles.section, styles.occasionSection]}>
          <Text style={styles.sectionTitle}>{paymentStrings.sections.occasion}</Text>
          <OccasionTypeahead
            value={occasion}
            onSelect={setOccasion}
            placeholder="일정을 선택하거나 입력해주세요"
            testID="occasion-typeahead"
          />
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{paymentStrings.sections.notes}</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={handleNotesChange}
            placeholder={paymentStrings.notesPlaceholder}
            placeholderTextColor={colors.muted}
            selectionColor={colors.text}
            cursorColor={colors.text}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            accessibilityLabel={paymentStrings.sections.notes}
          />
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{paymentStrings.priceBreakdown.subtotal}</Text>
            <Text style={styles.priceValue}>{totalAmount.toLocaleString('ko-KR')}원</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{paymentStrings.priceBreakdown.discount}</Text>
            <Text style={styles.priceValue}>0원</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{paymentStrings.priceBreakdown.total}</Text>
            <Text style={styles.totalValue}>{totalAmount.toLocaleString('ko-KR')}원</Text>
          </View>
        </View>
      </ScrollView>
    </BookingLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  occasionSection: {
    zIndex: 100,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sectionValue: {
    fontSize: 16,
    color: colors.text,
  },
  sectionSubvalue: {
    fontSize: 14,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  treatmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  treatmentName: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  treatmentPrice: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    minHeight: 80,
  },
  priceSection: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    color: colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  footerContent: {
    gap: spacing.xs,
  },
});
