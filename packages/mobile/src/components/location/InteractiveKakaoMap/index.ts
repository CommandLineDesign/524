/**
 * InteractiveKakaoMap - Platform-aware component for displaying Kakao Maps.
 *
 * This module provides separate implementations for web (iframe) and native (WebView)
 * platforms, with shared types, utilities, and state management.
 */

import { Platform } from 'react-native';

import { InteractiveKakaoMapNative } from './InteractiveKakaoMap.native';
import { InteractiveKakaoMapWeb } from './InteractiveKakaoMap.web';
import type { InteractiveKakaoMapProps, MapCenter } from './types';

/**
 * InteractiveKakaoMap component that automatically selects the appropriate
 * implementation based on the current platform.
 */
export const InteractiveKakaoMap = Platform.select({
  web: InteractiveKakaoMapWeb,
  default: InteractiveKakaoMapNative,
}) as React.ComponentType<InteractiveKakaoMapProps>;

// Re-export types for external use
export type { InteractiveKakaoMapProps, MapCenter };
