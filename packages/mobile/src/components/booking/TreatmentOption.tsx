import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, spacing } from '../../theme';

export interface TreatmentOptionProps {
  /** Treatment name */
  name: string;
  /** Optional description */
  description?: string;
  /** Price in KRW */
  price: number;
  /** Duration in minutes */
  durationMinutes?: number;
  /** Whether this option is selected */
  selected?: boolean;
  /** Callback when toggled */
  onToggle: () => void;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Test ID */
  testID?: string;
}

export function TreatmentOption({
  name,
  description,
  price,
  durationMinutes,
  selected = false,
  onToggle,
  disabled = false,
  testID,
}: TreatmentOptionProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.containerSelected,
        disabled && styles.containerDisabled,
      ]}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={`${name}, ${formatPrice(price)}`}
      testID={testID}
    >
      {/* Checkbox */}
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <CheckIcon />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, disabled && styles.textDisabled]}>{name}</Text>
          <Text style={[styles.price, disabled && styles.textDisabled]}>{formatPrice(price)}</Text>
        </View>
        {(description || durationMinutes) && (
          <View style={styles.bottomRow}>
            {description && (
              <Text style={[styles.description, disabled && styles.textDisabled]} numberOfLines={1}>
                {description}
              </Text>
            )}
            {durationMinutes && (
              <Text style={[styles.duration, disabled && styles.textDisabled]}>
                {formatDuration(durationMinutes)}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
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

function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  }
  return `${minutes}분`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerSelected: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkIcon: {
    width: 14,
    height: 14,
    position: 'relative',
  },
  checkLine1: {
    position: 'absolute',
    width: 5,
    height: 2,
    backgroundColor: colors.background,
    transform: [{ rotate: '45deg' }],
    top: 7,
    left: 1,
  },
  checkLine2: {
    position: 'absolute',
    width: 9,
    height: 2,
    backgroundColor: colors.background,
    transform: [{ rotate: '-45deg' }],
    top: 5,
    left: 3,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  description: {
    fontSize: 14,
    color: colors.subtle,
    flex: 1,
    marginRight: spacing.sm,
  },
  duration: {
    fontSize: 13,
    color: colors.muted,
  },
  textDisabled: {
    color: colors.muted,
  },
});
