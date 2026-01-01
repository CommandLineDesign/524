import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, spacing } from '../../theme';

export interface OptionCardProps {
  /** Main label text */
  label: string;
  /** Optional description text */
  description?: string;
  /** Whether this option is currently selected */
  selected?: boolean;
  /** Callback when the card is pressed */
  onPress: () => void;
  /** Optional icon component to render on the left */
  icon?: React.ReactNode;
  /** Optional right accessory (e.g., checkmark) */
  rightAccessory?: React.ReactNode;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Test ID */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
}

export function OptionCard({
  label,
  description,
  selected = false,
  onPress,
  icon,
  rightAccessory,
  disabled = false,
  testID,
  accessibilityLabel,
}: OptionCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.containerSelected,
        disabled && styles.containerDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      testID={testID}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      <View style={styles.textContainer}>
        <Text
          style={[styles.label, selected && styles.labelSelected, disabled && styles.labelDisabled]}
        >
          {label}
        </Text>
        {description && (
          <Text
            style={[
              styles.description,
              selected && styles.descriptionSelected,
              disabled && styles.descriptionDisabled,
            ]}
          >
            {description}
          </Text>
        )}
      </View>

      {rightAccessory && <View style={styles.rightAccessory}>{rightAccessory}</View>}

      {selected && !rightAccessory && (
        <View style={styles.checkmark}>
          <CheckIcon />
        </View>
      )}
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 72,
  },
  containerSelected: {
    borderColor: colors.borderDark,
    borderWidth: 3,
    backgroundColor: colors.background,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  labelSelected: {
    color: colors.primary,
  },
  labelDisabled: {
    color: colors.muted,
  },
  description: {
    fontSize: 14,
    color: colors.subtle,
    lineHeight: 20,
  },
  descriptionSelected: {
    color: colors.textSecondary,
  },
  descriptionDisabled: {
    color: colors.muted,
  },
  rightAccessory: {
    marginLeft: spacing.sm,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  checkIcon: {
    width: 14,
    height: 14,
    position: 'relative',
  },
  checkLine1: {
    position: 'absolute',
    width: 6,
    height: 2,
    backgroundColor: colors.background,
    transform: [{ rotate: '45deg' }],
    top: 8,
    left: 1,
  },
  checkLine2: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: colors.background,
    transform: [{ rotate: '-45deg' }],
    top: 6,
    left: 4,
  },
});
