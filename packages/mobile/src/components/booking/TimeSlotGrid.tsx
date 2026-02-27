import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { scheduleStrings, timeSlots } from '../../constants/bookingOptions';
import { borderRadius, colors, overlays, spacing } from '../../theme';
import { shadows } from '../../theme/shadows';

export interface TimeSlotGridProps {
  /** Currently selected time slot */
  selectedSlot: string | null;
  /** Callback when a slot is selected */
  onSelectSlot: (slot: string) => void;
  /** Array of unavailable time slots */
  unavailableSlots?: string[];
  /** Test ID prefix */
  testIDPrefix?: string;
}

export function TimeSlotGrid({
  selectedSlot,
  onSelectSlot,
  unavailableSlots = [],
  testIDPrefix = 'timeslot',
}: TimeSlotGridProps) {
  const renderSlotGrid = (slots: readonly string[], label: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.grid}>
        {slots.map((slot) => {
          const isSelected = slot === selectedSlot;
          const isUnavailable = unavailableSlots.includes(slot);

          return (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slot,
                isSelected && styles.slotSelected,
                isUnavailable && styles.slotUnavailable,
              ]}
              onPress={() => !isUnavailable && onSelectSlot(slot)}
              disabled={isUnavailable}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: isUnavailable }}
              accessibilityLabel={`${slot}${isUnavailable ? ', unavailable' : ''}`}
              testID={`${testIDPrefix}-${slot.replace(':', '')}`}
            >
              <Text
                style={[
                  styles.slotText,
                  isSelected && styles.slotTextSelected,
                  isUnavailable && styles.slotTextUnavailable,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderSlotGrid(timeSlots.am, scheduleStrings.amLabel)}
      {renderSlotGrid(timeSlots.pm, scheduleStrings.pmLabel)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slot: {
    width: '23%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 10,
    backgroundColor: overlays.frostedGlass,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.sm,
  },
  slotSelected: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.accentAlt,
    borderWidth: 2,
  },
  slotUnavailable: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    opacity: 0.5,
  },
  slotText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  slotTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  slotTextUnavailable: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
