import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
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
import { useCustomerReviews } from '../query/reviews';
import { colors } from '../theme/colors';

type MyReviewsNavProp = NativeStackNavigationProp<RootStackParamList, 'MyReviews'>;

const PAGE_SIZE = 20;

export function MyReviewsScreen() {
  const navigation = useNavigation<MyReviewsNavProp>();
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isError, refetch, isRefetching } = useCustomerReviews({
    limit: PAGE_SIZE,
    offset,
  });

  const reviews = data?.reviews ?? [];
  const hasMore = data?.pagination?.hasMore ?? false;

  const handleSelectReview = (review: Review) => {
    // Navigate to booking detail
    navigation.navigate('BookingDetail', { bookingId: review.bookingId });
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading && !isRefetching) {
      setOffset((prev) => prev + PAGE_SIZE);
    }
  };

  const renderItem = ({ item }: { item: Review }) => (
    <ReviewCard review={item} onPress={() => handleSelectReview(item)} />
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.footer}>
        <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
          <Text style={styles.loadMoreText}>더 보기</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>내 리뷰</Text>
        <Text style={styles.subtitle}>작성한 리뷰를 확인하고 아티스트의 답변을 확인하세요.</Text>
      </View>

      {isLoading && offset === 0 ? (
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
          <Text style={styles.mutedText}>작성한 리뷰가 없어요.</Text>
          <Text style={styles.mutedTextSmall}>
            서비스를 완료한 후 리뷰를 남겨보세요. 다른 고객들에게 도움이 됩니다.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                setOffset(0);
                refetch();
              }}
            />
          }
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
    padding: 16,
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
});
