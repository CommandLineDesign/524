import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, spacing, textStyles } from '../../theme';

export interface ScreenHeaderProps {
  /** Screen title */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Left action: 'back' shows back arrow, 'close' shows X, or pass custom node */
  leftAction?: 'back' | 'close' | React.ReactNode;
  /** Right side actions */
  rightActions?: React.ReactNode;
  /** Use transparent background */
  transparent?: boolean;
  /** Test ID */
  testID?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  leftAction = 'back',
  rightActions,
  transparent = false,
  testID,
}: ScreenHeaderProps) {
  const navigation = useNavigation();

  const handleLeftPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const renderLeftAction = () => {
    if (!leftAction) return <View style={styles.actionPlaceholder} />;

    if (leftAction === 'back') {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLeftPress}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }

    if (leftAction === 'close') {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLeftPress}
          accessibilityRole="button"
          accessibilityLabel="닫기"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }

    return leftAction;
  };

  return (
    <View style={[styles.container, transparent && styles.transparent]} testID={testID}>
      <View style={styles.leftSection}>{renderLeftAction()}</View>

      <View style={styles.titleSection}>
        {title && (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {rightActions || <View style={styles.actionPlaceholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    minHeight: 56,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPlaceholder: {
    width: 40,
    height: 40,
  },
  title: {
    ...textStyles.h3,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
