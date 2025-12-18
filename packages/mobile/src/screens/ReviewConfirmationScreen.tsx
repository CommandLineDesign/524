import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type ReviewConfirmationNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ReviewConfirmation'
>;
type ReviewConfirmationRouteProp = RouteProp<RootStackParamList, 'ReviewConfirmation'>;

export function ReviewConfirmationScreen() {
  const navigation = useNavigation<ReviewConfirmationNavProp>();
  const route = useRoute<ReviewConfirmationRouteProp>();
  const { bookingId } = route.params;

  const handleGoHome = () => {
    // Navigate to the Welcome screen (home page)
    navigation.navigate('Welcome');
  };

  const handleViewBooking = () => {
    // Navigate to the booking detail screen
    navigation.navigate('BookingDetail', { bookingId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>리뷰 제출 완료</Text>
        <Text style={styles.message}>
          리뷰가 성공적으로 제출되었습니다.{'\n'}
          아티스트에게 큰 도움이 될 거예요!
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Text style={styles.homeButtonText}>홈으로 가기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.viewBookingButton} onPress={handleViewBooking}>
            <Text style={styles.viewBookingButtonText}>예약 상세 보기</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  homeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  viewBookingButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewBookingButtonText: {
    color: colors.text,
    fontSize: 16,
  },
});
