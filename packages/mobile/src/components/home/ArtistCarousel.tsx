import type { ArtistSearchResult } from '@524/shared/artists';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { ArtistCarouselCard } from './ArtistCarouselCard';

export interface ArtistCarouselProps {
  title: string;
  artists: ArtistSearchResult[];
  isLoading?: boolean;
  onArtistPress: (artistId: string) => void;
  emptyMessage?: string;
}

export function ArtistCarousel({
  title,
  artists,
  isLoading = false,
  onArtistPress,
  emptyMessage = '아티스트를 찾을 수 없습니다',
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {isLoading ? (
        renderLoading()
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
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
});
