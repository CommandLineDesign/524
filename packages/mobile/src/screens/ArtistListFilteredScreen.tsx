import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { searchArtistsFiltered } from '../api/client';
import { ArtistCard, SortModal } from '../components/booking';
import {
  type ArtistSortType,
  artistListStrings,
  artistSortOptions,
} from '../constants/bookingOptions';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing } from '../theme';

type ArtistListFilteredRouteProp = RouteProp<RootStackParamList, 'ArtistListFiltered'>;
type ArtistListFilteredNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ArtistListFiltered'
>;

export function ArtistListFilteredScreen() {
  const route = useRoute<ArtistListFilteredRouteProp>();
  const navigation = useNavigation<ArtistListFilteredNavigationProp>();
  const { serviceType, latitude, longitude, dateTime, locationAddress } = route.params;

  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortType, setSortType] = useState<ArtistSortType>('reviews');

  // Fetch artists using the filtered search API (same as home screen carousels)
  const {
    data: artists,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['filteredArtists', serviceType, latitude, longitude, dateTime],
    queryFn: () =>
      searchArtistsFiltered({
        serviceType,
        latitude,
        longitude,
        dateTime,
      }),
  });

  // Sort artists based on selected sort type
  // Artists with reviews are always prioritized over those without
  const sortedArtists = useMemo(() => {
    if (!artists) return [];

    const sorted = [...artists];

    sorted.sort((a, b) => {
      // Artists with reviews come first
      const aHasReviews = a.reviewCount > 0;
      const bHasReviews = b.reviewCount > 0;
      if (aHasReviews !== bHasReviews) {
        return bHasReviews ? 1 : -1;
      }

      // Then apply the selected sort
      switch (sortType) {
        case 'popular':
          return b.reviewCount - a.reviewCount;
        case 'reviews':
          return b.averageRating - a.averageRating;
        case 'priceLow':
          return a.priceRange[0] - b.priceRange[0];
        case 'priceHigh':
          return b.priceRange[1] - a.priceRange[1];
        case 'distance':
          // Distance sorting would require additional data - skip for now
          return 0;
        default:
          return 0;
      }
    });

    return sorted;
  }, [artists, sortType]);

  const handleArtistPress = useCallback(
    (artistId: string) => {
      // Extract time slot in HH:MM format from the ISO datetime string
      const dateObj = new Date(dateTime);
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      const timeSlot = `${hours}:${minutes}`;

      navigation.navigate('ArtistDetail', {
        artistId,
        fromHomeScreen: true,
        preselectedLocation: locationAddress,
        preselectedCoordinates: { lat: latitude, lng: longitude },
        preselectedDate: dateTime,
        preselectedTimeSlot: timeSlot,
        preselectedServiceType: serviceType,
      });
    },
    [navigation, locationAddress, latitude, longitude, dateTime, serviceType]
  );

  const getServiceTypeLabel = () => {
    switch (serviceType) {
      case 'combo':
        return '헤어 메이크업';
      case 'hair':
        return '헤어';
      case 'makeup':
        return '메이크업';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header info */}
      <View style={styles.headerInfo}>
        <View style={styles.filterChip}>
          <Ionicons name="cut-outline" size={14} color={colors.text} />
          <Text style={styles.filterChipText}>{getServiceTypeLabel()}</Text>
        </View>
      </View>

      {/* Sort row */}
      <View style={styles.sortRow}>
        <Text style={styles.artistCount}>
          {sortedArtists.length >= 999 ? '999+' : sortedArtists.length}개
        </Text>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortModalVisible(true)}
          accessibilityLabel="정렬 옵션"
          accessibilityRole="button"
        >
          <Text style={styles.sortButtonText}>
            {artistSortOptions.find((opt) => opt.id === sortType)?.label || '리뷰순'}
          </Text>
          <Text style={styles.caretText}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>아티스트를 불러오는 중...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>아티스트를 불러올 수 없습니다</Text>
          <Text style={styles.errorSubtitle}>
            {error instanceof Error ? error.message : '다시 시도해주세요'}
          </Text>
        </View>
      ) : sortedArtists.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>{artistListStrings.noResults}</Text>
          <Text style={styles.emptySubtitle}>{artistListStrings.adjustFilters}</Text>
        </View>
      ) : (
        <FlatList
          data={sortedArtists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ArtistCard
              id={item.id}
              name={item.stageName}
              imageUrl={item.profileImageUrl}
              rating={item.averageRating}
              reviewCount={item.reviewCount}
              startingPrice={item.priceRange[0]}
              onPress={() => handleArtistPress(item.id)}
              onInfoPress={() => handleArtistPress(item.id)}
              username={item.stageName.toLowerCase().replace(/\s+/g, '')}
              specialties={item.specialties}
              testID={`artist-card-${item.id}`}
            />
          )}
        />
      )}

      <SortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        selectedSort={sortType}
        onSelectSort={setSortType}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerInfo: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: 4,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  artistCount: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
  },
  caretText: {
    fontSize: 8,
    color: colors.text,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorSubtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
});
