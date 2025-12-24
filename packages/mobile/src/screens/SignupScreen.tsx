import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { checkAvailability } from '../api/client';
import { FormField } from '../components/signup/FormField';
import { FormRow } from '../components/signup/FormRow';
import {
  extractBirthYear,
  formatDateOfBirth,
  formatKoreanPhone,
  getConfirmHelper,
  getDateOfBirthHelper,
  getEmailError,
  getNameHelper,
  getPasswordHelper,
  getPhoneHelper,
  isValidDateOfBirth,
  isValidEmail,
  isValidKoreanPhone,
  isValidName,
  isValidPassword,
} from '../components/signup/validation';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import { borderRadius } from '../theme/borderRadius';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

// Checkmark icon component for password confirmation
function CheckmarkIcon() {
  return (
    <View style={styles.checkmarkContainer}>
      <Text style={styles.checkmark}>✓</Text>
    </View>
  );
}

export function SignupScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const signUpUser = useAuthStore((state) => state.signUpUser);

  // Form state
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');

  // Touched states for validation feedback
  const [nameTouched, setNameTouched] = useState(false);
  const [dobTouched, setDobTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);

  // Duplicate account error states
  const [emailDuplicateError, setEmailDuplicateError] = useState<string | null>(null);
  const [phoneDuplicateError, setPhoneDuplicateError] = useState<string | null>(null);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  // Validation helpers
  const nameHelper = useMemo(() => getNameHelper(name, nameTouched), [name, nameTouched]);
  const dobHelper = useMemo(
    () => getDateOfBirthHelper(dateOfBirth, dobTouched),
    [dateOfBirth, dobTouched]
  );
  const phoneHelper = useMemo(
    () => getPhoneHelper(phoneNumber, phoneTouched),
    [phoneNumber, phoneTouched]
  );
  const passwordHelper = useMemo(
    () => getPasswordHelper(password, passwordTouched),
    [password, passwordTouched]
  );
  const confirmHelper = useMemo(
    () => getConfirmHelper(password, confirmPassword, confirmTouched),
    [password, confirmPassword, confirmTouched]
  );
  const emailError = useMemo(() => getEmailError(email, emailTouched), [email, emailTouched]);

  // Input handlers with auto-formatting
  const handlePhoneChange = useCallback((text: string) => {
    setPhoneNumber(formatKoreanPhone(text));
    setPhoneDuplicateError(null); // Clear duplicate error when user changes input
  }, []);

  const handleDateOfBirthChange = useCallback((text: string) => {
    setDateOfBirth(formatDateOfBirth(text));
  }, []);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setEmailDuplicateError(null); // Clear duplicate error when user changes input
  }, []);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return (
      isValidName(name) &&
      isValidDateOfBirth(dateOfBirth) &&
      isValidKoreanPhone(phoneNumber) &&
      isValidPassword(password) &&
      password === confirmPassword &&
      isValidEmail(email)
    );
  }, [name, dateOfBirth, phoneNumber, password, confirmPassword, email]);

  // Handle form submission
  const handleSubmit = async () => {
    // Mark all fields as touched to show validation errors
    setNameTouched(true);
    setDobTouched(true);
    setPhoneTouched(true);
    setPasswordTouched(true);
    setConfirmTouched(true);
    setEmailTouched(true);

    // Clear previous duplicate errors
    setEmailDuplicateError(null);
    setPhoneDuplicateError(null);

    if (!isFormValid) {
      Alert.alert('오류', '입력한 정보를 확인해주세요.');
      return;
    }

    const birthYear = extractBirthYear(dateOfBirth);
    if (!birthYear) {
      Alert.alert('오류', '유효한 생년월일을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);

      // Check if email and phone are available before attempting signup
      const availability = await checkAvailability({
        email: email.trim(),
        phoneNumber: phoneNumber.replace(/[-\s]/g, ''),
      });

      let hasErrors = false;

      if (!availability.emailAvailable) {
        setEmailDuplicateError('이미 사용 중인 이메일입니다. 로그인해 주세요.');
        hasErrors = true;
      }

      if (!availability.phoneAvailable) {
        setPhoneDuplicateError('이미 사용 중인 핸드폰 번호입니다. 로그인해 주세요.');
        hasErrors = true;
      }

      if (hasErrors) {
        return;
      }

      await signUpUser({
        email: email.trim(),
        password,
        confirmPassword,
        name: name.trim(),
        phoneNumber: phoneNumber.replace(/[-\s]/g, ''), // Send without dashes
        birthYear,
      });

      // Navigate to Welcome screen after successful signup
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      // Handle specific error codes from backend
      const errorMessage = error instanceof Error ? error.message : '';

      if (errorMessage.includes('Email already in use')) {
        setEmailDuplicateError('이미 사용 중인 이메일입니다. 로그인해 주세요.');
      } else if (errorMessage.includes('Phone number already in use')) {
        setPhoneDuplicateError('이미 사용 중인 핸드폰 번호입니다. 로그인해 주세요.');
      } else {
        Alert.alert(
          '회원가입 실패',
          error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // TODO: Email verification - Currently disabled, users can sign up without verifying email
  // The "인증" button is currently non-functional and greyed out
  // Implement: 1) Backend endpoint for sending verification code
  //            2) Verification code input modal
  //            3) Track verification status
  const handleEmailVerify = () => {
    Alert.alert('알림', '이메일 인증 기능은 준비 중입니다.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={styles.title}>회원가입</Text>

          {/* Name Field */}
          <FormField
            label="이름"
            placeholder="이름"
            value={name}
            onChangeText={setName}
            onBlur={() => setNameTouched(true)}
            helper={nameHelper.message}
            status={nameHelper.status}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            accessibilityLabel="이름 입력"
          />

          {/* Date of Birth Field */}
          <FormField
            label="생년월일"
            placeholder="1900-00-00"
            value={dateOfBirth}
            onChangeText={handleDateOfBirthChange}
            onBlur={() => setDobTouched(true)}
            helper={dobHelper.message}
            status={dobHelper.status}
            keyboardType="number-pad"
            maxLength={10}
            accessibilityLabel="생년월일 입력"
            accessibilityHint="YYYY-MM-DD 형식으로 입력해주세요"
          />

          {/* Phone Number Field */}
          <FormField
            label="핸드폰 번호"
            placeholder="010-1234-5678"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            onBlur={() => setPhoneTouched(true)}
            helper={phoneDuplicateError || phoneHelper.message}
            status={phoneDuplicateError ? 'error' : phoneHelper.status}
            keyboardType="phone-pad"
            maxLength={13}
            autoComplete="tel"
            textContentType="telephoneNumber"
            accessibilityLabel="핸드폰 번호 입력"
          />

          {/* Password Field */}
          <FormField
            label="비밀번호"
            placeholder="******"
            value={password}
            onChangeText={setPassword}
            onBlur={() => setPasswordTouched(true)}
            helper={passwordHelper.message}
            status={passwordHelper.status}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            accessibilityLabel="비밀번호 입력"
          />

          {/* Confirm Password Field */}
          <FormField
            label="비밀번호 확인"
            placeholder="******"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => setConfirmTouched(true)}
            helper={confirmHelper.message}
            status={confirmHelper.status}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            rightAccessory={confirmHelper.status === 'success' ? <CheckmarkIcon /> : null}
            accessibilityLabel="비밀번호 확인 입력"
          />

          {/* Email Field with Verify Button */}
          <FormRow
            label="이메일 주소"
            gap={8}
            rightAccessory={
              // TODO: Email verification button - currently disabled
              <TouchableOpacity
                style={[styles.verifyButton, styles.verifyButtonDisabled]}
                onPress={handleEmailVerify}
                disabled
                accessibilityLabel="이메일 인증"
                accessibilityHint="이메일 인증 기능은 준비 중입니다"
              >
                <Text style={styles.verifyButtonText}>인증</Text>
              </TouchableOpacity>
            }
          >
            <FormField
              label=""
              placeholder="abc123@naver.com"
              value={email}
              onChangeText={handleEmailChange}
              onBlur={() => setEmailTouched(true)}
              helper={emailDuplicateError || emailError}
              status={emailDuplicateError || emailError ? 'error' : ''}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              containerStyle={styles.noBottomMargin}
              accessibilityLabel="이메일 주소 입력"
            />
          </FormRow>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="회원가입"
            accessibilityState={{ disabled: isLoading || !isFormValid }}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.submitButtonText}>회원가입</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  noBottomMargin: {
    marginBottom: 0,
  },
  verifyButton: {
    height: 52,
    width: 64,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
    lineHeight: 22,
  },
  submitButton: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32, // Figma: 32px gap between email field and submit button
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
    letterSpacing: -0.408,
    lineHeight: 22,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 18,
    color: colors.success,
    fontWeight: '600',
  },
});
