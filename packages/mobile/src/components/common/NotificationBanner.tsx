import React from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface TextSegment {
  id: string;
  text: string;
  bold: boolean;
}

interface NotificationBannerProps {
  segments: TextSegment[];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function NotificationBanner({
  segments,
  onPress,
  style,
  accessibilityLabel,
}: NotificationBannerProps) {
  const fullText = segments.map((s) => s.text).join('');

  const content = (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>
        {segments.map((segment) => (
          <Text key={segment.id} style={segment.bold ? styles.boldText : styles.regularText}>
            {segment.text}
          </Text>
        ))}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? fullText}
        accessibilityHint="Tap to view notification details"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  regularText: {
    fontWeight: '400',
    color: colors.text,
  },
  boldText: {
    fontWeight: '700',
    color: colors.text,
  },
});
