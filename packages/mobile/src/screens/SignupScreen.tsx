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
    <SignupForm
      title="회원가입"
      subtitle="이메일로 고객 계정을 만들어주세요."
      fields={{
        email: {
          value: email,
          onChangeText: setEmail,
          onBlur: () => setEmailTouched(true),
          helper: emailError,
          placeholder: 'you@example.com',
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
      submitLabel="가입하기"
      isLoading={isLoading}
      links={{
        primary: {
          label: '아티스트로 가입하기',
          onPress: () => navigation.navigate('ArtistSignup'),
        },
        secondary: {
          label: '이미 계정이 있으신가요? 로그인',
          onPress: () => navigation.navigate('Login'),
        },
      }}
    />
  );
}
