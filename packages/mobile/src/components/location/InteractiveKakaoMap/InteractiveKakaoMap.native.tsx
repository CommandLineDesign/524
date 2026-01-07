/**
 * Native implementation of InteractiveKakaoMap using React Native WebView.
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { borderRadius, colors, spacing } from '../../../theme';
import { KAKAO_JS_KEY, areCentersEqual, generateMapHtml, getZoomLevelForRadius } from './mapUtils';
import type { InteractiveKakaoMapProps, MapMessage } from './types';
import { useMapState } from './useMapState';

export function InteractiveKakaoMapNative({
  center,
  onCenterChange,
  isPinMoveEnabled = false,
  pinLocation,
  circleCenter,
  radiusKm,
  height,
  testID,
}: InteractiveKakaoMapProps) {
  const webViewRef = useRef<WebView>(null);

  const {
    isLoading,
    hasError,
    isMapReady,
    setIsLoading,
    setHasError,
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

  // Note: All dynamic props are updated via injectJavaScript, not by regenerating HTML
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally empty deps - refs capture initial values, updates happen via injectJavaScript
  const html = useMemo(
    () =>
      generateMapHtml({
        latitude: initialCenterRef.current.latitude,
        longitude: initialCenterRef.current.longitude,
        radiusKm: initialRadiusRef.current,
        isPinMoveEnabled: initialIsPinMoveEnabledRef.current,
        pinLocation: initialPinLocationRef.current,
        circleCenter: initialCircleCenterRef.current,
      }),
    []
  );

  // Update map center when prop changes (and map is ready)
  // Skip if circleCenter is provided - the circleCenter effect handles centering in that case
  useEffect(() => {
    if (isMapReady && webViewRef.current && !circleCenter) {
      if (!areCentersEqual(lastSetCenterRef.current, center)) {
        lastSetCenterRef.current = center;
        webViewRef.current.injectJavaScript(
          `window.setMapCenter(${center.latitude}, ${center.longitude}); true;`
        );
      }
    }
  }, [center, isMapReady, circleCenter, lastSetCenterRef]);

  // Update pin move mode when prop changes
  useEffect(() => {
    if (isMapReady && webViewRef.current) {
      webViewRef.current.injectJavaScript(`window.setPinMoveEnabled(${isPinMoveEnabled}); true;`);
    }
  }, [isPinMoveEnabled, isMapReady]);

  // Update pin location when prop changes
  // Also center the map on the pin when there's no circle overlay
  useEffect(() => {
    if (isMapReady && webViewRef.current && pinLocation) {
      // Update pin marker position
      webViewRef.current.injectJavaScript(
        `window.updatePinLocation(${pinLocation.latitude}, ${pinLocation.longitude}); true;`
      );

      // If no circle overlay, also center the map on the pin location
      if (!circleCenter) {
        webViewRef.current.injectJavaScript(
          `window.setMapCenter(${pinLocation.latitude}, ${pinLocation.longitude}); true;`
        );
        lastSetCenterRef.current = pinLocation;
      }
    }
  }, [pinLocation, isMapReady, circleCenter, lastSetCenterRef]);

  // Update circle center and radius together to prevent race conditions
  // This ensures the circle is properly centered before zoom adjustments
  useEffect(() => {
    if (isMapReady && webViewRef.current && circleCenter) {
      // First update the circle center
      webViewRef.current.injectJavaScript(
        `if (window.updateCircleCenter) window.updateCircleCenter(${circleCenter.latitude}, ${circleCenter.longitude}); true;`
      );

      // Then update radius
      const radiusMeters = radiusKm ? radiusKm * 1000 : 0;
      webViewRef.current.injectJavaScript(
        `if (window.updateCircleRadius) window.updateCircleRadius(${radiusMeters}); true;`
      );

      // Set appropriate zoom level and center on the circle location
      // Always center the map on circleCenter, with appropriate zoom for radius
      const zoomLevel = radiusKm ? getZoomLevelForRadius(radiusKm) : 4;
      webViewRef.current.injectJavaScript(
        `if (window.setMapLevelAndCenter) window.setMapLevelAndCenter(${zoomLevel}, ${circleCenter.latitude}, ${circleCenter.longitude}); true;`
      );
      // Update lastSetCenterRef to prevent duplicate centering from the center effect
      lastSetCenterRef.current = circleCenter;
    }
  }, [radiusKm, isMapReady, circleCenter, lastSetCenterRef]);

  // Handle messages from WebView
  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message: MapMessage = JSON.parse(event.nativeEvent.data);
        handleMapMessage(message);
      } catch (error) {
        console.error('[InteractiveKakaoMap Native] Failed to parse message:', error);
      }
    },
    [handleMapMessage]
  );

  if (!KAKAO_JS_KEY) {
    return (
      <View style={[styles.container, height != null && { height }]} testID={testID}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>지도 설정이 올바르지 않습니다</Text>
        </View>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={[styles.container, height != null && { height }]} testID={testID}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>지도를 불러올 수 없습니다</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, height != null && { height }]} testID={testID}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webView}
        onMessage={handleMessage}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        // Improve WebView performance
        cacheEnabled
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        // iOS specific
        allowsInlineMediaPlayback
        // Android specific
        mixedContentMode="compatibility"
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
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
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
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
