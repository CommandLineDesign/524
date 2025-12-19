import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Review } from '../api/client';
import { ReviewCard } from '../components/reviews/ReviewCard';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useArtistReviewStats, useArtistReviews } from '../query/reviews';
import { colors } from '../theme/colors';
import { renderStars } from '../utils/starUtils';

type ArtistReviewsNavProp = NativeStackNavigationProp<RootStackParamList, 'ArtistReviews'>;

const PAGE_SIZE = 20;

export function ArtistReviewsScreen() {
  const navigation = useNavigation<ArtistReviewsNavProp>();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useArtistReviews({
    limit: PAGE_SIZE,
  });

  const { data: stats, isLoading: isStatsLoading, isError: isStatsError } = useArtistReviewStats();

  const reviews = data?.pages.flatMap((page) => page.reviews) ?? [];
  const hasMore = hasNextPage ?? false;

  const handleSelectReview = (review: Review) => {
    // Navigate to booking detail
    navigation.navigate('BookingDetail', { bookingId: review.bookingId });
  };

  const handleLoadMore = () => {
    if (hasMore && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = ({ item }: { item: Review }) => (
    <ReviewCard review={item} onPress={() => handleSelectReview(item)} />
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={handleLoadMore}
          disabled={isFetchingNextPage}
        >
          <Text style={styles.loadMoreText}>{isFetchingNextPage ? '로딩 중...' : '더 보기'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStats = () => {
    if (isStatsLoading) {
      return (
        <View style={styles.statsContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }

    if (isStatsError || !stats) {
      return null;
    }

    if (stats.totalReviews === 0) {
      return (
        <View style={styles.statsContainer}>
          <View style={styles.emptyStats}>
            <Text style={styles.emptyStatsText}>아직 받은 리뷰가 없습니다</Text>
            <Text style={styles.emptyStatsSubtext}>첫 리뷰를 기다리고 있어요!</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsHeader}>
          <View style={styles.overallRating}>
            <Text style={styles.ratingNumber}>{stats.averageOverallRating}</Text>
            <Text style={styles.stars}>{renderStars(stats.averageOverallRating)}</Text>
            <Text style={styles.reviewCount}>총 {stats.totalReviews}개의 리뷰</Text>
          </View>
        </View>

        <View style={styles.detailRatings}>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>품질</Text>
            <Text style={styles.starsSmall}>{renderStars(stats.averageQualityRating)}</Text>
            <Text style={styles.ratingValue}>{stats.averageQualityRating}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>전문성</Text>
            <Text style={styles.starsSmall}>{renderStars(stats.averageProfessionalismRating)}</Text>
            <Text style={styles.ratingValue}>{stats.averageProfessionalismRating}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>시간 엄수</Text>
            <Text style={styles.starsSmall}>{renderStars(stats.averageTimelinessRating)}</Text>
            <Text style={styles.ratingValue}>{stats.averageTimelinessRating}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>내 리뷰</Text>
        <Text style={styles.subtitle}>받은 리뷰를 확인하세요.</Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.mutedText}>리뷰를 불러오는 중...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>리뷰를 불러오지 못했어요. 다시 시도해 주세요.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.mutedText}>받은 리뷰가 없어요.</Text>
          <Text style={styles.mutedTextSmall}>
            첫 예약을 완료하여 고객으로부터 리뷰를 받아보세요.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
          ListHeaderComponent={renderStats}
          ListFooterComponent={renderFooter}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.subtle,
  },
  statsContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  overallRating: {
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
  },
  stars: {
    fontSize: 24,
    color: '#FFB800',
  },
  starsSmall: {
    fontSize: 16,
    color: '#FFB800',
  },
  reviewCount: {
    fontSize: 14,
    color: colors.subtle,
    marginTop: 4,
  },
  detailRatings: {
    gap: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    width: 60,
  },
  ratingValue: {
    fontSize: 14,
    color: colors.subtle,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  mutedText: {
    fontSize: 14,
    color: colors.subtle,
    textAlign: 'center',
  },
  mutedTextSmall: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    color: colors.accent,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
  },
  listContent: {
    paddingBottom: 16,
    gap: 12,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyStats: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStatsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStatsSubtext: {
    fontSize: 14,
    color: colors.subtle,
    textAlign: 'center',
  },
});
