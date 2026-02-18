import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, spacing } from '../../theme';

export interface PricingSelectorProps {
  /** Label for the service type (e.g., "헤어", "메이크업") */
  label: string;
  /** Currently selected price, or null if none selected */
  value: number | null;
  /** Callback when a price is selected */
  onChange: (price: number | null) => void;
  /** Available price presets to choose from */
  presets: readonly number[];
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * A single-select button group for choosing a service price.
 * Used in artist onboarding and profile editing for setting hair/makeup prices.
 */
export function PricingSelector({
  label,
  value,
  onChange,
  presets,
  disabled = false,
}: PricingSelectorProps) {
  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('ko-KR')}원`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsRow}>
        {presets.map((price) => {
          const isSelected = value === price;
          return (
            <TouchableOpacity
              key={price}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                disabled && styles.optionDisabled,
              ]}
              onPress={() => onChange(price)}
              disabled={disabled}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled }}
              accessibilityLabel={`${label} ${formatPrice(price)}`}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {formatPrice(price)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    height: spacing.inputHeight,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
