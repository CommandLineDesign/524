import React, { ReactNode } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme';
import { spacing } from '../../theme';
import { FormField } from './FormField';
import { HelperStatus } from './validation';

type LinkProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

type FieldConfig = {
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  helper?: string;
  status?: HelperStatus;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
};

type SignupFormProps = {
  title: string;
  subtitle: string;
  fields: {
    email: FieldConfig;
    password: FieldConfig;
    confirmPassword: FieldConfig;
  };
  onSubmit: () => void;
  submitLabel: string;
  isLoading?: boolean;
  links?: {
    primary?: LinkProps;
    secondary?: LinkProps;
  };
  children?: ReactNode;
};

export function SignupForm({
  title,
  subtitle,
  fields,
  onSubmit,
  submitLabel,
  isLoading = false,
  links,
  children,
}: SignupFormProps) {
  const { email, password, confirmPassword } = fields;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.form}>
            <FormField
              label="이메일"
              keyboardType="email-address"
              autoCapitalize="none"
              {...email}
              editable={email.editable ?? !isLoading}
              helper={email.helper}
              status={email.status ?? (email.helper ? 'error' : '')}
            />

            <FormField
              label="비밀번호"
              secureTextEntry
              placeholder="8자 이상, 문자+숫자 포함"
              {...password}
              editable={password.editable ?? !isLoading}
            />

            <FormField
              label="비밀번호 확인"
              secureTextEntry
              placeholder="비밀번호를 다시 입력"
              {...confirmPassword}
              editable={confirmPassword.editable ?? !isLoading}
            />

            {children}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={onSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.buttonText}>{submitLabel}</Text>
              )}
            </TouchableOpacity>

            {links?.primary ? (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={links.primary.onPress}
                disabled={isLoading || links.primary.disabled}
              >
                <Text style={styles.linkText}>{links.primary.label}</Text>
              </TouchableOpacity>
            ) : null}

            {links?.secondary ? (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={links.secondary.onPress}
                disabled={isLoading || links.secondary.disabled}
              >
                <Text style={styles.linkText}>{links.secondary.label}</Text>
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
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  form: {
    marginBottom: spacing.xl,
  },
  button: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  helperError: {
    color: colors.error,
    fontSize: 12,
    marginTop: -4,
    marginBottom: spacing.sm,
  },
  helperSuccess: {
    color: colors.success,
    fontSize: 12,
    marginTop: -4,
    marginBottom: spacing.sm,
  },
});
