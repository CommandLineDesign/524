import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, spacing } from '../../theme';
import { shadows } from '../../theme/shadows';

export interface ContinueButtonProps {
  /** Button label */
  label?: string;
  /** Callback when pressed */
  onPress: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show loading state */
  loading?: boolean;
  /** Variant: primary (filled) or secondary (outlined) */
  variant?: 'primary' | 'secondary';
  /** Optional subtitle text below the button */
  subtitle?: string;
  /** Test ID */
  testID?: string;
}

export function ContinueButton({
  label = '계속',
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  subtitle,
  testID,
}: ContinueButtonProps) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  const buttonContent = loading ? (
    <ActivityIndicator color={isPrimary ? colors.buttonText : colors.primary} size="small" />
  ) : (
    <Text
      style={[
        styles.buttonText,
        isPrimary ? styles.buttonTextPrimary : styles.buttonTextSecondary,
        isDisabled &&
          (isPrimary ? styles.buttonTextPrimaryDisabled : styles.buttonTextSecondaryDisabled),
      ]}
    >
      {label}
    </Text>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        accessibilityLabel={label}
        testID={testID}
        style={[
          styles.button,
          isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
          isDisabled && (isPrimary ? styles.buttonPrimaryDisabled : styles.buttonSecondaryDisabled),
        ]}
      >
        {buttonContent}
      </TouchableOpacity>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    height: 52,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  buttonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPrimaryDisabled: {
    opacity: 0.5,
  },
  buttonSecondaryDisabled: {
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.408,
  },
  buttonTextPrimary: {
    color: colors.buttonText,
  },
  buttonTextSecondary: {
    color: colors.primary,
  },
  buttonTextPrimaryDisabled: {
    color: colors.buttonText,
  },
  buttonTextSecondaryDisabled: {
    color: colors.muted,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
