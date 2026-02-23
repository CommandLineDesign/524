import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, gradients } from '../../theme';

type GradientPreset = keyof typeof gradients;

interface GradientBackgroundProps {
  children: ReactNode;
  /** Which gradient preset to use. Defaults to 'lightSubtle' */
  preset?: GradientPreset;
  /** Additional styles for the gradient container */
  style?: ViewStyle;
  /** If true, uses solid background color instead of gradient */
  solid?: boolean;
}

export function GradientBackground({
  children,
  preset = 'lightSubtle',
  style,
  solid = false,
}: GradientBackgroundProps) {
  if (solid) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }, style]}>
        {children}
      </View>
    );
  }

  const gradientConfig = gradients[preset];

  return (
    <LinearGradient
      colors={[...gradientConfig.colors]}
      start={gradientConfig.start}
      end={gradientConfig.end}
      locations={[...gradientConfig.locations]}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
