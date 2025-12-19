import React from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

import type { Review } from '../../api/client';
import { colors } from '../../theme/colors';

interface ReviewCardProps {
  review: Review;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}.${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}`;
}

function renderStars(rating: number): string {
  const fullStars = '★'.repeat(rating);
  const emptyStars = '☆'.repeat(5 - rating);
  return fullStars + emptyStars;
}

export function ReviewCard({ review, onPress, containerStyle }: ReviewCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, accessibilityRole: 'button' as const } : {};

  return (
    <Wrapper style={[styles.card, containerStyle]} {...wrapperProps}>
      <View style={styles.cardHeader}>
        <View style={styles.ratingContainer}>
          <Text style={styles.stars}>{renderStars(review.overallRating)}</Text>
          <Text style={styles.ratingText}>{review.overallRating.toFixed(1)}</Text>
        </View>
        <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
      </View>

      <View style={styles.cardBody}>
        {review.reviewText && (
          <Text style={styles.reviewText} numberOfLines={3}>
            {review.reviewText}
          </Text>
        )}

        <View style={styles.ratingsGrid}>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>품질</Text>
            <Text style={styles.ratingValue}>{renderStars(review.qualityRating)}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>전문성</Text>
            <Text style={styles.ratingValue}>{renderStars(review.professionalismRating)}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>시간준수</Text>
            <Text style={styles.ratingValue}>{renderStars(review.timelinessRating)}</Text>
          </View>
        </View>
      </View>

      {review.artistResponse && (
        <View style={styles.response}>
          <Text style={styles.responseLabel}>아티스트 답변</Text>
          <Text style={styles.responseText} numberOfLines={2}>
            {review.artistResponse}
          </Text>
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    fontSize: 16,
    color: '#FFB800',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  date: {
    fontSize: 13,
    color: colors.subtle,
  },
  cardBody: {
    gap: 10,
  },
  reviewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  ratingsGrid: {
    gap: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 13,
    color: colors.subtle,
  },
  ratingValue: {
    fontSize: 13,
    color: '#FFB800',
  },
  response: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  responseText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
});
