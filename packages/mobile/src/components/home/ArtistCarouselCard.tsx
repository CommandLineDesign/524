import type { ArtistSearchResult } from '@524/shared/artists';
import { primitives } from '@524/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius } from '../../theme/borderRadius';
import { colors, overlays } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

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
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${artist.stageName}, 평점 ${artist.averageRating.toFixed(1)}`}
    >
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          {hasImage ? (
            <Image source={{ uri: profileImageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="person" size={48} color={colors.muted} />
            </View>
          )}

          {/* Rating badge - top right */}
          {hasRating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color={primitives.base} />
              <Text style={styles.ratingText}>{artist.averageRating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Subtle accent glow */}
        <View style={styles.glowEffect} />
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {artist.stageName}
      </Text>
    </TouchableOpacity>
  );
}

const CARD_SIZE = 130;

const styles = StyleSheet.create({
  container: {
    width: CARD_SIZE,
    paddingBottom: 4,
  },
  cardWrapper: {
    position: 'relative',
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.25,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...shadows.lg,
  },
  glowEffect: {
    position: 'absolute',
    bottom: -2,
    left: 8,
    right: 8,
    height: 20,
    borderRadius: 20,
    backgroundColor: primitives.base,
    opacity: 0.15,
    transform: [{ scaleY: 0.3 }],
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
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: overlays.frostedGlassLight,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: primitives.darkest,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
});
