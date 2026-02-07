import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius } from '../../theme/borderRadius';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export interface TimeSelectorButtonProps {
  date: string | null; // ISO date string
  timeSlot: string | null; // e.g., "19:00"
  onPress: () => void;
}

/**
 * Format date and time for display
 * @param dateString - ISO date string
 * @param timeSlot - Time in HH:MM format
 * @returns Formatted string like "2월 6일, 오후 7:00"
 */
function formatDateTime(dateString: string | null, timeSlot: string | null): string {
  if (!dateString || !timeSlot) {
    return '날짜 및 시간 선택';
  }

  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Parse time slot
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const isPM = hours >= 12;
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const period = isPM ? '오후' : '오전';

  return `${month}월 ${day}일, ${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
}

export function TimeSelectorButton({ date, timeSlot, onPress }: TimeSelectorButtonProps) {
  const displayText = formatDateTime(date, timeSlot);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`선택된 시간: ${displayText}`}
      accessibilityHint="탭하여 날짜와 시간을 변경합니다"
    >
      <View style={styles.iconContainer}>
        <Ionicons name="time-outline" size={20} color={colors.text} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.text} numberOfLines={1}>
          {displayText}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
});
