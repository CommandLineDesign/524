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

import { config } from '../config/environment';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

// Quick-select buttons for development convenience
// These must match actual users in the database (created by seed script)
const TEST_ACCOUNTS = [
  { email: 'demo-customer@524.app', role: 'customer', name: '데모 고객' },
  { email: 'demo-artist@524.app', role: 'artist', name: '데모 아티스트' },
  { email: 'customer@test.com', role: 'customer', name: '김고객' },
  { email: 'customer2@test.com', role: 'customer', name: '이고객' },
  { email: 'artist@test.com', role: 'artist', name: '박아티스트' },
  { email: 'artist2@test.com', role: 'artist', name: '최아티스트' },
  { email: 'admin@test.com', role: 'admin', name: '관리자' },
];

export function DevLoginScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('demo-customer@524.app');
  const [password, setPassword] = useState(config.testPassword);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      // Navigation will be handled by the navigation setup
    } catch (error) {
      Alert.alert(
        '로그인 실패',
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectTestUser = (testEmail: string) => {
    setEmail(testEmail);
    setPassword(config.testPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>로그인</Text>
          <Text style={styles.subtitle}>개발 테스트 계정으로 로그인</Text>

          <View style={styles.form}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@test.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              secureTextEntry
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>로그인</Text>
              )}
            </TouchableOpacity>

            <View style={styles.linksRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                disabled={isLoading}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>회원가입</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('ArtistSignup')}
                disabled={isLoading}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>아티스트 가입</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.testUsers}>
            <Text style={styles.testUsersTitle}>테스트 계정 선택</Text>
            {TEST_ACCOUNTS.map((user) => (
              <TouchableOpacity
                key={user.email}
                style={styles.testUserButton}
                onPress={() => selectTestUser(user.email)}
                disabled={isLoading}
              >
                <Text style={styles.testUserName}>{user.name}</Text>
                <Text style={styles.testUserEmail}>{user.email}</Text>
                <Text style={styles.testUserRole}>역할: {user.role}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>🔐 개발 전용 로그인</Text>
            <Text style={styles.infoText}>
              개발 환경에서만 사용할 수 있는 테스트 로그인 화면입니다.
            </Text>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    backgroundColor: '#fff',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  linkButton: {
    paddingVertical: spacing.xs,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  testUsers: {
    marginBottom: spacing.xl,
  },
  testUsersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  testUserButton: {
    padding: spacing.md,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  testUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  testUserEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  testUserRole: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  infoBox: {
    padding: spacing.md,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 12,
    color: '#1565c0',
    lineHeight: 18,
  },
});
