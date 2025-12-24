import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { borderRadius } from '../theme/borderRadius';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type SignupConfirmationNavProp = NavigationProp<RootStackParamList, 'SignupConfirmation'>;

export function SignupConfirmationScreen() {
  const navigation = useNavigation<SignupConfirmationNavProp>();

  const handleGoToLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Checkmark Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={28} color={colors.primary} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>회원가입이 완료되었습니다</Text>
      </View>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGoToLogin}
          accessibilityRole="button"
          accessibilityLabel="로그인하러 가기"
          accessibilityHint="로그인 화면으로 이동합니다"
        >
          <Text style={styles.buttonText}>로그인하러 가기</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  checkmarkCircle: {
    width: 67,
    height: 67,
    borderRadius: 33.5,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  button: {
    height: spacing.inputHeight,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.background,
    letterSpacing: -0.408,
    lineHeight: 22,
  },
});
