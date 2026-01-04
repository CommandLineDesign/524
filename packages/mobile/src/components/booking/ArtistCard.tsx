import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, spacing } from '../../theme';

export interface ArtistCardProps {
  /** Artist ID */
  id: string;
  /** Artist name */
  name: string;
  /** Profile image URL */
  imageUrl?: string | null;
  /** Rating (0-5) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Starting price */
  startingPrice?: number;
  /** Distance in km */
  distance?: number;
  /** Whether the artist is bookmarked */
  isBookmarked?: boolean;
  /** Callback when the card is pressed */
  onPress: () => void;
  /** Callback when bookmark is toggled */
  onBookmarkToggle?: () => void;
  /** Whether the card is selected */
  selected?: boolean;
  /** Test ID */
  testID?: string;
  /** Artist username/handle */
  username?: string;
  /** Artist specialties/services */
  specialties?: string[];
  /** Whether to show the chat button (default: false) */
  showChatButton?: boolean;
  /** Callback when chat button is pressed */
  onChatPress?: () => void;
  /** Callback when picture/name area is pressed (for detail navigation) */
  onInfoPress?: () => void;
}

export function ArtistCard({
  id,
  name,
  imageUrl,
  rating,
  reviewCount,
  startingPrice,
  distance,
  isBookmarked = false,
  onPress,
  onBookmarkToggle,
  selected = false,
  testID,
  username,
  specialties,
  showChatButton = false,
  onChatPress,
  onInfoPress,
}: ArtistCardProps) {
  return (
    <View style={styles.container} testID={testID}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${name} 선택하기`}
      >
        {/* Profile Image - tappable for detail navigation */}
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={(e) => {
            e.stopPropagation();
            if (onInfoPress) {
              onInfoPress();
            }
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${name} 상세정보 보기`}
        >
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
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            {showChatButton && (
              <TouchableOpacity
                style={styles.chatButton}
                onPress={(e) => {
                  e.stopPropagation();
                  if (onChatPress) {
                    onChatPress();
                  }
                }}
                accessibilityLabel="메시지 보내기"
                accessibilityRole="button"
              >
                <ChatIcon />
              </TouchableOpacity>
            )}
          </View>

          {specialties && specialties.length > 0 && (
            <View style={styles.specialtiesContainer}>
              {specialties.slice(0, 2).map((service, index) => (
                <Text key={service} style={styles.specialty} numberOfLines={1}>
                  {service}
                  {index < Math.min(specialties.length, 2) - 1 && specialties.length > 1 && ' • '}
                </Text>
              ))}
              {specialties.length > 2 && (
                <Text style={styles.moreSpecialties}>+{specialties.length - 2}</Text>
              )}
            </View>
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
            {reviewCount !== undefined && (
              <Text style={styles.reviewCount}>리뷰 {reviewCount}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Booking button */}
      <TouchableOpacity
        style={[styles.bookButton, selected && styles.bookButtonSelected]}
        onPress={onPress}
        accessibilityLabel="예약하기"
        accessibilityRole="button"
      >
        <Text style={[styles.bookButtonText, selected && styles.bookButtonTextSelected]}>예약</Text>
      </TouchableOpacity>
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
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#19191b',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
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
  chatButton: {
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
  specialty: {
    fontSize: 14,
    color: '#19191b',
    marginBottom: 4,
    fontWeight: '400',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 4,
  },
  moreSpecialties: {
    fontSize: 14,
    color: colors.muted,
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
  bookButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#19191b',
    backgroundColor: 'transparent',
    marginLeft: spacing.sm,
  },
  bookButtonSelected: {
    backgroundColor: '#19191b',
    borderColor: '#19191b',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#19191b',
  },
  bookButtonTextSelected: {
    color: '#ffffff',
  },
});
