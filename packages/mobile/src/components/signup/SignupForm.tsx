import React, { ReactNode } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme/colors';
import { HelperStatus } from './validation';

type LinkProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

type SignupFormProps = {
  title: string;
  subtitle: string;
  email: string;
  onEmailChange: (value: string) => void;
  emailError?: string;
  emailPlaceholder?: string;
  onEmailBlur?: () => void;
  password: string;
  onPasswordChange: (value: string) => void;
  passwordHelper?: string;
  passwordStatus?: HelperStatus;
  onPasswordBlur?: () => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  confirmHelper?: string;
  confirmStatus?: HelperStatus;
  onConfirmBlur?: () => void;
  onSubmit: () => void;
  submitLabel: string;
  isLoading?: boolean;
  primaryLink?: LinkProps;
  secondaryLink?: LinkProps;
  children?: ReactNode;
};

export function SignupForm({
  title,
  subtitle,
  email,
  onEmailChange,
  emailError,
  emailPlaceholder = 'you@example.com',
  onEmailBlur,
  password,
  onPasswordChange,
  passwordHelper,
  passwordStatus,
  onPasswordBlur,
  confirmPassword,
  onConfirmPasswordChange,
  confirmHelper,
  confirmStatus,
  onConfirmBlur,
  onSubmit,
  submitLabel,
  isLoading = false,
  primaryLink,
  secondaryLink,
  children,
}: SignupFormProps) {
  const renderHelper = (message?: string, status?: HelperStatus) => {
    if (!message) return null;
    const style = status === 'success' ? styles.helperSuccess : styles.helperError;
    return <Text style={style}>{message}</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.form}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={onEmailChange}
              placeholder={emailPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              onBlur={onEmailBlur}
            />
            {renderHelper(emailError, emailError ? 'error' : '')}

            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={onPasswordChange}
              placeholder="8자 이상, 문자+숫자 포함"
              secureTextEntry
              editable={!isLoading}
              onBlur={onPasswordBlur}
            />
            {renderHelper(passwordHelper, passwordStatus)}

            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={onConfirmPasswordChange}
              placeholder="비밀번호를 다시 입력"
              secureTextEntry
              editable={!isLoading}
              onBlur={onConfirmBlur}
            />
            {renderHelper(confirmHelper, confirmStatus)}

            {children}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={onSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{submitLabel}</Text>
              )}
            </TouchableOpacity>

            {primaryLink ? (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={primaryLink.onPress}
                disabled={isLoading || primaryLink.disabled}
              >
                <Text style={styles.linkText}>{primaryLink.label}</Text>
              </TouchableOpacity>
            ) : null}

            {secondaryLink ? (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={secondaryLink.onPress}
                disabled={isLoading || secondaryLink.disabled}
              >
                <Text style={styles.linkText}>{secondaryLink.label}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  form: {
    marginBottom: theme.spacing.xl,
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
    marginBottom: theme.spacing.md,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    height: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  helperError: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: -4,
    marginBottom: theme.spacing.sm,
  },
  helperSuccess: {
    color: '#2e7d32',
    fontSize: 12,
    marginTop: -4,
    marginBottom: theme.spacing.sm,
  },
});
