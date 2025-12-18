import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../theme/colors';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  label: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  hapticFeedback?: boolean;
}

const STAR_SIZES = {
  small: 20,
  medium: 24,
  large: 32,
} as const;

export function StarRating({
  rating,
  onRatingChange,
  label,
  size = 'medium',
  disabled = false,
  hapticFeedback = true,
}: StarRatingProps) {
  const starSize = STAR_SIZES[size];

  const handleRatingPress = (starValue: number) => {
    if (disabled) return;

    // Trigger haptic feedback if enabled
    if (hapticFeedback && 'vibrate' in navigator) {
      // Light haptic feedback for rating selection
      navigator.vibrate(50);
    }

    onRatingChange(starValue);
  };

  return (
    <View style={styles.ratingContainer}>
      <Text style={[styles.ratingLabel, disabled && styles.disabledText]}>{label}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRatingPress(star)}
            accessible={true}
            accessibilityLabel={`${star}점 ${rating >= star ? '선택됨' : '선택되지 않음'}`}
            accessibilityHint={`${label}에 ${star}점을 매기려면 선택하세요`}
            accessibilityRole="button"
            disabled={disabled}
            style={[styles.starButton, disabled && styles.disabledButton]}
          >
            <Text
              style={[
                styles.star,
                { fontSize: starSize },
                rating >= star && styles.starFilled,
                disabled && styles.disabledStar,
              ]}
            >
              {rating >= star ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[styles.ratingValue, disabled && styles.disabledText]}>{rating}/5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
  disabledStar: {
    opacity: 0.5,
  },
});
