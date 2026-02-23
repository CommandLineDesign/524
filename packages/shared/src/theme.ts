/**
 * Shared theme configuration for 524 beauty marketplace
 *
 * This file serves as the single source of truth for all colors in the app.
 * Both mobile (React Native) and web packages import from here.
 *
 * To update the color scheme:
 * 1. Modify the primitive values in `primitives`
 * 2. Semantic colors automatically use the new primitives
 */

/**
 * Primitive color values - the raw color scale
 * Based on #49AA65 with tints (lighter) and shades (darker)
 *
 * Names are semantic intensity levels, not color-specific.
 * To change the color scheme, update the hex values only.
 */
// biome-ignore format: preserve color gradient alignment
export const primitives = {
  // Brand color scale (semantic intensity)
  lightest:    '#ecf6ef', // Replaces white
  lighter:     '#d4eadb', // Very light
  light:       '#b4d9c0', // Light
  mediumLight: '#8dc49d', // Medium-light
  medium:      '#69b37c', // Medium
  base:        '#49AA65', // BASE COLOR
  mediumDark:  '#3d8f55', // Medium-dark
  dark:        '#317346', // Dark
  darker:      '#255837', // Very dark
  darkest:     '#183d27', // Darker
  nearBlack:   '#07110a', // Replaces black

  // Status colors
  successLight: '#dcfce7',
  success:      '#22c55e',
  successDark:  '#166534',

  errorLight: '#fce4e4',
  error:      '#dc2626',
  errorDark:  '#b91c1c',

  infoLight: '#e0f2fe',
  info:      '#0ea5e9',
  infoDark:  '#0369a1',
} as const;

/**
 * Semantic color tokens - what colors mean in context
 * Components should use these, not primitive values
 */
export const colors = {
  // Backgrounds
  background: primitives.lightest,
  surface: primitives.lighter,
  surfaceAlt: primitives.light,
  surfaceHighlight: primitives.lighter,

  // Text
  text: primitives.nearBlack,
  textSecondary: primitives.dark,
  subtle: primitives.mediumDark,
  muted: primitives.medium,

  // Brand colors - primary is the green brand color
  primary: primitives.base, // #49AA65 green (main brand color)
  primaryDark: primitives.mediumDark, // #3d8f55 for pressed/hover states
  primaryLight: primitives.lighter,
  accent: primitives.base,

  // Borders
  border: primitives.light,
  borderDark: primitives.dark, // #317346 (changed from nearBlack)

  // Status colors (red kept for errors - safety critical)
  success: primitives.success,
  error: primitives.error,
  warning: primitives.mediumDark,
  info: primitives.info,

  // Special purpose
  rating: primitives.base, // For star ratings
  spinner: primitives.base, // For loading indicators
  buttonText: primitives.lightest, // For text on primary/dark buttons
} as const;

/**
 * Status badge colors for different states
 */
export const statusColors = {
  // Booking status backgrounds
  pending: primitives.lighter,
  confirmed: primitives.light,
  completed: primitives.successLight,
  declined: primitives.lighter,
  cancelled: primitives.errorLight,
  noShow: primitives.errorLight,

  // Artist verification status
  pendingReview: primitives.base,
  inReview: primitives.info,
  verified: primitives.success,
  rejected: primitives.error,
  suspended: primitives.medium,
} as const;

/**
 * Gradient configurations for backgrounds, panels, and buttons.
 * Uses primitives so gradients update automatically with theme changes.
 *
 * Usage with expo-linear-gradient:
 * <LinearGradient
 *   colors={gradients.light.colors}
 *   start={gradients.light.start}
 *   end={gradients.light.end}
 * />
 */
export const gradients = {
  // Light gradient - for page backgrounds and panels
  light: {
    colors: [primitives.lightest, primitives.lighter] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }, // 45° diagonal
    locations: [0, 1] as const,
  },

  // Light gradient with more color stops - for larger surfaces
  lightSubtle: {
    colors: [primitives.lightest, primitives.lighter, primitives.lightest] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 0.5, 1] as const,
  },

  // Surface gradient - for cards and elevated panels
  surface: {
    colors: [primitives.lighter, primitives.light] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 }, // Top to bottom
    locations: [0, 1] as const,
  },

  // Dark gradient - for primary buttons and emphasis
  dark: {
    colors: [primitives.dark, primitives.nearBlack] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }, // 45° diagonal
    locations: [0, 1] as const,
  },

  // Dark gradient reversed - for hover/pressed states
  darkReverse: {
    colors: [primitives.nearBlack, primitives.dark] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 1] as const,
  },

  // Accent gradient - for call-to-action buttons
  accent: {
    colors: [primitives.base, primitives.mediumDark] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 1] as const,
  },

  // Vibrant gradient - for special highlights
  vibrant: {
    colors: [primitives.mediumLight, primitives.base, primitives.mediumDark] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 0.5, 1] as const,
  },
} as const;

/**
 * Overlay colors for modal backdrops, image overlays, and semi-transparent effects.
 * Uses nearBlack/lightest with opacity for consistency when theme changes.
 *
 * Usage:
 * backgroundColor: overlays.modalBackdrop
 */
// biome-ignore format: preserve alignment
export const overlays = {
  // Modal/dialog backdrops (darkening overlays)
  modalBackdropLight:  'rgba(7, 17, 10, 0.4)',   // nearBlack @ 40%
  modalBackdrop:       'rgba(7, 17, 10, 0.5)',   // nearBlack @ 50%
  modalBackdropDark:   'rgba(7, 17, 10, 0.6)',   // nearBlack @ 60%
  modalBackdropHeavy:  'rgba(7, 17, 10, 0.95)',  // nearBlack @ 95%

  // Image overlays for text legibility
  imageOverlay:        'rgba(7, 17, 10, 0.5)',   // nearBlack @ 50%
  imageShadow:         'rgba(7, 17, 10, 0.2)',   // nearBlack @ 20% (for shadows)

  // Light overlays (lightening effects)
  lightOverlay:        'rgba(236, 246, 239, 0.95)', // lightest @ 95%
  lightOverlaySubtle:  'rgba(236, 246, 239, 0.2)',  // lightest @ 20%

  // Status overlays with transparency
  successOverlay:      'rgba(34, 197, 94, 0.4)',    // success @ 40%
  errorOverlay:        'rgba(220, 38, 38, 0.4)',    // error @ 40%
} as const;

/**
 * Type exports for TypeScript support
 */
export type ColorPrimitives = typeof primitives;
export type Colors = typeof colors;
export type StatusColors = typeof statusColors;
export type Gradients = typeof gradients;
export type Overlays = typeof overlays;
