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
import { colors, overlays } from '../../theme/colors';
import { formatStandardDate } from '../../utils/dateDisplay';
import { StarRating } from '../common/StarRating';

interface ReviewCardProps {
  review: Review;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  isLast?: boolean;
}

export function ReviewCard({ review, onPress, containerStyle, isLast }: ReviewCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, accessibilityRole: 'button' as const } : {};

  return (
    <Wrapper style={[styles.card, isLast && styles.lastCard, containerStyle]} {...wrapperProps}>
      <View style={styles.cardHeader}>
        <StarRating rating={review.overallRating} size={16} showValue />
        <Text style={styles.date}>{formatStandardDate(review.createdAt)}</Text>
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
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  date: {
    fontSize: 13,
    color: colors.textMuted,
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
    backgroundColor: overlays.frostedGlass,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    gap: 6,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  responseText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
});
