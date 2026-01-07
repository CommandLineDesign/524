import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { borderRadius, colors, spacing } from '../../theme';

export interface KakaoMapViewProps {
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Optional address label to show on marker */
  address?: string;
  /** Optional service radius in kilometers to show as circle overlay */
  radiusKm?: number;
  /** Height of the map view in pixels (default: 200) */
  height?: number;
  /** Whether the map is interactive (pan/zoom enabled) */
  interactive?: boolean;
}

const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY ?? '';

/**
 * Generates the HTML content for the Kakao Map WebView
 */
function generateMapHtml(
  latitude: number,
  longitude: number,
  radiusKm?: number,
  interactive?: boolean
): string {
  // Calculate appropriate zoom level based on radius
  // Larger radius = lower zoom level (more zoomed out)
  let zoomLevel = 5; // Default for ~1-2km visibility
  if (radiusKm) {
    if (radiusKm >= 20) zoomLevel = 8;
    else if (radiusKm >= 10) zoomLevel = 7;
    else if (radiusKm >= 5) zoomLevel = 6;
    else if (radiusKm >= 2) zoomLevel = 5;
    else zoomLevel = 4;
  }

  const circleCode = radiusKm
    ? `
    var circle = new kakao.maps.Circle({
      center: new kakao.maps.LatLng(${latitude}, ${longitude}),
      radius: ${radiusKm * 1000},
      strokeWeight: 2,
      strokeColor: '#19191b',
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
      fillColor: '#19191b',
      fillOpacity: 0.1
    });
    circle.setMap(map);
    `
    : '';

  const interactiveOptions = interactive
    ? ''
    : `
    map.setDraggable(false);
    map.setZoomable(false);
    `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false"></script>
  <script>
    kakao.maps.load(function() {
      var container = document.getElementById('map');
      var options = {
        center: new kakao.maps.LatLng(${latitude}, ${longitude}),
        level: ${zoomLevel}
      };
      var map = new kakao.maps.Map(container, options);

      // Add marker
      var marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(${latitude}, ${longitude})
      });
      marker.setMap(map);

      ${circleCode}
      ${interactiveOptions}

      // Notify React Native that map is ready
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
    });
  </script>
</body>
</html>
`;
}

export function KakaoMapView({
  latitude,
  longitude,
  radiusKm,
  height = 200,
  interactive = false,
}: KakaoMapViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const html = useMemo(
    () => generateMapHtml(latitude, longitude, radiusKm, interactive),
    [latitude, longitude, radiusKm, interactive]
  );

  // Don't render if no JS key is configured
  if (!KAKAO_JS_KEY) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Map configuration missing</Text>
        </View>
      </View>
    );
  }

  // Don't render if coordinates are invalid
  if (!latitude || !longitude || latitude === 0 || longitude === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>주소를 선택하면 지도가 표시됩니다</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>지도를 불러올 수 없습니다</Text>
          <TouchableOpacity
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <WebView
            source={{ html }}
            style={styles.webView}
            onLoadEnd={() => setIsLoading(false)}
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
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
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
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
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
