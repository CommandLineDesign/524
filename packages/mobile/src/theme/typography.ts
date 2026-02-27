import type { TextStyle } from 'react-native';

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 16,
    lg: 18,
    xl: 24,
    title: 28,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

/**
 * Semantic text style presets for consistent typography hierarchy.
 * Use these instead of manually specifying fontSize/fontWeight.
 */
export const textStyles: Record<string, TextStyle> = {
  // Headings
  h1: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },

  // Body text
  bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400', lineHeight: 16 },

  // Labels (for form fields, buttons, etc.)
  label: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  labelSmall: { fontSize: 12, fontWeight: '600', lineHeight: 16 },

  // Caption (for metadata, timestamps, etc.)
  caption: { fontSize: 11, fontWeight: '500', lineHeight: 14 },
} as const;
