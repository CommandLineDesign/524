import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { SignupForm } from '../components/signup/SignupForm';
import {
  getConfirmHelper,
  getEmailError,
  getPasswordHelper,
  isValidEmail,
  isValidPassword,
} from '../components/signup/validation';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';

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
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  const emailError = useMemo(() => getEmailError(email, emailTouched), [email, emailTouched]);
  const passwordInfo = useMemo(
    () => getPasswordHelper(password, passwordTouched),
    [password, passwordTouched]
  );
  const confirmInfo = useMemo(
    () => getConfirmHelper(password, confirmPassword, confirmTouched),
    [password, confirmPassword, confirmTouched]
  );

  const handleSubmit = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmTouched(true);

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
      // Ensure we land on the authenticated stack explicitly after signup
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
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
    <SignupForm
      title="아티스트 가입"
      subtitle="계정을 만들고 심사 대기 상태로 시작합니다."
      fields={{
        email: {
          value: email,
          onChangeText: setEmail,
          onBlur: () => setEmailTouched(true),
          helper: emailError,
          placeholder: 'artist@example.com',
          status: emailError ? 'error' : '',
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
