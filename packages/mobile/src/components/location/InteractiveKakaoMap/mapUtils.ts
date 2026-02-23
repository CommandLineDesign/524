/**
 * Shared utilities for InteractiveKakaoMap web and native implementations.
 */

import { primitives } from '../../../theme';
import type { GenerateMapHtmlOptions, MapCenter, MapMessage } from './types';

export const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY ?? '';

// Default to Seoul City Hall if no location provided
export const DEFAULT_CENTER: MapCenter = {
  latitude: 37.5666,
  longitude: 126.9784,
};

// Coordinate comparison tolerance (approximately 1 meter)
const COORD_TOLERANCE = 0.00001;

/**
 * Calculate appropriate Kakao Map zoom level for a given radius in km.
 * Kakao Maps level: lower = more zoomed in, higher = more zoomed out.
 * Levels increased to ensure full radius circle is visible with padding.
 */
export function getZoomLevelForRadius(radiusKm: number): number {
  if (radiusKm >= 25) return 10;
  if (radiusKm >= 15) return 9;
  if (radiusKm >= 10) return 8;
  if (radiusKm >= 5) return 7;
  if (radiusKm >= 2) return 5;
  return 4;
}

/**
 * Check if two map centers are effectively equal (within tolerance).
 */
export function areCentersEqual(a: MapCenter | null, b: MapCenter): boolean {
  if (!a) return false;
  return (
    Math.abs(a.latitude - b.latitude) <= COORD_TOLERANCE &&
    Math.abs(a.longitude - b.longitude) <= COORD_TOLERANCE
  );
}

/**
 * Parse a map message from string or object format.
 */
export function parseMapMessage(data: string | MapMessage): MapMessage | null {
  try {
    if (typeof data === 'string') {
      return JSON.parse(data) as MapMessage;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Generate the HTML content for the Kakao Map WebView/iframe.
 */
export function generateMapHtml(options: GenerateMapHtmlOptions): string {
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
  <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
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
