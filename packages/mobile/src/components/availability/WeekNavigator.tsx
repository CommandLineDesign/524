import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, spacing } from '../../theme';
import { formatWeekDisplay, getNextWeekId, getPreviousWeekId } from '../../utils/weekUtils';

export interface WeekNavigatorProps {
  weekId: string;
  onWeekChange: (weekId: string) => void;
  disabled?: boolean;
}

export function WeekNavigator({ weekId, onWeekChange, disabled = false }: WeekNavigatorProps) {
  const displayText = formatWeekDisplay(weekId);

  const handlePrevious = useCallback(() => {
    if (disabled) return;
    onWeekChange(getPreviousWeekId(weekId));
  }, [weekId, onWeekChange, disabled]);

  const handleNext = useCallback(() => {
    if (disabled) return;
    onWeekChange(getNextWeekId(weekId));
  }, [weekId, onWeekChange, disabled]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.arrowButton, disabled && styles.buttonDisabled]}
        onPress={handlePrevious}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Previous week"
        accessibilityHint="Navigate to the previous week"
      >
        <Text style={[styles.arrowText, disabled && styles.textDisabled]}>←</Text>
      </TouchableOpacity>

      <View style={styles.displayContainer}>
        <Text style={styles.displayText}>{displayText}</Text>
      </View>

      <TouchableOpacity
        style={[styles.arrowButton, disabled && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Next week"
        accessibilityHint="Navigate to the next week"
      >
        <Text style={[styles.arrowText, disabled && styles.textDisabled]}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  arrowText: {
    fontSize: 20,
    color: colors.text,
    fontWeight: '600',
  },
  textDisabled: {
    color: colors.muted,
  },
  displayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  displayText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
