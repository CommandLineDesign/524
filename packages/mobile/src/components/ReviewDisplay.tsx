import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { StarRating } from './common/StarRating';

interface ReviewDisplayProps {
  review: {
    overallRating: number;
    qualityRating: number;
    professionalismRating: number;
    timelinessRating: number;
    reviewText?: string;
    createdAt: string;
  };
}

export function ReviewDisplay({ review }: ReviewDisplayProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>내 리뷰</Text>
        <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
      </View>

      <View style={styles.ratingsContainer}>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>전체 만족도</Text>
          <StarRating rating={review.overallRating} size={16} showValue />
        </View>

        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>서비스 품질</Text>
          <StarRating rating={review.qualityRating} size={16} showValue />
        </View>

        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>전문성</Text>
          <StarRating rating={review.professionalismRating} size={16} showValue />
        </View>

        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>시간 준수</Text>
          <StarRating rating={review.timelinessRating} size={16} showValue />
        </View>
      </View>

      {review.reviewText && (
        <View style={styles.textContainer}>
          <Text style={styles.textLabel}>상세 리뷰</Text>
          <Text style={styles.reviewText}>{review.reviewText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.accentAlt,
    padding: 16,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  date: {
    fontSize: 13,
    color: colors.textMuted,
  },
  ratingsContainer: {
    gap: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    color: colors.text,
  },
  textContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
