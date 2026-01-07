/**
 * Web implementation of InteractiveKakaoMap using iframe.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, spacing } from '../../../theme';
import { KAKAO_JS_KEY, areCentersEqual, generateMapHtml, getZoomLevelForRadius } from './mapUtils';
import type { InteractiveKakaoMapProps, MapMessage } from './types';
import { useMapState } from './useMapState';

// Web-specific types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      iframe: React.DetailedHTMLProps<
        React.IframeHTMLAttributes<HTMLIFrameElement>,
        HTMLIFrameElement
      >;
    }
  }
}

export function InteractiveKakaoMapWeb({
  center,
  onCenterChange,
  isPinMoveEnabled = false,
  pinLocation,
  circleCenter,
  radiusKm,
  height,
  testID,
}: InteractiveKakaoMapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const {
    isLoading,
    hasError,
    isMapReady,
    setIsLoading,
    setHasError,
    setIsMapReady,
    initialCenterRef,
    initialRadiusRef,
    initialCircleCenterRef,
    initialPinLocationRef,
    initialIsPinMoveEnabledRef,
    lastSetCenterRef,
    handleRetry,
    handleMapMessage,
  } = useMapState({
    center,
    isPinMoveEnabled,
    pinLocation,
    circleCenter,
    radiusKm,
    onCenterChange,
  });

  // Generate HTML with window.parent.postMessage for web
  // Note: We use initial values and update everything dynamically via postMessage to avoid iframe reloads
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally empty deps - refs capture initial values, updates happen via postMessage
  const html = useMemo(() => {
    const mapHtml = generateMapHtml({
      latitude: initialCenterRef.current.latitude,
      longitude: initialCenterRef.current.longitude,
      radiusKm: initialRadiusRef.current,
      isPinMoveEnabled: initialIsPinMoveEnabledRef.current,
      pinLocation: initialPinLocationRef.current,
      circleCenter: initialCircleCenterRef.current,
    });
    // Replace postMessage calls for web
    const replacedHtml = mapHtml.replace(
      /window\.ReactNativeWebView\.postMessage/g,
      'window.parent.postMessage'
    );
    // Also replace the conditional check for ReactNativeWebView
    return replacedHtml.replace(/if \(window\.ReactNativeWebView\)/g, 'if (window.parent)');
  }, []);

  // Use blob URL instead of data URI to avoid size limits
  const blobUrl = useMemo(() => {
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [html]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  // Listen to messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message: MapMessage =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        handleMapMessage(message);
      } catch (error) {
        console.error('[InteractiveKakaoMap Web] Failed to parse message:', error);
      }
    };

    window.addEventListener('message', handleMessage);

    // Set a timeout to show error if map doesn't load within 10 seconds
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.error('[InteractiveKakaoMapWeb] Map load timeout - no ready message received');
        setHasError(true);
        setIsLoading(false);
      }
    }, 10000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [handleMapMessage, isLoading, setHasError, setIsLoading]);

  // Update map center when prop changes
  // Skip if circleCenter is provided - the circleCenter effect handles centering in that case
  useEffect(() => {
    if (isMapReady && iframeRef.current && !circleCenter) {
      if (!areCentersEqual(lastSetCenterRef.current, center)) {
        lastSetCenterRef.current = center;
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({
            type: 'setCenter',
            payload: { latitude: center.latitude, longitude: center.longitude },
          }),
          '*'
        );
      }
    }
  }, [center, isMapReady, circleCenter, lastSetCenterRef]);

  // Update pin move mode when prop changes
  useEffect(() => {
    if (isMapReady && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({
          type: 'setPinMoveEnabled',
          payload: { enabled: isPinMoveEnabled },
        }),
        '*'
      );
    }
  }, [isPinMoveEnabled, isMapReady]);

  // Update pin location when prop changes
  // Also center the map on the pin when there's no circle overlay
  useEffect(() => {
    if (isMapReady && iframeRef.current && pinLocation) {
      // Update pin marker position
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({
          type: 'updatePinLocation',
          payload: { latitude: pinLocation.latitude, longitude: pinLocation.longitude },
        }),
        '*'
      );

      // If no circle overlay, also center the map on the pin location
      if (!circleCenter) {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({
            type: 'setCenter',
            payload: { latitude: pinLocation.latitude, longitude: pinLocation.longitude },
          }),
          '*'
        );
        lastSetCenterRef.current = pinLocation;
      }
    }
  }, [pinLocation, isMapReady, circleCenter, lastSetCenterRef]);

  // Update circle center and radius together to prevent race conditions
  // This ensures the circle is properly centered before zoom adjustments
  useEffect(() => {
    if (isMapReady && iframeRef.current && circleCenter) {
      // First update the circle center
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({
          type: 'updateCircleCenter',
          payload: { latitude: circleCenter.latitude, longitude: circleCenter.longitude },
        }),
        '*'
      );

      // Then update radius and zoom level
      const radiusMeters = radiusKm ? radiusKm * 1000 : 0;
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({
          type: 'updateCircleRadius',
          payload: { radiusMeters },
        }),
        '*'
      );

      // Set appropriate zoom level and center on the circle location
      // Always center the map on circleCenter, with appropriate zoom for radius
      const zoomLevel = radiusKm ? getZoomLevelForRadius(radiusKm) : 4;
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({
          type: 'setMapLevelAndCenter',
          payload: {
            level: zoomLevel,
            latitude: circleCenter.latitude,
            longitude: circleCenter.longitude,
          },
        }),
        '*'
      );
      // Update lastSetCenterRef to prevent duplicate centering from the center effect
      lastSetCenterRef.current = circleCenter;
    }
  }, [radiusKm, isMapReady, circleCenter, lastSetCenterRef]);

  if (!KAKAO_JS_KEY) {
    console.error('[InteractiveKakaoMapWeb] KAKAO_JS_KEY is not set!');
    return (
      <View style={[styles.container, height != null && { height }]} testID={testID}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>지도 설정이 올바르지 않습니다</Text>
          <Text style={[styles.errorText, { fontSize: 12, marginTop: 8 }]}>
            EXPO_PUBLIC_KAKAO_JS_KEY가 설정되지 않았습니다
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, height != null && { height }]} testID={testID}>
      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>지도를 불러올 수 없습니다</Text>
          <Text style={[styles.errorText, { fontSize: 12, marginTop: 8 }]}>
            브라우저 콘솔을 확인해주세요
          </Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <iframe
            ref={iframeRef}
            src={blobUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="Kakao Map"
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.surface,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
});
