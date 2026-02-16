import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, spacing } from '../../theme';

export interface QuickActionsProps {
  onSelectWeekdayHours: () => void;
  onCopyPreviousWeek: () => void;
  onClearAll: () => void;
  hasPreviousWeek: boolean;
  disabled?: boolean;
}

export function QuickActions({
  onSelectWeekdayHours,
  onCopyPreviousWeek,
  onClearAll,
  hasPreviousWeek,
  disabled = false,
}: QuickActionsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onSelectWeekdayHours}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Select weekday hours 9 to 5"
      >
        <Text style={[styles.buttonText, disabled && styles.textDisabled]}>평일 09-17시</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, (!hasPreviousWeek || disabled) && styles.buttonDisabled]}
        onPress={onCopyPreviousWeek}
        disabled={!hasPreviousWeek || disabled}
        accessibilityRole="button"
        accessibilityLabel="Copy previous week availability"
      >
        <Text style={[styles.buttonText, (!hasPreviousWeek || disabled) && styles.textDisabled]}>
          이전 주 복사
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.clearButton, disabled && styles.buttonDisabled]}
        onPress={onClearAll}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Clear all selections"
      >
        <Text style={[styles.buttonText, styles.clearButtonText, disabled && styles.textDisabled]}>
          초기화
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  textDisabled: {
    color: colors.muted,
  },
  clearButton: {
    backgroundColor: colors.background,
    borderColor: colors.error,
  },
  clearButtonText: {
    color: colors.error,
  },
});
