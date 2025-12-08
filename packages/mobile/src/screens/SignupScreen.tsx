import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import { theme } from '../theme/colors';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function SignupScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const signUpUser = useAuthStore((state) => state.signUpUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  const emailError = useMemo(() => {
    if (!emailTouched) return '';
    return isValidEmail(email) ? '' : '유효한 이메일을 입력해주세요.';
  }, [email, emailTouched]);

  const passwordValid = useMemo(() => isValidPassword(password), [password]);
  const passwordHelper = useMemo(
    () =>
      passwordTouched || password.length > 0 ? '8자 이상, 문자와 숫자를 포함해야 합니다.' : '',
    [password, passwordTouched]
  );

  const passwordsMatch = useMemo(
    () => confirmPassword.length > 0 && confirmPassword === password,
    [confirmPassword, password]
  );
  const confirmHelper = useMemo(() => {
    if (!confirmTouched && confirmPassword.length === 0) return '';
    if (passwordsMatch) return '비밀번호가 일치합니다.';
    return '비밀번호가 일치해야 합니다.';
  }, [confirmPassword.length, confirmTouched, passwordsMatch]);

  const handleSubmit = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmTouched(true);

    if (!isValidEmail(email) || !isValidPassword(password) || password !== confirmPassword) {
      Alert.alert('오류', '입력한 정보를 확인해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      await signUpUser({ email: email.trim(), password, confirmPassword });
      // Ensure we land on the authenticated stack explicitly after signup
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      Alert.alert(
        '회원가입 실패',
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>이메일로 고객 계정을 만들어주세요.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              onBlur={() => setEmailTouched(true)}
            />
            {!!emailError && <Text style={styles.helperError}>{emailError}</Text>}

            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="8자 이상, 문자+숫자 포함"
              secureTextEntry
              editable={!isLoading}
              onBlur={() => setPasswordTouched(true)}
            />
            {passwordHelper ? (
              <Text style={passwordValid ? styles.helperSuccess : styles.helperError}>
                {passwordValid ? '사용 가능한 비밀번호입니다.' : passwordHelper}
              </Text>
            ) : null}

            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="비밀번호를 다시 입력"
              secureTextEntry
              editable={!isLoading}
              onBlur={() => setConfirmTouched(true)}
            />
            {confirmHelper ? (
              <Text style={passwordsMatch ? styles.helperSuccess : styles.helperError}>
                {confirmHelper}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>가입하기</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('ArtistSignup')}
              disabled={isLoading}
            >
              <Text style={styles.linkText}>아티스트로 가입하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              <Text style={styles.linkText}>이미 계정이 있으신가요? 로그인</Text>
            </TouchableOpacity>
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
