import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, spacing } from '../../theme';

export interface CategoryChip {
  id: string;
  label: string;
}

export interface CategoryChipsProps {
  /** Array of chip options */
  chips: CategoryChip[];
  /** Currently selected chip ID */
  selectedId: string | null;
  /** Callback when a chip is selected */
  onSelect: (id: string) => void;
  /** Whether to show horizontal scroll (default: true) */
  scrollable?: boolean;
  /** Test ID prefix */
  testIDPrefix?: string;
}

export function CategoryChips({
  chips,
  selectedId,
  onSelect,
  scrollable = true,
  testIDPrefix = 'chip',
}: CategoryChipsProps) {
  const content = (
    <View style={styles.container}>
      {chips.map((chip) => {
        const isSelected = chip.id === selectedId;
        return (
          <TouchableOpacity
            key={chip.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(chip.id)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={chip.label}
            testID={`${testIDPrefix}-${chip.id}`}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xs,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.background,
  },
});
