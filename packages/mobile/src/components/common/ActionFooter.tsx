import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { borderRadius, colors, overlays, spacing, textStyles } from '../../theme';
import { shadows } from '../../theme/shadows';

export interface ActionFooterProps {
  /** Primary button label */
  primaryLabel: string;
  /** Primary button callback */
  primaryOnPress: () => void;
  /** Secondary button label (optional) */
  secondaryLabel?: string;
  /** Secondary button callback */
  secondaryOnPress?: () => void;
  /** Disable primary button */
  disabled?: boolean;
  /** Loading state for primary button */
  loading?: boolean;
  /** Test ID */
  testID?: string;
}

export function ActionFooter({
  primaryLabel,
  primaryOnPress,
  secondaryLabel,
  secondaryOnPress,
  disabled = false,
  loading = false,
  testID,
}: ActionFooterProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, spacing.lg);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]} testID={testID}>
      {secondaryLabel && secondaryOnPress && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={secondaryOnPress}
          accessibilityRole="button"
          accessibilityLabel={secondaryLabel}
        >
          <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.primaryButton,
          !secondaryLabel && styles.primaryButtonFull,
          (disabled || loading) && styles.buttonDisabled,
        ]}
        onPress={primaryOnPress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={primaryLabel}
        accessibilityState={{ disabled: disabled || loading }}
      >
        <Text style={styles.primaryButtonText}>{loading ? '처리 중...' : primaryLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: overlays.frostedGlassLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: spacing.md,
    ...shadows.lg,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    ...shadows.md,
  },
  primaryButtonFull: {
    flex: 1,
  },
  primaryButtonText: {
    ...textStyles.label,
    color: colors.background,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  secondaryButtonText: {
    ...textStyles.label,
    color: colors.text,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
