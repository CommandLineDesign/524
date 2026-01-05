import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { borderRadius, colors, spacing } from '../../theme';

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
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  cardSelected: {
    borderWidth: 3,
    borderColor: colors.borderDark,
    backgroundColor: colors.background,
  },
  image: {
    width: 280,
    height: 360,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.border,
    resizeMode: 'cover',
  },
  imageSelected: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  fallback: {
    color: colors.textSecondary,
    fontSize: 14,
    marginVertical: spacing.md,
  },
});
