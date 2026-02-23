import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';

import { borderRadius, colors, gradients, spacing } from '../../theme';

type GradientPreset = 'accent' | 'dark' | 'vibrant';

interface GradientButtonProps {
  /** Button text */
  title: string;
  /** Press handler */
  onPress: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show loading indicator */
  loading?: boolean;
  /** Gradient preset to use. Defaults to 'accent' */
  preset?: GradientPreset;
  /** Additional styles for the button container */
  style?: ViewStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Test ID for testing */
  testID?: string;
}

export function GradientButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  preset = 'accent',
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: GradientButtonProps) {
  const gradientConfig = gradients[preset];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
      testID={testID}
      style={style}
    >
      <LinearGradient
        colors={[...gradientConfig.colors]}
        start={gradientConfig.start}
        end={gradientConfig.end}
        locations={[...gradientConfig.locations]}
        style={[styles.gradient, isDisabled && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={colors.buttonText} />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    height: spacing.inputHeight,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.buttonText,
    letterSpacing: -0.408,
  },
});
