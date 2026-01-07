/**
 * Shared types for InteractiveKakaoMap web and native implementations.
 */

export interface MapCenter {
  latitude: number;
  longitude: number;
}

export interface InteractiveKakaoMapProps {
  /** Current center position of the map */
  center: MapCenter;
  /** Callback fired when map center changes (after user stops dragging) - only called when isPinMoveEnabled is true */
  onCenterChange: (center: MapCenter) => void;
  /** Whether pin-move mode is enabled. When true, dragging/zooming the map triggers onCenterChange */
  isPinMoveEnabled?: boolean;
  /** Fixed pin location to display (when not in pin-move mode, shows pin at this location) */
  pinLocation?: MapCenter;
  /** Center position for the radius circle (defaults to pinLocation or center if not provided) */
  circleCenter?: MapCenter;
  /** Optional service radius in kilometers to show as circle overlay */
  radiusKm?: number;
  /** Height of the map view in pixels (default: 300) */
  height?: number;
  /** Test ID for testing */
  testID?: string;
}

export interface MapMessage {
  type: 'ready' | 'centerChanged' | 'dragStart' | 'dragEnd' | 'error';
  payload?: {
    latitude?: number;
    longitude?: number;
    error?: string;
  };
}

export interface GenerateMapHtmlOptions {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  isPinMoveEnabled?: boolean;
  pinLocation?: MapCenter;
  circleCenter?: MapCenter;
}
