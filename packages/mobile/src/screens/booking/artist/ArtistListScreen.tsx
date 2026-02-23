import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { searchArtists } from '../../../api/client';
import { ArtistCard, BookingLayout, ContinueButton, SortModal } from '../../../components/booking';
import {
  type ArtistSortType,
  artistListStrings,
  artistSortOptions,
} from '../../../constants/bookingOptions';
import type { RootStackParamList } from '../../../navigation/AppNavigator';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { borderRadius, colors, spacing } from '../../../theme';

interface ArtistListScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  onExit?: () => void;
  showBackButton?: boolean;
  progress: number;
  /** List variant: default, bookmarked, or nearby */
  variant?: 'default' | 'bookmarked' | 'nearby';
}

type ArtistListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookingFlow'>;

export function ArtistListScreen({
  onContinue,
  onBack,
  onExit,
  showBackButton = false,
  progress,
  variant = 'default',
}: ArtistListScreenProps) {
  const navigation = useNavigation<ArtistListNavigationProp>();
  const {
    selectedArtistId,
    setSelectedArtist,
    artistSortType,
    setArtistSortType,
    serviceType,
    occasion,
  } = useBookingFlowStore();

  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [bookmarkedArtists, setBookmarkedArtists] = useState<string[]>([]);

  // Fetch artists from API
  const {
    data: artists,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['artists', serviceType, occasion],
    queryFn: () =>
      searchArtists({
        serviceType: serviceType ?? undefined,
        occasion: occasion ?? undefined,
      }),
    enabled: Boolean(serviceType),
  });

  // Filter and sort artists based on variant and sort type
  const displayArtists = React.useMemo(() => {
    if (!artists) return [];

    let filteredArtists = [...artists];

    // Filter by variant
    if (variant === 'bookmarked') {
      filteredArtists = filteredArtists.filter((a) => bookmarkedArtists.includes(a.id));
    }

    // Sort artists
    switch (artistSortType) {
      case 'popular':
        filteredArtists.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'reviews':
        filteredArtists.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'priceLow':
        filteredArtists.sort((a, b) => a.priceRange[0] - b.priceRange[0]);
        break;
      case 'priceHigh':
        filteredArtists.sort((a, b) => b.priceRange[1] - a.priceRange[1]);
        break;
      case 'distance':
        // Distance sorting would require location data - skip for now
        break;
    }

    return filteredArtists;
  }, [artists, variant, artistSortType, bookmarkedArtists]);

  const handleArtistSelect = (artistId: string) => {
    setSelectedArtist(artistId);
  };

  const handleArtistDetailPress = (artistId: string) => {
    navigation.navigate('ArtistDetail', { artistId });
  };

  const handleBookmarkToggle = (artistId: string) => {
    setBookmarkedArtists((prev) =>
      prev.includes(artistId) ? prev.filter((id) => id !== artistId) : [...prev, artistId]
    );
  };

  const handleContinue = () => {
    if (selectedArtistId) {
      onContinue();
    }
  };

  const getTitle = () => {
    switch (variant) {
      case 'bookmarked':
        return artistListStrings.bookmarkedTitle;
      case 'nearby':
        return artistListStrings.nearbyTitle;
      default:
        return artistListStrings.title;
    }
  };

  const isEmpty = displayArtists.length === 0;

  return (
    <BookingLayout
      title={getTitle()}
      showCloseButton={Boolean(onExit)}
      onClose={onExit}
      onBack={onBack}
      showBackButton={showBackButton}
      scrollable={false}
      footer={
        <ContinueButton label="선택 완료" onPress={handleContinue} disabled={!selectedArtistId} />
      }
      testID="artist-list-screen"
    >
      {/* Artist count and sort button row */}
      <View style={styles.headerRow}>
        {/* Artist count */}
        <Text style={styles.artistCount}>
          {displayArtists.length >= 999 ? '999+' : displayArtists.length}개
        </Text>

        {/* Sort button */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortModalVisible(true)}
          accessibilityLabel="정렬 옵션"
          accessibilityRole="button"
        >
          <Text style={styles.sortButtonText}>
            {artistSortOptions.find((opt) => opt.id === artistSortType)?.label || '인기순'}
          </Text>
          <DownCaretIcon />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>아티스트를 불러오는 중...</Text>
        </View>
      ) : isError ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>아티스트를 불러올 수 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            {error instanceof Error ? error.message : '다시 시도해주세요'}
          </Text>
        </View>
      ) : isEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {variant === 'bookmarked'
              ? artistListStrings.bookmarkedEmpty
              : artistListStrings.noResults}
          </Text>
          <Text style={styles.emptySubtitle}>{artistListStrings.adjustFilters}</Text>
        </View>
      ) : (
        <FlatList
          data={displayArtists}
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
              isBookmarked={bookmarkedArtists.includes(item.id)}
              selected={selectedArtistId === item.id}
              onPress={() => handleArtistSelect(item.id)}
              onInfoPress={() => handleArtistDetailPress(item.id)}
              onBookmarkToggle={() => handleBookmarkToggle(item.id)}
              specialties={item.specialties}
              testID={`artist-card-${item.id}`}
            />
          )}
        />
      )}

      <SortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        selectedSort={artistSortType}
        onSelectSort={(sort: ArtistSortType) => setArtistSortType(sort)}
      />
    </BookingLayout>
  );
}

// Down caret icon component
function DownCaretIcon() {
  return (
    <View style={styles.caretIcon}>
      <Text style={styles.caretText}>▼</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  artistCount: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
  },
  caretIcon: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caretText: {
    fontSize: 8,
    color: colors.text,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
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
  loadingText: {
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.md,
  },
});
