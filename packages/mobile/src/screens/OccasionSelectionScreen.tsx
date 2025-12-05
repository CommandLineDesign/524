import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { SectionList, SectionListData, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { useBookingStore } from '../store/bookingStore';
import { colors } from '../theme/colors';

type OccasionSection = SectionListData<string, { title: string; data: string[] }>;

const OCCASION_SECTIONS: OccasionSection[] = [
  { title: '소셜 & 데이트', data: ['소개팅', '데이트'] },
  { title: '운동', data: ['댄스스포츠', '운동클래스'] },
  { title: '면접', data: ['미인대회', '승무원'] },
  { title: '데일리', data: ['데일리'] },
  { title: '사진 촬영', data: ['개인 프로필', '미인대회', '아나운서', '바디', '전업사진'] },
  { title: '가족 행사', data: ['돌잔치', '상견례'] },
  { title: '웨딩', data: ['전날제 결혼식', '본식 결혼식'] },
];

type OccasionSelectionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OccasionSelection'
>;

export function OccasionSelectionScreen() {
  const navigation = useNavigation<OccasionSelectionNavigationProp>();
  const setOccasion = useBookingStore((state) => state.setOccasion);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <Text style={styles.title}>오늘의 일정은 무엇인가요?</Text>
      <Text style={styles.subtitle}>
        일정을 선택하면 맞춤 아티스트와 서비스 추천을 도와드릴게요.
      </Text>

      <SectionList
        sections={OCCASION_SECTIONS}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.itemButton}
            onPress={() => {
              setOccasion(item);
              navigation.navigate('BookingSummary');
            }}
          >
            <Text style={styles.itemLabel}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtle,
    marginBottom: 16,
  },
  listContent: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 16,
    marginBottom: 8,
  },
  itemButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemLabel: {
    fontSize: 16,
    color: colors.text,
  },
});
