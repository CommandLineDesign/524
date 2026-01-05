import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { checkAvailability } from '../api/client';
import { SignupForm } from '../components/signup/SignupForm';
import {
  getConfirmHelper,
  getEmailError,
  getPasswordHelper,
  isValidEmail,
  isValidPassword,
} from '../components/signup/validation';
import { useDebounce } from '../hooks/useDebounce';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';

type EmailAvailabilityStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'error';

export function ArtistSignupScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const signUpArtist = useAuthStore((state) => state.signUpArtist);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailDuplicateError, setEmailDuplicateError] = useState<string | null>(null);
  const [emailAvailabilityStatus, setEmailAvailabilityStatus] =
    useState<EmailAvailabilityStatus>('idle');
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastCheckedEmailRef = useRef<string | null>(null);

  // Debounce email for availability check (400ms delay)
  const debouncedEmail = useDebounce(email, 400);

  useEffect(
    () => () => {
      isMountedRef.current = false;
      // Cancel any pending availability check on unmount
      abortControllerRef.current?.abort();
    },
    []
  );

  // Check email availability when debounced email changes
  const checkEmailAvailability = useCallback(async (emailToCheck: string) => {
    // Cancel previous request
    abortControllerRef.current?.abort();

    // Skip if email is not valid or empty
    if (!emailToCheck.trim() || !isValidEmail(emailToCheck)) {
      setEmailAvailabilityStatus('idle');
      return;
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setEmailAvailabilityStatus('checking');

    try {
      const availability = await checkAvailability({
        email: emailToCheck.trim(),
      });

      // Check if request was aborted or component unmounted
      if (abortController.signal.aborted || !isMountedRef.current) {
        return;
      }

      if (availability.emailAvailable) {
        setEmailAvailabilityStatus('available');
        setEmailDuplicateError(null);
        lastCheckedEmailRef.current = emailToCheck.trim();
      } else {
        setEmailAvailabilityStatus('unavailable');
        setEmailDuplicateError('이미 사용 중인 이메일입니다. 로그인해 주세요.');
        lastCheckedEmailRef.current = emailToCheck.trim();
      }
    } catch (error) {
      // Check if request was aborted or component unmounted
      if (abortController.signal.aborted || !isMountedRef.current) {
        return;
      }

      // Network or other error - set error state but don't block user
      setEmailAvailabilityStatus('error');
      // Don't show error message for network issues - will be validated on submit
    }
  }, []);

  // Trigger availability check when debounced email changes
  useEffect(() => {
    checkEmailAvailability(debouncedEmail);
  }, [debouncedEmail, checkEmailAvailability]);

  const emailError = useMemo(() => getEmailError(email, emailTouched), [email, emailTouched]);
  const passwordInfo = useMemo(
    () => getPasswordHelper(password, passwordTouched),
    [password, passwordTouched]
  );
  const confirmInfo = useMemo(
    () => getConfirmHelper(password, confirmPassword, confirmTouched),
    [password, confirmPassword, confirmTouched]
  );

  // Compute email helper text and status based on validation and availability
  const emailHelperInfo = useMemo(() => {
    // Priority 1: Format validation errors
    if (emailError) {
      return { helper: emailError, status: 'error' as const };
    }

    // Priority 2: Duplicate email error (from submit or debounced check)
    if (emailDuplicateError) {
      return { helper: emailDuplicateError, status: 'error' as const };
    }

    // Priority 3: Availability status indicators
    switch (emailAvailabilityStatus) {
      case 'checking':
        return { helper: '확인 중...', status: 'neutral' as const };
      case 'available':
        return { helper: '사용 가능한 이메일입니다.', status: 'success' as const };
      case 'unavailable':
        return {
          helper: '이미 사용 중인 이메일입니다. 로그인해 주세요.',
          status: 'error' as const,
        };
      case 'error':
        // Show subtle indicator that check failed - will be validated on submit
        return { helper: '확인 실패 - 제출 시 다시 확인됩니다', status: 'neutral' as const };
      default:
        return { helper: '', status: undefined };
    }
  }, [emailError, emailDuplicateError, emailAvailabilityStatus]);

  // Clear errors and set checking status when email changes
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailDuplicateError(null);
    // Show checking status only if email looks potentially valid
    if (text.trim() && text.includes('@')) {
      setEmailAvailabilityStatus('checking');
    } else {
      setEmailAvailabilityStatus('idle');
    }
  };

  const handleSubmit = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmTouched(true);

    // Clear previous duplicate errors
    setEmailDuplicateError(null);

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

    setIsLoading(true);

    try {
      // Use cached availability result if email hasn't changed since last successful check
      const emailTrimmed = email.trim();
      const canSkipAvailabilityCheck =
        emailAvailabilityStatus === 'available' && lastCheckedEmailRef.current === emailTrimmed;

      if (!canSkipAvailabilityCheck) {
        // Check if email is available before attempting signup
        const availability = await checkAvailability({
          email: emailTrimmed,
        });

        if (!availability.emailAvailable) {
          setEmailDuplicateError('이미 사용 중인 이메일입니다. 로그인해 주세요.');
          return;
        }
      }

      await signUpArtist({ email: emailTrimmed, password, confirmPassword });
      // Ensure we land on the authenticated stack explicitly after signup
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      // Handle specific error codes from backend
      const errorMessage = error instanceof Error ? error.message : '';

      if (errorMessage.includes('Email already in use')) {
        setEmailDuplicateError('이미 사용 중인 이메일입니다. 로그인해 주세요.');
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

  return (
    <SignupForm
      title="아티스트 가입"
      subtitle="계정을 만들고 심사 대기 상태로 시작합니다."
      fields={{
        email: {
          value: email,
          onChangeText: handleEmailChange,
          onBlur: () => setEmailTouched(true),
          helper: emailHelperInfo.helper,
          placeholder: 'artist@example.com',
          status: emailHelperInfo.status,
        },
        password: {
          value: password,
          onChangeText: setPassword,
          onBlur: () => setPasswordTouched(true),
          helper: passwordInfo.message,
          status: passwordInfo.status,
        },
        confirmPassword: {
          value: confirmPassword,
          onChangeText: setConfirmPassword,
          onBlur: () => setConfirmTouched(true),
          helper: confirmInfo.message,
          status: confirmInfo.status,
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="아티스트로 가입하기"
      isLoading={isLoading}
      links={{
        primary: {
          label: '고객으로 가입하기',
          onPress: () => navigation.navigate('Signup'),
        },
        secondary: {
          label: '이미 계정이 있으신가요? 로그인',
          onPress: () => navigation.navigate('Login'),
        },
      }}
    />
  );
}
