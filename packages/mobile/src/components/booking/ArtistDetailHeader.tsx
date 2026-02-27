import { primitives } from '@524/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, spacing, textStyles } from '../../theme';
import { shadows } from '../../theme/shadows';

export interface ArtistDetailHeaderProps {
  /** Artist name */
  name: string;
  /** Profile image URL */
  imageUrl?: string | null;
  /** Artist specialty */
  specialty?: string;
  /** Rating (0-5) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Callback when chat button is pressed (optional) */
  onChatPress?: () => void;
  /** Test ID */
  testID?: string;
}

export function ArtistDetailHeader({
  name,
  imageUrl,
  specialty,
  rating,
  reviewCount,
  onChatPress,
  testID,
}: ArtistDetailHeaderProps) {
  return (
    <View style={styles.container} testID={testID}>
      {/* Profile Image - Centered and Larger */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>{name.charAt(0)}</Text>
          </View>
        )}
      </View>

      {/* Artist Name - Large and Bold */}
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>

      {/* Specialty */}
      {specialty && (
        <Text style={styles.specialty} numberOfLines={1}>
          {specialty}
        </Text>
      )}

      {/* Stats Row with Teal Accent */}
      <View style={styles.statsRow}>
        {rating !== undefined && (
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color={colors.primary} />
            <Text style={styles.statValue}>{rating.toFixed(1)}</Text>
          </View>
        )}
        {rating !== undefined && reviewCount !== undefined && <View style={styles.statDivider} />}
        {reviewCount !== undefined && (
          <Text style={styles.statText}>
            <Text style={styles.statHighlight}>{reviewCount}</Text> 리뷰
          </Text>
        )}
      </View>

      {/* Chat Button - Positioned Absolute */}
      {onChatPress && (
        <TouchableOpacity
          style={styles.chatButton}
          onPress={onChatPress}
          accessibilityLabel="메시지 보내기"
          accessibilityRole="button"
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: colors.background,
    position: 'relative',
  },
  imageContainer: {
    marginBottom: 16,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...shadows.md,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  imagePlaceholderText: {
    fontSize: 40,
    fontWeight: '600',
    color: colors.textMuted,
  },
  name: {
    ...textStyles.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  specialty: {
    ...textStyles.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...textStyles.label,
    color: colors.text,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
  statText: {
    ...textStyles.body,
    color: colors.textMuted,
  },
  statHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  chatButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
});
