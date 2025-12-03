import { StackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ServiceType } from '@524/shared';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { useBookingStore } from '../store/bookingStore';
import { colors } from '../theme/colors';
import { MenuButton } from '../components/MenuButton';
import { NavigationMenu } from '../components/NavigationMenu';

const SERVICE_OPTIONS: Array<{ id: ServiceType; label: string; description: string }> = [
  { id: 'hair', label: '헤어', description: '스타일링, 드라이, 업스타일 등 헤어 전문 서비스' },
  { id: 'makeup', label: '메이크업', description: '데일리, 데이트, 웨딩 등 맞춤 메이크업' },
  { id: 'combo', label: '헤어 + 메이크업', description: '완벽한 변신을 위한 풀 패키지' }
];

type ServiceSelectionNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceSelection'>;

export function ServiceSelectionScreen() {
  const navigation = useNavigation<ServiceSelectionNavigationProp>();
  const setServiceType = useBookingStore((state) => state.setServiceType);
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <MenuButton onPress={() => setMenuVisible(true)} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>어떤 서비스를 원하시나요?</Text>
        <Text style={styles.subtitle}>서비스 유형을 선택하시면 맞춤 아티스트를 추천해 드립니다.</Text>

        <FlatList
          data={SERVICE_OPTIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.card}
              onPress={() => {
                setServiceType(item.id);
                navigation.navigate('OccasionSelection');
              }}
            >
              <Text style={styles.cardTitle}>{item.label}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <NavigationMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.text
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtle,
    marginBottom: 24
  },
  listContent: {
    gap: 16
  },
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text
  },
  cardDescription: {
    fontSize: 15,
    color: colors.subtle,
    lineHeight: 22
  }
});

