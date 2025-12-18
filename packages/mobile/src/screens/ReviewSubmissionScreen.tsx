import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type ReviewSubmissionNavProp = NativeStackNavigationProp<RootStackParamList, 'ReviewSubmission'>;
type ReviewSubmissionRouteProp = RouteProp<RootStackParamList, 'ReviewSubmission'>;

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  label: string;
}

function StarRating({ rating, onRatingChange, label }: StarRatingProps) {
  return (
    <View style={styles.ratingContainer}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange(star)}
            style={styles.starButton}
          >
            <Text style={[styles.star, rating >= star && styles.starFilled]}>
              {rating >= star ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingValue}>{rating}/5</Text>
    </View>
  );
}

export function ReviewSubmissionScreen() {
  const navigation = useNavigation<ReviewSubmissionNavProp>();
  const route = useRoute<ReviewSubmissionRouteProp>();
  const { bookingId } = route.params;

  const [overallRating, setOverallRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allRatingsProvided =
    overallRating > 0 && qualityRating > 0 && professionalismRating > 0 && timelinessRating > 0;

  const handleSubmit = async () => {
    if (!allRatingsProvided) {
      Alert.alert('평가 필요', '모든 항목에 별점을 매겨주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement API call to submit review
      // await submitReview(bookingId, {
      //   overallRating,
      //   qualityRating,
      //   professionalismRating,
      //   timelinessRating,
      //   reviewText: reviewText.trim() || undefined,
      // });

      Alert.alert(
        '리뷰 제출 완료',
        '리뷰가 성공적으로 제출되었습니다. 아티스트에게 큰 도움이 될 거예요!',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Review submission failed:', error);
      Alert.alert('제출 실패', '리뷰 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>서비스 리뷰</Text>
          <Text style={styles.subtitle}>
            이 서비스는 어떠셨나요? 여러분의 솔직한 평가가 다른 고객들에게 도움이 됩니다.
          </Text>

          <View style={styles.ratingsSection}>
            <StarRating
              rating={overallRating}
              onRatingChange={setOverallRating}
              label="전체 만족도"
            />
            <StarRating
              rating={qualityRating}
              onRatingChange={setQualityRating}
              label="서비스 품질"
            />
            <StarRating
              rating={professionalismRating}
              onRatingChange={setProfessionalismRating}
              label="전문성"
            />
            <StarRating
              rating={timelinessRating}
              onRatingChange={setTimelinessRating}
              label="시간 준수"
            />
          </View>

          <View style={styles.textSection}>
            <Text style={styles.textLabel}>자세한 리뷰 (선택사항)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="서비스에 대한 자세한 의견을 남겨주세요..."
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={4}
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{reviewText.length}/1000</Text>
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!allRatingsProvided || isSubmitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!allRatingsProvided || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>리뷰 제출하기</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>나중에 하기</Text>
            </TouchableOpacity>
          </View>
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
  keyboardContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  ratingsSection: {
    marginBottom: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  ratingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  starsContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
  },
  starButton: {
    padding: 2,
  },
  star: {
    fontSize: 24,
    color: colors.border,
  },
  starFilled: {
    color: '#FFD700', // Gold color for filled stars
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  textSection: {
    marginBottom: 32,
  },
  textLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  buttonSection: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
  },
});
