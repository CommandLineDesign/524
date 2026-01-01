import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { useArtistProfileReviewStats, useArtistProfileReviews } from '../../query/reviews';
import { colors, spacing } from '../../theme';
import { renderStars } from '../../utils/starUtils';
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
            {/* Overall Rating Summary */}
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingValue}>
                {stats.averageOverallRating > 0 ? stats.averageOverallRating.toFixed(1) : 'N/A'}
              </Text>
              <View style={styles.ratingDetails}>
                <Text style={styles.stars}>
                  {stats.totalReviews > 0 ? renderStars(stats.averageOverallRating) : '☆☆☆☆☆'}
                </Text>
                <Text style={styles.reviewCount}>리뷰 {stats.totalReviews}</Text>
              </View>
            </View>

            {/* Dimension Stats */}
            {stats.totalReviews > 0 && (
              <View style={styles.dimensionStats}>
                <View style={styles.dimensionRow}>
                  <Text style={styles.dimensionLabel}>품질</Text>
                  <View style={styles.dimensionValue}>
                    <View style={styles.ratingBar}>
                      <View
                        style={[
                          styles.ratingBarFill,
                          { width: `${(stats.averageQualityRating / 5) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.dimensionScore}>
                      {stats.averageQualityRating?.toFixed(1) ?? 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.dimensionRow}>
                  <Text style={styles.dimensionLabel}>전문성</Text>
                  <View style={styles.dimensionValue}>
                    <View style={styles.ratingBar}>
                      <View
                        style={[
                          styles.ratingBarFill,
                          { width: `${(stats.averageProfessionalismRating / 5) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.dimensionScore}>
                      {stats.averageProfessionalismRating?.toFixed(1) ?? 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.dimensionRow}>
                  <Text style={styles.dimensionLabel}>시간준수</Text>
                  <View style={styles.dimensionValue}>
                    <View style={styles.ratingBar}>
                      <View
                        style={[
                          styles.ratingBarFill,
                          { width: `${(stats.averageTimelinessRating / 5) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.dimensionScore}>
                      {stats.averageTimelinessRating?.toFixed(1) ?? 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : null
      }
      renderItem={({ item }) => <ReviewCard review={item} containerStyle={styles.reviewCard} />}
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
    borderBottomColor: '#19191b',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#19191b',
  },
  ratingDetails: {
    flex: 1,
    gap: 6,
  },
  stars: {
    fontSize: 18,
    color: '#FFB800',
  },
  reviewCount: {
    fontSize: 14,
    color: '#19191b',
    fontWeight: '400',
  },
  dimensionStats: {
    gap: 12,
  },
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dimensionLabel: {
    fontSize: 14,
    color: '#19191b',
    width: 70,
  },
  dimensionValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#efeff0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 4,
  },
  dimensionScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#19191b',
    width: 32,
    textAlign: 'right',
  },
  reviewCard: {
    marginHorizontal: 20,
    marginBottom: 12,
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
