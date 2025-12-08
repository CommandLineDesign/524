import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
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

export function ArtistSignupScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const signUpArtist = useAuthStore((state) => state.signUpArtist);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      Alert.alert('오류', '유효한 이메일을 입력해주세요.');
      return;
    }
    if (!isValidPassword(password)) {
      Alert.alert('오류', '비밀번호는 8자 이상, 문자와 숫자를 포함해야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setIsLoading(true);
      await signUpArtist({ email: email.trim(), password, confirmPassword });
    } catch (error) {
      Alert.alert(
        '회원가입 실패',
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>아티스트 가입</Text>
          <Text style={styles.subtitle}>계정을 만들고 심사 대기 상태로 시작합니다.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="artist@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="8자 이상, 문자+숫자 포함"
              secureTextEntry
              editable={!isLoading}
            />

            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="비밀번호를 다시 입력"
              secureTextEntry
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>아티스트로 가입하기</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Signup')}
              disabled={isLoading}
            >
              <Text style={styles.linkText}>고객으로 가입하기</Text>
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
});
