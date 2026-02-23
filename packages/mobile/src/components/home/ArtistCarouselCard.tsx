import type { ArtistSearchResult } from '@524/shared/artists';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius } from '../../theme/borderRadius';
import { colors, overlays } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export interface ArtistCarouselCardProps {
  artist: ArtistSearchResult;
  onPress: () => void;
}

export function ArtistCarouselCard({ artist, onPress }: ArtistCarouselCardProps) {
  const { profileImageUrl } = artist;
  const hasImage = profileImageUrl && profileImageUrl.length > 0;
  const hasRating = artist.averageRating > 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${artist.stageName}, 평점 ${artist.averageRating.toFixed(1)}`}
    >
      <View style={styles.card}>
        {hasImage ? (
          <Image source={{ uri: profileImageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="person" size={40} color={colors.muted} />
          </View>
        )}

        {/* Rating badge */}
        {hasRating && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color={colors.accent} />
            <Text style={styles.ratingText}>{artist.averageRating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {artist.stageName}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 116,
  },
  card: {
    width: 116,
    height: 116,
    borderRadius: 17,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: overlays.lightOverlay,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  name: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
