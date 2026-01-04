import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, spacing } from '../../theme';

export interface ArtistDetailHeaderProps {
  /** Artist name */
  name: string;
  /** Profile image URL */
  imageUrl?: string | null;
  /** Artist username/handle */
  username?: string;
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
  username,
  specialty,
  rating,
  reviewCount,
  onChatPress,
  testID,
}: ArtistDetailHeaderProps) {
  return (
    <View style={styles.container} testID={testID}>
      {/* Profile Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>{name.charAt(0)}</Text>
          </View>
        )}
        {username && (
          <View style={styles.usernameOverlay}>
            <Text style={styles.usernameText}>@{username}</Text>
          </View>
        )}
      </View>

      {/* Artist Info */}
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {onChatPress && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onChatPress}
              accessibilityLabel="메시지 보내기"
              accessibilityRole="button"
            >
              <ChatIcon />
            </TouchableOpacity>
          )}
        </View>

        {specialty && (
          <Text style={styles.specialty} numberOfLines={1}>
            {specialty}
          </Text>
        )}

        {/* Rating and review row */}
        <View style={styles.ratingRow}>
          {rating !== undefined && (
            <>
              <StarIcon />
              <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            </>
          )}
          {rating !== undefined && reviewCount !== undefined && <View style={styles.divider} />}
          {reviewCount !== undefined && <Text style={styles.reviewCount}>리뷰 {reviewCount}</Text>}
        </View>
      </View>
    </View>
  );
}

function StarIcon() {
  return (
    <View style={styles.starIcon}>
      <Text style={styles.starText}>★</Text>
    </View>
  );
}

function ChatIcon() {
  return (
    <View style={styles.chatIcon}>
      <Text style={styles.chatIconText}>💬</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 6,
    borderBottomColor: '#efeff0',
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 11.43,
    backgroundColor: colors.surfaceAlt,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  imagePlaceholderText: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.muted,
  },
  usernameOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  usernameText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '400',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#19191b',
    flex: 1,
  },
  specialty: {
    fontSize: 14,
    color: '#19191b',
    marginBottom: 4,
    fontWeight: '400',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 4,
  },
  starText: {
    fontSize: 12,
    color: '#19191b',
  },
  rating: {
    fontSize: 14,
    fontWeight: '400',
    color: '#19191b',
  },
  divider: {
    width: 1,
    height: 11,
    backgroundColor: '#19191b',
    marginHorizontal: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#19191b',
    fontWeight: '400',
  },
  iconButton: {
    padding: 4,
    marginLeft: spacing.xs,
  },
  chatIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatIconText: {
    fontSize: 16,
  },
});
