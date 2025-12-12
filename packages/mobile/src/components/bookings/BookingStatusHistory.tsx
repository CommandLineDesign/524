import type { BookingStatus, BookingStatusHistoryEntry } from '@524/shared';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { STATUS_LABELS, formatStatusTimestamp } from './bookingDisplay';

interface Props {
  history?: BookingStatusHistoryEntry[];
  statusLabels?: Record<string, string>;
}

export function BookingStatusHistory({ history, statusLabels }: Props) {
  const effectiveHistory = [...(history ?? [])].sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime();
    const bTime = new Date(b.timestamp).getTime();
    return (Number.isNaN(aTime) ? 0 : aTime) - (Number.isNaN(bTime) ? 0 : bTime);
  });

  if (!effectiveHistory.length) {
    return <Text style={styles.secondaryText}>상태 이력이 아직 없습니다.</Text>;
  }

  return (
    <View style={styles.historyList}>
      {effectiveHistory.map((entry, index) => (
        <View key={`${entry.status}-${entry.timestamp}-${index}`} style={styles.historyItem}>
          <Text style={styles.primaryText}>
            {(statusLabels ?? STATUS_LABELS)[entry.status as BookingStatus] ?? entry.status}
          </Text>
          <Text style={styles.secondaryText}>{formatStatusTimestamp(entry.timestamp)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  historyList: {
    gap: 8,
  },
  historyItem: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
});
