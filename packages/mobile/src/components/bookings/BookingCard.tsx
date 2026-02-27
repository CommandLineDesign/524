import type { BookingSummary } from '@524/shared';
import React from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { BookingStatusBadge } from './BookingStatusBadge';
import { formatCurrency, formatSchedule, summarizeServices } from './bookingDisplay';

interface BookingCardProps {
  booking: BookingSummary;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  footerContent?: React.ReactNode;
  hideArtist?: boolean;
  rightContent?: React.ReactNode;
}

export function BookingCard({
  booking,
  onPress,
  containerStyle,
  footerContent,
  hideArtist = false,
  rightContent,
}: BookingCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, accessibilityRole: 'button' as const } : {};

  return (
    <Wrapper style={[styles.card, containerStyle]} {...wrapperProps}>
      <View style={styles.cardHeader}>
        <Text style={styles.bookingNumber}>{booking.bookingNumber}</Text>
        <BookingStatusBadge status={booking.status} />
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.serviceText}>{summarizeServices(booking.services ?? [])}</Text>
        {!hideArtist && (
          <Text style={styles.artistText}>{booking.artistName ?? '아티스트 미정'}</Text>
        )}
        <Text style={styles.scheduleText}>
          {formatSchedule(booking.scheduledDate, booking.scheduledStartTime)}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        {footerContent ?? (
          <>
            <Text style={styles.footerLabel}>총 금액</Text>
            <Text style={styles.amount}>{formatCurrency(booking.totalAmount)}</Text>
          </>
        )}
        {rightContent}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.accentAlt,
    gap: 10,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingNumber: {
    fontSize: 13,
    color: colors.textMuted,
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
    color: colors.textMuted,
  },
  scheduleText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  footerLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
