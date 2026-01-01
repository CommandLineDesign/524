import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ServiceType } from '@524/shared';

import { MenuButton } from '../components/MenuButton';
import { NavigationMenu } from '../components/NavigationMenu';
import { SelectionItem } from '../components/common';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useBookingStore } from '../store/bookingStore';
import { borderRadius } from '../theme/borderRadius';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const SERVICE_OPTIONS: Array<{ id: ServiceType; label: string; isEmphasized?: boolean }> = [
  { id: 'combo', label: '헤어 메이크업', isEmphasized: true },
  { id: 'hair', label: '헤어' },
  { id: 'makeup', label: '메이크업' },
];

type ServiceSelectionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ServiceSelection'
>;

export function ServiceSelectionScreen() {
  const navigation = useNavigation<ServiceSelectionNavigationProp>();
  const setServiceType = useBookingStore((state) => state.setServiceType);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  const handleContinue = () => {
    if (selectedService) {
      setServiceType(selectedService);
      navigation.navigate('OccasionSelection');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <MenuButton onPress={() => setMenuVisible(true)} />
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>어떤 서비스를 받고 싶으세요?</Text>

        <FlatList
          data={SERVICE_OPTIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <SelectionItem
              label={item.label}
              selected={selectedService === item.id}
              onPress={() => setSelectedService(item.id)}
              accessibilityLabel={`${item.label} 선택`}
              accessibilityHint={`${item.label} 서비스를 선택합니다`}
            />
          )}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="다음"
          accessibilityHint="다음 단계로 진행합니다"
          style={[styles.continueButton, !selectedService && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedService}
        >
          <Text style={styles.continueButtonText}>다음</Text>
        </TouchableOpacity>
      </View>

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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    lineHeight: 22,
    color: colors.text,
    textAlign: 'center',
    marginTop: 180,
    marginBottom: 50,
  },
  listContent: {
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  continueButton: {
    height: spacing.inputHeight,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    lineHeight: 22,
    color: colors.background,
    letterSpacing: -0.408,
  },
});
