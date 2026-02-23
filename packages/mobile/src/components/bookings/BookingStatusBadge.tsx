import type { BookingStatus } from '@524/shared';
import React from 'react';
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, statusColors } from '../../theme/colors';
import { STATUS_LABELS } from './bookingDisplay';

interface Props {
  status: BookingStatus;
  style?: StyleProp<ViewStyle>;
}

export function BookingStatusBadge({ status, style }: Props) {
  const baseStyle =
    status === 'cancelled'
      ? styles.statusCancelled
      : status === 'declined'
        ? styles.statusDeclined
        : status === 'completed'
          ? styles.statusCompleted
          : styles.statusDefault;

  return (
    <View style={[styles.statusBadge, baseStyle, style]}>
      <Text style={styles.statusText}>{STATUS_LABELS[status] ?? status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: statusColors.pending,
  },
  statusCompleted: {
    backgroundColor: statusColors.completed,
  },
  statusDeclined: {
    backgroundColor: statusColors.declined,
  },
  statusCancelled: {
    backgroundColor: statusColors.cancelled,
  },
});
