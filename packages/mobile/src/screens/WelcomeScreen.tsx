import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuButton } from '../components/MenuButton';
import { NavigationMenu } from '../components/NavigationMenu';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type WelcomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNavigationProp>();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <MenuButton onPress={() => setMenuVisible(true)} />
      </View>

      <View style={styles.content}>
        <Text style={styles.tagline}>524</Text>
        <Text style={styles.headline}>어디서 예뻐지실 건가요?</Text>
        <Text style={styles.description}>
          서울 최고의 뷰티 아티스트와 실시간으로 예약하세요. 헤어, 메이크업, 그리고 특별한 일정까지
          모두 한 곳에서.
        </Text>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        style={styles.primaryButton}
        onPress={() => navigation.navigate('ServiceSelection')}
      >
        <Text style={styles.primaryButtonText}>예약 시작하기</Text>
      </TouchableOpacity>

      <NavigationMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 16,
  },
  tagline: {
    fontSize: 12,
    letterSpacing: 4,
    color: colors.muted,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 16,
    color: colors.subtle,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
