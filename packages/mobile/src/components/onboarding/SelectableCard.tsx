import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { borderRadius, colors, overlays, spacing } from '../../theme';
import { shadows } from '../../theme/shadows';

type SelectableCardProps = {
  title?: string;
  imageUrl?: string;
  selected?: boolean;
  onPress: () => void;
};

export function SelectableCard({
  title,
  imageUrl,
  selected = false,
  onPress,
}: SelectableCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected ? styles.cardSelected : undefined]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, selected && styles.imageSelected]}
        />
      ) : (
        <Text style={styles.fallback}>Image unavailable</Text>
      )}
      {title ? <Text style={styles.title}>{title}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: overlays.frostedGlass,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.accentAlt,
    backgroundColor: colors.surfaceAlt,
  },
  image: {
    width: 280,
    height: 360,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.border,
    resizeMode: 'cover',
  },
  imageSelected: {
    borderWidth: 2,
    borderColor: colors.accentAlt,
  },
  fallback: {
    color: colors.textSecondary,
    fontSize: 14,
    marginVertical: spacing.md,
  },
});
