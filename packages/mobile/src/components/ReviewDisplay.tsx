import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

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

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
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
          <View style={styles.ratingValue}>
            <Text style={styles.stars}>{renderStars(review.overallRating)}</Text>
            <Text style={styles.ratingNumber}>{review.overallRating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>서비스 품질</Text>
          <View style={styles.ratingValue}>
            <Text style={styles.stars}>{renderStars(review.qualityRating)}</Text>
            <Text style={styles.ratingNumber}>{review.qualityRating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>전문성</Text>
          <View style={styles.ratingValue}>
            <Text style={styles.stars}>{renderStars(review.professionalismRating)}</Text>
            <Text style={styles.ratingNumber}>{review.professionalismRating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>시간 준수</Text>
          <View style={styles.ratingValue}>
            <Text style={styles.stars}>{renderStars(review.timelinessRating)}</Text>
            <Text style={styles.ratingNumber}>{review.timelinessRating.toFixed(1)}</Text>
          </View>
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
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
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
    color: colors.textSecondary,
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
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    fontSize: 16,
    color: '#f59e0b',
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: '600',
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
