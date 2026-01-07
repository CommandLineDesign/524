/**
 * Shared state management hook for InteractiveKakaoMap web and native implementations.
 */

import { useCallback, useMemo, useRef, useState } from 'react';

import { DEFAULT_CENTER } from './mapUtils';
import type { InteractiveKakaoMapProps, MapCenter, MapMessage } from './types';

interface UseMapStateOptions {
  center: MapCenter;
  isPinMoveEnabled?: boolean;
  pinLocation?: MapCenter;
  circleCenter?: MapCenter;
  radiusKm?: number;
  onCenterChange: (center: MapCenter) => void;
}

interface UseMapStateResult {
  // State
  isLoading: boolean;
  hasError: boolean;
  isMapReady: boolean;

  // State setters
  setIsLoading: (loading: boolean) => void;
  setHasError: (error: boolean) => void;
  setIsMapReady: (ready: boolean) => void;

  // Computed values
  effectiveCenter: MapCenter;

  // Refs for initial values (to avoid HTML regeneration)
  initialCenterRef: React.MutableRefObject<MapCenter>;
  initialRadiusRef: React.MutableRefObject<number | undefined>;
  initialCircleCenterRef: React.MutableRefObject<MapCenter | undefined>;
  initialPinLocationRef: React.MutableRefObject<MapCenter | undefined>;
  initialIsPinMoveEnabledRef: React.MutableRefObject<boolean>;

  // Ref for tracking last set center (to avoid feedback loops)
  lastSetCenterRef: React.MutableRefObject<MapCenter | null>;

  // Handlers
  handleRetry: () => void;
  handleMapMessage: (message: MapMessage) => void;
}

export function useMapState(options: UseMapStateOptions): UseMapStateResult {
  const {
    center,
    isPinMoveEnabled = false,
    pinLocation,
    circleCenter,
    radiusKm,
    onCenterChange,
  } = options;

  // Loading and error state
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Track the last center we set programmatically to avoid feedback loops
  const lastSetCenterRef = useRef<MapCenter | null>(null);

  // Compute effective center (with default fallback)
  const effectiveCenter = useMemo(
    () => ({
      latitude: center.latitude || DEFAULT_CENTER.latitude,
      longitude: center.longitude || DEFAULT_CENTER.longitude,
    }),
    [center.latitude, center.longitude]
  );

  // Initial values refs - these are captured once and used for HTML generation
  // to avoid WebView/iframe reloads when props change
  const initialCenterRef = useRef(effectiveCenter);
  const initialRadiusRef = useRef(radiusKm);
  const initialCircleCenterRef = useRef(circleCenter);
  const initialPinLocationRef = useRef(pinLocation);
  const initialIsPinMoveEnabledRef = useRef(isPinMoveEnabled);

  // Retry handler
  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setIsMapReady(false);
  }, []);

  // Message handler for processing map events
  const handleMapMessage = useCallback(
    (message: MapMessage) => {
      switch (message.type) {
        case 'ready':
          setIsLoading(false);
          setIsMapReady(true);
          break;

        case 'dragEnd':
        case 'centerChanged':
          if (message.payload?.latitude && message.payload?.longitude) {
            const newCenter = {
              latitude: message.payload.latitude,
              longitude: message.payload.longitude,
            };
            lastSetCenterRef.current = newCenter;
            onCenterChange(newCenter);
          }
          break;

        case 'error':
          console.error('[InteractiveKakaoMap] Map error:', message.payload?.error);
          setHasError(true);
          setIsLoading(false);
          break;
      }
    },
    [onCenterChange]
  );

  return {
    // State
    isLoading,
    hasError,
    isMapReady,

    // State setters
    setIsLoading,
    setHasError,
    setIsMapReady,

    // Computed values
    effectiveCenter,

    // Refs
    initialCenterRef,
    initialRadiusRef,
    initialCircleCenterRef,
    initialPinLocationRef,
    initialIsPinMoveEnabledRef,
    lastSetCenterRef,

    // Handlers
    handleRetry,
    handleMapMessage,
  };
}
