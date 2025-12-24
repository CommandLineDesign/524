import React, { ReactNode } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '../../theme';
import { spacing } from '../../theme';
import { HelperStatus } from './validation';

type FormFieldProps = {
  label: string;
  helper?: string;
  status?: HelperStatus;
  /** Optional accessory component (e.g., icon) aligned to the right of the input */
  rightAccessory?: ReactNode;
  /** Container style override */
  containerStyle?: StyleProp<ViewStyle>;
} & TextInputProps;

export const FormField = React.memo(function FormField({
  label,
  helper,
  status,
  rightAccessory,
  containerStyle,
  ...textInputProps
}: FormFieldProps) {
  const renderHelper = () => {
    if (!helper) return null;
    const style = status === 'success' ? styles.helperSuccess : styles.helperError;
    return <Text style={style}>{helper}</Text>;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, rightAccessory ? styles.inputWithAccessory : null]}
          placeholderTextColor={colors.textSecondary}
          {...textInputProps}
        />
        {rightAccessory}
      </View>
      {renderHelper()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputWithAccessory: {
    paddingRight: 40, // Space for the accessory
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
