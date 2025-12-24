import React from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

import { borderRadius, colors, spacing } from '../../theme';
import { HelperStatus } from './validation';

type FormFieldProps = {
  label: string;
  helper?: string;
  status?: HelperStatus;
  /** Optional component to render on the right side of the input (e.g., checkmark icon, button) */
  rightAccessory?: React.ReactNode;
  /** Container style override */
  containerStyle?: StyleProp<ViewStyle>;
} & TextInputProps;

export const FormField = React.memo(function FormField({
  label,
  helper,
  status,
  rightAccessory,
  containerStyle,
  style,
  ...textInputProps
}: FormFieldProps) {
  const renderHelper = () => {
    if (!helper) return null;
    const helperStyle = status === 'success' ? styles.helperSuccess : styles.helperError;
    return <Text style={helperStyle}>{helper}</Text>;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, rightAccessory ? styles.inputWithAccessory : null, style]}
          placeholderTextColor={colors.placeholder}
          {...textInputProps}
        />
        {rightAccessory && <View style={styles.accessoryContainer}>{rightAccessory}</View>}
      </View>
      {renderHelper()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 18, // Figma: 18px gap between form fields
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.labelGap,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    backgroundColor: colors.background,
  },
  inputWithAccessory: {
    paddingRight: 48, // Make room for the accessory
  },
  accessoryContainer: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
  helperError: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
  helperSuccess: {
    color: '#2e7d32',
    fontSize: 12,
    marginTop: 4,
  },
});
