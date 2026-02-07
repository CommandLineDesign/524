import type { ArtistSearchResult } from '@524/shared/artists';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { newHomeStrings } from '../../constants/newHomeStrings';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { ArtistCarouselCard } from './ArtistCarouselCard';

export interface ArtistCarouselProps {
  title: string;
  artists: ArtistSearchResult[];
  isLoading?: boolean;
  error?: Error | null;
  onArtistPress: (artistId: string) => void;
  onShowAll?: () => void;
  emptyMessage?: string;
  testID?: string;
}

export function ArtistCarousel({
  title,
  artists,
  isLoading = false,
  error = null,
  onArtistPress,
  onShowAll,
  emptyMessage = '아티스트를 찾을 수 없습니다',
  testID,
}: ArtistCarouselProps) {
  const renderItem = ({ item }: { item: ArtistSearchResult }) => (
    <ArtistCarouselCard artist={item} onPress={() => onArtistPress(item.id)} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color={colors.muted} />
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>검색 중 오류가 발생했습니다</Text>
    </View>
  );

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {onShowAll && artists.length > 0 && (
          <TouchableOpacity onPress={onShowAll} accessibilityRole="button">
            <Text style={styles.showAllText}>{newHomeStrings.carousels.showAll}</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : artists.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={artists}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  showAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  separator: {
    width: 6,
  },
  emptyContainer: {
    height: 116,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 17,
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
  },
  loadingContainer: {
    height: 116,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 116,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 17,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
  },
});
