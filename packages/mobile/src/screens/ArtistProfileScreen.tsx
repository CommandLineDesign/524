import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Review } from '../api/client';
import { ReviewCard } from '../components/reviews/ReviewCard';
import { useArtistProfileReviewStats, useArtistProfileReviews } from '../query/reviews';
import { colors } from '../theme/colors';
import { renderStars } from '../utils/starUtils';

interface ArtistProfileScreenProps {
  route: {
    params: {
      artistId: string;
    };
  };
}

export function ArtistProfileScreen({ route }: ArtistProfileScreenProps) {
  const { artistId } = route.params;

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useArtistProfileReviewStats(artistId);

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchReviews,
  } = useArtistProfileReviews(artistId, { limit: 10 });

  const reviews = useMemo(
    () => reviewsData?.pages.flatMap((page) => page.reviews) ?? [],
    [reviewsData]
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStats(), refetchReviews()]);
    setIsRefreshing(false);
  };

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Allow progressive rendering: show stats when available, even if reviews are still loading
  if (statsLoading && reviewsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const stats = statsData;
  const hasReviews = reviews.length > 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Aggregate Statistics */}
            {stats && (
              <View style={styles.statsSection}>
                <View style={styles.overallRatingContainer}>
                  <Text style={styles.overallRatingValue}>
                    {stats.averageOverallRating > 0 ? stats.averageOverallRating.toFixed(1) : 'N/A'}
                  </Text>
                  <View style={styles.overallRatingDetails}>
                    <Text style={styles.stars}>
                      {stats.totalReviews > 0 ? renderStars(stats.averageOverallRating) : '☆☆☆☆☆'}
                    </Text>
                    <Text style={styles.reviewCount}>
                      {stats.totalReviews === 0 ? '리뷰 없음' : `${stats.totalReviews}개의 리뷰`}
                    </Text>
                  </View>
                </View>

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
            )}

            {/* Reviews Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>리뷰</Text>
            </View>
          </View>
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
              <Text style={styles.emptyStateDescription}>
                첫 번째 예약을 완료하고 리뷰를 받아보세요
              </Text>
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
      />
    </View>
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
    gap: 20,
    paddingBottom: 16,
  },
  statsSection: {
    backgroundColor: colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  overallRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  overallRatingValue: {
    fontSize: 56,
    fontWeight: '700',
    color: colors.text,
  },
  overallRatingDetails: {
    flex: 1,
    gap: 6,
  },
  stars: {
    fontSize: 20,
    color: colors.rating,
  },
  reviewCount: {
    fontSize: 14,
    color: colors.subtle,
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
    color: colors.text,
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
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: colors.rating,
    borderRadius: 4,
  },
  dimensionScore: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    width: 32,
    textAlign: 'right',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
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
    fontSize: 18,
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
