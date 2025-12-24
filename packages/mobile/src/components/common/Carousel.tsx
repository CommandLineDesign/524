import React from 'react';
import {
  FlatList,
  type ListRenderItem,
  type StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

import { borderRadius } from '../../theme/borderRadius';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const CARD_SIZE = 116;
const CARD_BORDER_RADIUS = 17;
const CARD_GAP = 6;

interface CarouselItem {
  id: string;
  label: string;
  imageUrl?: string;
  isPlaceholder?: boolean;
}

interface CarouselProps {
  title: string;
  data: CarouselItem[];
  onItemPress?: (item: CarouselItem, index: number) => void;
  placeholderCount?: number;
  emptyLabels?: string[];
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Carousel({
  title,
  data,
  onItemPress,
  placeholderCount = 3,
  emptyLabels,
  style,
  accessibilityLabel,
}: CarouselProps) {
  const isEmpty = data.length === 0;

  const placeholderData: CarouselItem[] = isEmpty
    ? Array.from({ length: placeholderCount }, (_, index) => ({
        id: `placeholder-${index}`,
        label: emptyLabels?.[index] ?? '',
        isPlaceholder: true,
      }))
    : [];

  const displayData = isEmpty ? placeholderData : data;

  const renderItem: ListRenderItem<CarouselItem> = ({ item, index }) => {
    const isPlaceholder = item.isPlaceholder ?? false;

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => !isPlaceholder && onItemPress?.(item, index)}
        disabled={isPlaceholder}
        accessibilityRole="button"
        accessibilityLabel={item.label || `${title} item ${index + 1}`}
      >
        <View style={styles.card}>
          <View style={styles.cardPlaceholder} />
        </View>
        {item.label ? <Text style={styles.label}>{item.label}</Text> : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]} accessibilityLabel={accessibilityLabel ?? title}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={displayData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
    lineHeight: 22,
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  separator: {
    width: CARD_GAP,
  },
  itemContainer: {
    alignItems: 'center',
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_BORDER_RADIUS,
    overflow: 'hidden',
  },
  cardPlaceholder: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
