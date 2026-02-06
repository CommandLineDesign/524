import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius } from '../../theme/borderRadius';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export interface LocationSelectorButtonProps {
  location: { lat: number; lng: number } | null;
  address: string | null;
  onPress: () => void;
  isLoading?: boolean;
}

export function LocationSelectorButton({
  address,
  onPress,
  isLoading = false,
}: LocationSelectorButtonProps) {
  const displayText = address || '위치 선택';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={`선택된 위치: ${displayText}`}
      accessibilityHint="탭하여 위치를 변경합니다"
    >
      <View style={styles.iconContainer}>
        <Ionicons name="location-outline" size={20} color={colors.text} />
      </View>

      <View style={styles.textContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.muted} />
        ) : (
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
            {displayText}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
});
