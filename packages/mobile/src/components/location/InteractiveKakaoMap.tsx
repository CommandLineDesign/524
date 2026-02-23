import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { borderRadius, colors, primitives, spacing } from '../../theme';

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

export interface MapCenter {
  latitude: number;
  longitude: number;
}

interface InteractiveKakaoMapProps {
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

interface MapMessage {
  type: 'ready' | 'centerChanged' | 'dragStart' | 'dragEnd' | 'error';
  payload?: {
    latitude?: number;
    longitude?: number;
    error?: string;
  };
}

const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY ?? '';

// Default to Seoul City Hall if no location provided
const DEFAULT_CENTER: MapCenter = {
  latitude: 37.5666,
  longitude: 126.9784,
};

// Calculate appropriate Kakao Map zoom level for a given radius in km
// Kakao Maps level: lower = more zoomed in, higher = more zoomed out
// Levels increased to ensure full radius circle is visible with padding
function getZoomLevelForRadius(radiusKm: number): number {
  if (radiusKm >= 25) return 10;
  if (radiusKm >= 15) return 9;
  if (radiusKm >= 10) return 8;
  if (radiusKm >= 5) return 7;
  if (radiusKm >= 2) return 5;
  return 4;
}

interface GenerateMapHtmlOptions {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  isPinMoveEnabled?: boolean;
  pinLocation?: MapCenter;
  circleCenter?: MapCenter;
}

function generateMapHtml(options: GenerateMapHtmlOptions): string {
  const {
    latitude,
    longitude,
    radiusKm,
    isPinMoveEnabled = false,
    pinLocation,
    circleCenter,
  } = options;

  // Determine where to show the pin (fixed location or follows center)
  const pinLat = pinLocation?.latitude ?? latitude;
  const pinLng = pinLocation?.longitude ?? longitude;

  // Determine where to center the circle
  const circleLat = circleCenter?.latitude ?? pinLat;
  const circleLng = circleCenter?.longitude ?? pinLng;

  // Always create circle (can be shown/hidden and resized dynamically)
  const initialRadius = radiusKm ? radiusKm * 1000 : 0;
  const circleCode = `
    var circleCenter = new kakao.maps.LatLng(${circleLat}, ${circleLng});
    var circle = new kakao.maps.Circle({
      center: circleCenter,
      radius: ${initialRadius},
      strokeWeight: 2,
      strokeColor: '${primitives.nearBlack}',
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
      fillColor: '${primitives.nearBlack}',
      fillOpacity: 0.1
    });
    ${radiusKm ? 'circle.setMap(map);' : '// Circle hidden initially'}

    // Function to update circle position (called from outside when needed)
    window.updateCircleCenter = function(lat, lng) {
      if (circle) {
        circle.setPosition(new kakao.maps.LatLng(lat, lng));
      }
    };

    // Function to update circle radius and visibility
    window.updateCircleRadius = function(radiusMeters) {
      if (circle) {
        if (radiusMeters > 0) {
          circle.setRadius(radiusMeters);
          circle.setMap(map);
        } else {
          circle.setMap(null);
        }
      }
    };

    // Function to set map level and center (for fitting circle in view)
    window.setMapLevelAndCenter = function(level, lat, lng) {
      if (map) {
        map.setLevel(level);
        map.setCenter(new kakao.maps.LatLng(lat, lng));
      }
    };
    `;

  // Pin marker code - show at fixed location when not in pin-move mode
  const pinMarkerCode =
    !isPinMoveEnabled && pinLocation
      ? `
    var pinMarkerPosition = new kakao.maps.LatLng(${pinLat}, ${pinLng});
    var pinMarkerContent = '<div class="fixed-pin"><div class="pin-icon"><div class="pin-head"></div><div class="pin-shadow"></div></div></div>';
    var pinMarker = new kakao.maps.CustomOverlay({
      position: pinMarkerPosition,
      content: pinMarkerContent,
      yAnchor: 1
    });
    pinMarker.setMap(map);

    // Function to update pin marker position
    window.updatePinMarker = function(lat, lng) {
      if (pinMarker) {
        pinMarker.setPosition(new kakao.maps.LatLng(lat, lng));
      }
    };
    `
      : '';

  // Only show center pin when in pin-move mode
  const centerPinDisplay = isPinMoveEnabled ? 'block' : 'none';

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

    /* Center pin overlay - shown when in pin-move mode */
    .center-pin {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -100%);
      z-index: 1000;
      pointer-events: none;
      display: ${centerPinDisplay};
    }
    .pin-icon {
      width: 40px;
      height: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .pin-head {
      width: 24px;
      height: 24px;
      background-color: ${primitives.nearBlack};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pin-head::after {
      content: '';
      width: 10px;
      height: 10px;
      background-color: ${primitives.lightest};
      border-radius: 50%;
      transform: rotate(45deg);
    }
    .pin-shadow {
      width: 14px;
      height: 4px;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      margin-top: 2px;
    }

    /* Fixed pin marker - shown when NOT in pin-move mode */
    .fixed-pin {
      transform: translate(-50%, 0);
    }
    .fixed-pin .pin-icon {
      width: 40px;
      height: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .fixed-pin .pin-head {
      width: 24px;
      height: 24px;
      background-color: ${primitives.nearBlack};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fixed-pin .pin-head::after {
      content: '';
      width: 10px;
      height: 10px;
      background-color: ${primitives.lightest};
      border-radius: 50%;
      transform: rotate(45deg);
    }
    .fixed-pin .pin-shadow {
      width: 14px;
      height: 4px;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="center-pin">
    <div class="pin-icon">
      <div class="pin-head"></div>
      <div class="pin-shadow"></div>
    </div>
  </div>

  <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false"></script>
  <script>
    var map;
    var isDragging = false;
    var dragEndTimer = null;
    var isPinMoveEnabled = ${isPinMoveEnabled};

    function sendMessage(type, payload) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload || {} }));
      }
    }

