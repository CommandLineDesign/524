import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { theme } from '../../theme/colors';
import { HelperStatus } from './validation';

type FormFieldProps = {
  label: string;
  helper?: string;
  status?: HelperStatus;
} & TextInputProps;

export const FormField = React.memo(function FormField({
  label,
  helper,
  status,
  ...textInputProps
}: FormFieldProps) {
  const renderHelper = () => {
    if (!helper) return null;
    const style = status === 'success' ? styles.helperSuccess : styles.helperError;
    return <Text style={style}>{helper}</Text>;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={theme.colors.textSecondary}
        {...textInputProps}
      />
      {renderHelper()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    backgroundColor: '#fff',
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
