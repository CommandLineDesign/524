import { primitives } from '@524/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { borderRadius } from '../../theme/borderRadius';
import { overlays } from '../../theme/colors';

interface StarRatingProps {
  /** Rating value from 0-5 */
  rating: number;
  /** Size of each star icon (default: 14) */
  size?: number;
  /** Whether to show the numeric rating value (default: false) */
  showValue?: boolean;
  /** Display as a frosted glass badge (like home page style) */
  badge?: boolean;
  /** Maximum number of stars (default: 5) */
  maxStars?: number;
}

/**
 * Renders a star rating using Ionicons for consistent styling across the app.
 * Matches the home page ArtistCarouselCard rating badge style.
 */
export function StarRating({
  rating,
  size = 14,
  showValue = false,
  badge = false,
  maxStars = 5,
}: StarRatingProps) {
  // Clamp rating to valid range
  const clampedRating = Math.max(0, Math.min(rating, maxStars));

  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    let iconName: 'star' | 'star-half' | 'star-outline';

    if (i <= Math.floor(clampedRating)) {
      iconName = 'star';
    } else if (i - 0.5 <= clampedRating && clampedRating < i) {
      iconName = 'star-half';
    } else {
      iconName = 'star-outline';
    }

    stars.push(<Ionicons key={i} name={iconName} size={size} color={primitives.base} />);
  }

  const content = (
    <>
      <View style={styles.starsRow}>{stars}</View>
      {showValue && (
        <Text style={[styles.ratingText, { fontSize: size * 0.85 }]}>
          {clampedRating.toFixed(1)}
        </Text>
      )}
    </>
  );

  if (badge) {
    return (
      <View style={[styles.badge, { paddingHorizontal: size * 0.5, paddingVertical: size * 0.3 }]}>
        {content}
      </View>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: overlays.frostedGlassLight,
    borderRadius: borderRadius.full,
  },
  ratingText: {
    fontWeight: '700',
    color: primitives.darkest,
  },
});
