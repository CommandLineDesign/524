import React from 'react';
import {
  Image,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

import type { Review } from '../../api/client';
import { colors } from '../../theme/colors';
import { renderStars } from '../../utils/starUtils';

interface ReviewCardProps {
  review: Review;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  isLast?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}.${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}`;
}

export function ReviewCard({ review, onPress, containerStyle, isLast }: ReviewCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, accessibilityRole: 'button' as const } : {};

  return (
    <Wrapper style={[styles.card, isLast && styles.lastCard, containerStyle]} {...wrapperProps}>
      <View style={styles.cardHeader}>
        <View style={styles.ratingContainer}>
          <Text style={styles.stars}>{renderStars(review.overallRating)}</Text>
          <Text style={styles.ratingText}>{review.overallRating.toFixed(1)}</Text>
        </View>
        <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
      </View>

      <View style={styles.cardBody}>
        {review.reviewImages && review.reviewImages.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesContainer}
            contentContainerStyle={styles.imagesContent}
          >
            {review.reviewImages.map((imageUrl, index) => (
              <Image
                key={imageUrl}
                source={{ uri: imageUrl }}
                style={styles.reviewImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {review.reviewText && (
          <Text style={styles.reviewText} numberOfLines={3}>
            {review.reviewText}
          </Text>
        )}
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
    backgroundColor: colors.background,
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    gap: 12,
  },
  lastCard: {
    borderBottomWidth: 0,
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
    color: colors.primary,
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
  imagesContainer: {
    marginHorizontal: -4,
  },
  imagesContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  reviewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  response: {
    backgroundColor: colors.surface,
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