    function getCenterCoords() {
      var center = map.getCenter();
      return {
        latitude: center.getLat(),
        longitude: center.getLng()
      };
    }

    kakao.maps.load(function() {
      try {
        var container = document.getElementById('map');
        var options = {
          center: new kakao.maps.LatLng(${latitude}, ${longitude}),
          level: 4
        };
        map = new kakao.maps.Map(container, options);

        ${circleCode}
        ${pinMarkerCode}

        // Handle drag start
        kakao.maps.event.addListener(map, 'dragstart', function() {
          isDragging = true;
          if (dragEndTimer) {
            clearTimeout(dragEndTimer);
            dragEndTimer = null;
          }
          if (isPinMoveEnabled) {
            sendMessage('dragStart');
          }
        });

        // Handle drag end - debounce to avoid rapid fire
        // Only send message if pin move is enabled
        kakao.maps.event.addListener(map, 'dragend', function() {
          isDragging = false;
          if (isPinMoveEnabled) {
            if (dragEndTimer) {
              clearTimeout(dragEndTimer);
            }
            dragEndTimer = setTimeout(function() {
              sendMessage('dragEnd', getCenterCoords());
            }, 200);
          }
        });

        // Handle zoom changes - only send if pin move is enabled
        kakao.maps.event.addListener(map, 'zoom_changed', function() {
          if (isPinMoveEnabled && !isDragging) {
            if (dragEndTimer) {
              clearTimeout(dragEndTimer);
            }
            dragEndTimer = setTimeout(function() {
              sendMessage('centerChanged', getCenterCoords());
            }, 200);
          }
        });

        sendMessage('ready', getCenterCoords());
      } catch (error) {
        sendMessage('error', { error: error.message || 'Failed to initialize map' });
      }
    });

    // Listen for messages from parent (for web iframe)
    window.addEventListener('message', function(event) {
      try {
        var message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (message.type === 'setCenter' && message.payload && map) {
          var newCenter = new kakao.maps.LatLng(message.payload.latitude, message.payload.longitude);
          map.setCenter(newCenter);
        } else if (message.type === 'setPinMoveEnabled' && typeof message.payload.enabled === 'boolean') {
          isPinMoveEnabled = message.payload.enabled;
          // Toggle center pin visibility
          var centerPin = document.querySelector('.center-pin');
          if (centerPin) {
            centerPin.style.display = isPinMoveEnabled ? 'block' : 'none';
          }
        } else if (message.type === 'updatePinLocation' && message.payload && map) {
          if (window.updatePinMarker) {
            window.updatePinMarker(message.payload.latitude, message.payload.longitude);
          }
        } else if (message.type === 'updateCircleCenter' && message.payload && map) {
          if (window.updateCircleCenter) {
            window.updateCircleCenter(message.payload.latitude, message.payload.longitude);
          }
        } else if (message.type === 'updateCircleRadius' && message.payload && map) {
          if (window.updateCircleRadius) {
            window.updateCircleRadius(message.payload.radiusMeters);
          }
        } else if (message.type === 'setMapLevelAndCenter' && message.payload && map) {
          if (window.setMapLevelAndCenter) {
            window.setMapLevelAndCenter(message.payload.level, message.payload.latitude, message.payload.longitude);
          }
        }
      } catch (e) {
        console.error('[KakaoMap] Error handling parent message:', e);
      }
    });

    // Function to be called from React Native
    window.setMapCenter = function(lat, lng) {
      if (map) {
        var newCenter = new kakao.maps.LatLng(lat, lng);
        map.setCenter(newCenter);
      }
    };

    window.setMapLevel = function(level) {
      if (map) {
        map.setLevel(level);
      }
    };

    // Function to toggle pin move mode from React Native
    window.setPinMoveEnabled = function(enabled) {
      isPinMoveEnabled = enabled;
      var centerPin = document.querySelector('.center-pin');
      if (centerPin) {
        centerPin.style.display = enabled ? 'block' : 'none';
      }
    };

