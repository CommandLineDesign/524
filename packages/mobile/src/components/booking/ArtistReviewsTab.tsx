import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { useArtistProfileReviewStats, useArtistProfileReviews } from '../../query/reviews';
import { colors, spacing, textStyles } from '../../theme';
import { StarRating } from '../common/StarRating';
import { ReviewCard } from '../reviews/ReviewCard';

export interface ArtistReviewsTabProps {
  /** Artist ID */
  artistId: string;
  /** Test ID */
  testID?: string;
}

export function ArtistReviewsTab({ artistId, testID }: ArtistReviewsTabProps) {
  const { data: statsData, isLoading: statsLoading } = useArtistProfileReviewStats(artistId);

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useArtistProfileReviews(artistId, { limit: 10 });

  const reviews = useMemo(
    () => reviewsData?.pages.flatMap((page) => page.reviews) ?? [],
    [reviewsData]
  );

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Show loading state only if both are loading
  if (statsLoading && reviewsLoading) {
    return (
      <View style={styles.centered} testID={testID}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const stats = statsData;
  const hasReviews = reviews.length > 0;

  return (
    <FlatList
      data={reviews}
      keyExtractor={(item) => item.id}
      testID={testID}
      ListHeaderComponent={
        stats ? (
          <View style={styles.header}>
            {/* Review Count Title */}
            <Text style={styles.reviewTitle}>
              리뷰 <Text style={styles.reviewCount}>{stats.totalReviews}</Text>
            </Text>

            {/* Star Rating Row */}
            <View style={styles.ratingRow}>
              {stats.totalReviews > 0 ? (
                <StarRating rating={stats.averageOverallRating} size={18} showValue />
              ) : (
                <StarRating rating={0} size={18} />
              )}
            </View>
          </View>
        ) : null
      }
      renderItem={({ item, index }) => (
        <ReviewCard review={item} isLast={index === reviews.length - 1} />
      )}
      ListEmptyComponent={
        reviewsLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.emptyStateDescription}>리뷰를 불러오는 중...</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>아직 리뷰가 없습니다</Text>
          </View>
        )
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      contentContainerStyle={styles.listContent}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewTitle: {
    ...textStyles.h2,
    color: colors.text,
    marginBottom: 8,
  },
  reviewCount: {
    color: colors.primary,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: colors.subtle,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
