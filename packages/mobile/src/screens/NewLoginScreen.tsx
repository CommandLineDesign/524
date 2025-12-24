import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isValidEmail } from '../components/signup/validation';
import { RootStackParamList } from '../navigation/AppNavigator';
import { loginWithKakao, loginWithNaver } from '../services/snsAuth';
import { useAuthStore } from '../store/authStore';
import { borderRadius, colors, spacing, typography } from '../theme';

// SNS Logo Component with fallback for missing assets
interface SNSLogoProps {
  source: ImageSourcePropType | null;
  fallbackText: string;
  style: StyleProp<ImageStyle>;
}

const SNSLogo: React.FC<SNSLogoProps> = ({ source, fallbackText, style }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError || !source) {
    return (
      <View style={[style, styles.fallbackLogo]}>
        <Text style={styles.fallbackLogoText}>{fallbackText}</Text>
      </View>
    );
  }

  return <Image source={source} style={style} onError={handleImageError} />;
};

// Local SNS logo assets (currently placeholders - replace with actual logos from Figma)
// Try to require assets - if they fail, they'll be null and fallbacks will be used
let NAVER_LOGO: ImageSourcePropType | null = null;
let KAKAO_LOGO: ImageSourcePropType | null = null;

try {
  NAVER_LOGO = require('../assets/icons/naver-logo.png');
} catch {
  // Asset is missing or invalid - fallback UI will be used
  // TODO: Add dev-only logging when assets fail to load for easier debugging
}

try {
  KAKAO_LOGO = require('../assets/icons/kakao-logo.png');
} catch {
  // Asset is missing or invalid - fallback UI will be used
  // TODO: Add dev-only logging when assets fail to load for easier debugging
}

// Component-specific dimensions
const DIVIDER_HEIGHT = 11;
const SNS_BUTTON_SIZE = 54;
const SNS_LOGO_SIZE = 20;

export function NewLoginScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '아이디와 비밀번호를 입력해주세요.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('오류', '올바른 이메일 형식을 입력해주세요.');
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

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  const handleFindId = () => {
    Alert.alert('아이디 찾기', '아이디 찾기 기능은 곧 제공될 예정입니다.');
  };

  const handleFindPassword = () => {
    Alert.alert('비밀번호 찾기', '비밀번호 찾기 기능은 곧 제공될 예정입니다.');
  };

  const handleNaverLogin = async () => {
    setIsLoading(true);
    await loginWithNaver();
    setIsLoading(false);
  };

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    await loginWithKakao();
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Logo/Title */}
        <Text style={styles.logo}>524</Text>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>아이디</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder=""
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              accessibilityLabel="아이디 입력"
              accessibilityHint="이메일 주소를 입력하세요"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder=""
              secureTextEntry
              editable={!isLoading}
              accessibilityLabel="비밀번호 입력"
              accessibilityHint="비밀번호를 입력하세요"
            />
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="로그인"
          accessibilityHint="로그인하려면 두 번 탭하세요"
        >
          {isLoading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.loginButtonText}>로그인</Text>
          )}
        </TouchableOpacity>

        {/* Action Links */}
        <View style={styles.linksContainer}>
          <TouchableOpacity
            onPress={handleSignup}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="회원가입"
          >
            <Text style={styles.linkText}>회원가입</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            onPress={handleFindId}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="아이디 찾기"
          >
            <Text style={styles.linkText}>아이디 찾기</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            onPress={handleFindPassword}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="비밀번호 찾기"
          >
            <Text style={styles.linkText}>비밀번호 찾기</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Divider */}
        <View style={styles.horizontalDivider} />

        {/* SNS Login Section */}
        <Text style={styles.snsTitle}>SNS 로그인</Text>

        <View style={styles.snsButtonsContainer}>
          {/* Naver Login */}
          <View style={styles.snsButtonWrapper}>
            <TouchableOpacity
              style={styles.snsButton}
              onPress={handleNaverLogin}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="네이버로 로그인"
            >
              <SNSLogo source={NAVER_LOGO} fallbackText="N" style={styles.snsLogo} />
            </TouchableOpacity>
            <Text style={styles.snsLabel}>네이버</Text>
          </View>

          {/* Kakao Login */}
          <View style={styles.snsButtonWrapper}>
            <TouchableOpacity
              style={styles.snsButton}
              onPress={handleKakaoLogin}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="카카오로 로그인"
            >
              <SNSLogo source={KAKAO_LOGO} fallbackText="K" style={styles.snsLogo} />
            </TouchableOpacity>
            <Text style={styles.snsLabel}>카카오</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  logo: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl + spacing.md,
  },
  formSection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  fieldContainer: {
    gap: spacing.md,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.text,
  },
  input: {
    height: spacing.inputHeight,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
    backgroundColor: colors.background,
  },
  loginButton: {
    height: spacing.inputHeight,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.background,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  linkText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.text,
  },
  divider: {
    width: 1,
    height: DIVIDER_HEIGHT,
    backgroundColor: colors.text,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: colors.text,
    marginBottom: spacing.lg,
  },
  snsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  snsButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    // Design: 48px gap between SNS buttons (xl + md = 32 + 16) for visual balance
    gap: spacing.xl + spacing.md,
  },
  snsButtonWrapper: {
    alignItems: 'center',
    gap: spacing.md,
  },
  snsButton: {
    width: SNS_BUTTON_SIZE,
    height: SNS_BUTTON_SIZE,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.text,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snsLogo: {
    width: SNS_LOGO_SIZE,
    height: SNS_LOGO_SIZE,
  },
  fallbackLogo: {
    width: SNS_LOGO_SIZE,
    height: SNS_LOGO_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  fallbackLogoText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.background,
  },
  snsLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    color: colors.text,
  },
});
