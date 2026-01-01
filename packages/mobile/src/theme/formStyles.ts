import { StyleSheet } from 'react-native';

import { borderRadius } from './borderRadius';
import { colors } from './colors';
import { spacing } from './spacing';

/**
 * Shared form styling constants for consistent UI across the app.
 * Use these styles for text inputs, selection items, and buttons.
 */
export const formStyles = StyleSheet.create({
  // Text Input Styles
  input: {
    height: spacing.inputHeight,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  inputFocused: {
    borderWidth: 3,
    borderColor: colors.borderDark,
    shadowColor: colors.borderDark,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: colors.surface,
  },

  // Selection Item Styles (for option lists)
  selectionItem: {
    height: spacing.inputHeight,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  selectionItemSelected: {
    borderWidth: 3,
    borderColor: colors.borderDark,
  },
  selectionItemDisabled: {
    opacity: 0.5,
  },

  // Selection Item Text Styles
  selectionItemText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 24,
  },
  selectionItemTextSelected: {
    color: colors.text,
  },

  // Button Styles
  button: {
    height: spacing.inputHeight,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
    letterSpacing: -0.408,
    lineHeight: 22,
  },

  // Label Styles
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },

  // Helper Text Styles
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  helperTextError: {
    color: colors.error,
  },
  helperTextSuccess: {
    color: colors.success,
  },
});

/**
 * Style constants for common form dimensions and spacing
 */
export const formConstants = {
  inputHeight: spacing.inputHeight,
  borderRadiusMd: borderRadius.md,
  borderRadiusPill: borderRadius.pill,
  spacing: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  },
};
