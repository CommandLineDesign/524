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

import { theme } from '../../theme/colors';
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
                <ActivityIndicator color="#fff" />
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