    // Function to update pin marker position from React Native
    window.updatePinLocation = function(lat, lng) {
      if (window.updatePinMarker) {
        window.updatePinMarker(lat, lng);
      }
    };
  </script>
</body>
</html>
`;
}

// Web-specific implementation using iframe
function InteractiveKakaoMapWeb({
  center,
  onCenterChange,
  isPinMoveEnabled = false,
  pinLocation,
  circleCenter,
  radiusKm,
  height,
  testID,
}: InteractiveKakaoMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastSetCenterRef = useRef<MapCenter | null>(null);

  const effectiveCenter = useMemo(
    () => ({
      latitude: center.latitude || DEFAULT_CENTER.latitude,
      longitude: center.longitude || DEFAULT_CENTER.longitude,
    }),
    [center.latitude, center.longitude]
  );

  // Only regenerate HTML on initial mount or when structural props change (not center)
  // This prevents zoom reset issues
  const initialCenterRef = useRef(effectiveCenter);

  // Store initial radiusKm to avoid regenerating HTML on radius changes
  const initialRadiusRef = useRef(radiusKm);

  // Store initial circleCenter to avoid regenerating HTML on circle center changes
  const initialCircleCenterRef = useRef(circleCenter);
  // Store initial pinLocation to avoid regenerating HTML on pin location changes
  const initialPinLocationRef = useRef(pinLocation);
  // Store initial isPinMoveEnabled
  const initialIsPinMoveEnabledRef = useRef(isPinMoveEnabled);

  // Generate HTML with window.parent.postMessage for web
  // Note: We use initial values and update everything dynamically via postMessage to avoid iframe reloads
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
    const finalHtml = replacedHtml.replace(
      /if \(window\.ReactNativeWebView\)/g,
      'if (window.parent)'
    );
    return finalHtml;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            console.error('[InteractiveKakaoMap Web] Map error:', message.payload?.error);
            setHasError(true);
            setIsLoading(false);
            break;
        }
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
  }, [onCenterChange, isLoading]);

  // Update map center when prop changes
  // Skip if circleCenter is provided - the circleCenter effect handles centering in that case
  useEffect(() => {
    if (isMapReady && iframeRef.current && !circleCenter) {
      const lastCenter = lastSetCenterRef.current;
      if (
        !lastCenter ||
        Math.abs(lastCenter.latitude - center.latitude) > 0.00001 ||
        Math.abs(lastCenter.longitude - center.longitude) > 0.00001
      ) {
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
  }, [center, isMapReady, circleCenter]);

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
  }, [pinLocation, isMapReady, circleCenter]);

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
  }, [radiusKm, isMapReady, circleCenter]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setIsMapReady(false);
  }, []);

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

// Native implementation using WebView
function InteractiveKakaoMapNative({
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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Track the last center we set programmatically to avoid feedback loops
  const lastSetCenterRef = useRef<MapCenter | null>(null);

  const effectiveCenter = useMemo(
    () => ({
      latitude: center.latitude || DEFAULT_CENTER.latitude,
      longitude: center.longitude || DEFAULT_CENTER.longitude,
    }),
    [center.latitude, center.longitude]
  );

  // Only regenerate HTML on initial mount - we update everything dynamically via injectJavaScript
  // This prevents WebView reloads which would reset the map state
  const initialCenterRef = useRef(effectiveCenter);
  const initialRadiusRef = useRef(radiusKm);
  const initialCircleCenterRef = useRef(circleCenter);
  const initialPinLocationRef = useRef(pinLocation);
  const initialIsPinMoveEnabledRef = useRef(isPinMoveEnabled);

  // Note: All dynamic props are updated via injectJavaScript, not by regenerating HTML
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Update map center when prop changes (and map is ready)
  // Skip if circleCenter is provided - the circleCenter effect handles centering in that case
  useEffect(() => {
    if (isMapReady && webViewRef.current && !circleCenter) {
      const lastCenter = lastSetCenterRef.current;
      // Only update if the center actually changed from an external source
      if (
        !lastCenter ||
        Math.abs(lastCenter.latitude - center.latitude) > 0.00001 ||
        Math.abs(lastCenter.longitude - center.longitude) > 0.00001
      ) {
        lastSetCenterRef.current = center;
        webViewRef.current.injectJavaScript(
          `window.setMapCenter(${center.latitude}, ${center.longitude}); true;`
        );
      }
    }
  }, [center, isMapReady, circleCenter]);

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
  }, [pinLocation, isMapReady, circleCenter]);

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
  }, [radiusKm, isMapReady, circleCenter]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message: MapMessage = JSON.parse(event.nativeEvent.data);

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
      } catch (error) {
        console.error('[InteractiveKakaoMap] Failed to parse message:', error);
      }
    },
    [onCenterChange]
  );

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setIsMapReady(false);
  }, []);

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

// Main export: choose implementation based on platform
export function InteractiveKakaoMap(props: InteractiveKakaoMapProps) {
  if (Platform.OS === 'web') {
    return <InteractiveKakaoMapWeb {...props} />;
  }
  return <InteractiveKakaoMapNative {...props} />;
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
