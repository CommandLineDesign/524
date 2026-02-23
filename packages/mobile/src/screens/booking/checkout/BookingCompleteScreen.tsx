import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BookingLayout, ContinueButton } from '../../../components/booking';
import { bookingCompleteStrings } from '../../../constants/bookingOptions';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { borderRadius, colors, spacing } from '../../../theme';

interface BookingCompleteScreenProps {
  onGoHome: () => void;
  onViewDetails?: () => void;
}

export function BookingCompleteScreen({ onGoHome, onViewDetails }: BookingCompleteScreenProps) {
  const { createdBookingId, selectedDate, selectedTimeSlot } = useBookingFlowStore();

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

  // Use the real booking ID from the API - should always be present after successful booking
  const displayBookingId = createdBookingId ?? '';

  return (
    <BookingLayout
      title=""
      showCloseButton={false}
      scrollable={false}
      footer={
        <View style={styles.footer}>
          {onViewDetails && (
            <ContinueButton
              label={bookingCompleteStrings.viewDetails}
              onPress={onViewDetails}
              variant="primary"
            />
          )}
          <ContinueButton
            label={bookingCompleteStrings.goHome}
            onPress={onGoHome}
            variant={onViewDetails ? 'secondary' : 'primary'}
          />
        </View>
      }
      testID="booking-complete-screen"
    >
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.successIcon}>
            <CheckIcon />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{bookingCompleteStrings.title}</Text>
        <Text style={styles.subtitle}>{bookingCompleteStrings.subtitle}</Text>

        {/* Booking Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.bookingNumber}>
            {bookingCompleteStrings.bookingNumber(displayBookingId)}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.dateTime}>{formatDateTime()}</Text>
        </View>
      </View>
    </BookingLayout>
  );
}

function CheckIcon() {
  return (
    <View style={styles.checkIcon}>
      <View style={styles.checkLine1} />
      <View style={styles.checkLine2} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  checkLine1: {
    position: 'absolute',
    width: 16,
    height: 4,
    backgroundColor: colors.background,
    transform: [{ rotate: '45deg' }],
    top: 24,
    left: 4,
    borderRadius: 2,
  },
  checkLine2: {
    position: 'absolute',
    width: 28,
    height: 4,
    backgroundColor: colors.background,
    transform: [{ rotate: '-45deg' }],
    top: 18,
    left: 12,
    borderRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtle,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  infoCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  bookingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  dateTime: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    gap: spacing.sm,
  },
});
