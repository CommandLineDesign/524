import React, { ReactNode } from 'react';
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type FormRowProps = {
  /** Label text displayed above the row */
  label: string;
  /** Main content (typically an input field) */
  children: ReactNode;
  /** Optional accessory component (e.g., button) aligned to the right */
  rightAccessory?: ReactNode;
  /** Gap between main content and accessory (default: 8px from Figma) */
  gap?: number;
  /** Container style override */
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * FormRow - Layout component for form fields with optional right accessories (buttons, etc.)
 * Ensures proper alignment between input and accessory regardless of helper text.
 *
 * @example
 * <FormRow label="이메일" rightAccessory={<Button>인증</Button>}>
 *   <FormField label="" {...props} containerStyle={{ marginBottom: 0 }} />
 * </FormRow>
 */
export function FormRow({
  label,
  children,
  rightAccessory,
  gap = 8,
  containerStyle,
}: FormRowProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Row content with input and optional accessory */}
      <View style={[styles.row, { gap }]}>
        {/* Main content (input field) - takes remaining space */}
        <View style={styles.mainContent}>{children}</View>

        {/* Right accessory (e.g., verify button) - aligned to top of input */}
        {rightAccessory && <View style={styles.accessory}>{rightAccessory}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18, // Figma: 18px gap between form fields
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.labelGap, // Figma: 10px gap between label and input
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align to top so button aligns with input top
  },
  mainContent: {
    flex: 1, // Take remaining space
  },
  accessory: {
    // No flex - takes only the space it needs
    // Aligns to the top of the row (same as input field top)
  },
});
