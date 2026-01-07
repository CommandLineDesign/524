import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { borderRadius, colors, spacing } from '../../theme';
import type { DaumPostcodeResult } from '../../types/kakao';

export interface DaumPostcodeSearchProps {
  onAddressSelected: (address: DaumPostcodeResult) => void;
  onClose?: () => void;
  style?: ViewStyle;
  testID?: string;
}

const DAUM_POSTCODE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #layer { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="layer"></div>
  <script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
  <script>
    new daum.Postcode({
      oncomplete: function(data) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      },
      onclose: function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ _closed: true }));
      },
      width: '100%',
      height: '100%'
    }).embed(document.getElementById('layer'));
  </script>
</body>
</html>
`;

// Web-specific component using iframe
function DaumPostcodeSearchWeb({
  onAddressSelected,
  onClose,
  style,
  testID,
}: DaumPostcodeSearchProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (data._closed) {
          onClose?.();
          return;
        }

        if (data.address || data.roadAddress) {
          onAddressSelected(data as DaumPostcodeResult);
        }
      } catch {
        // Ignore parse errors from unrelated messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAddressSelected, onClose]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const htmlContent = DAUM_POSTCODE_HTML.replace(
    'window.ReactNativeWebView.postMessage',
    'window.parent.postMessage'
  );

  const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;

  return (
    <View style={[styles.container, style]} testID={testID}>
      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>주소 검색을 불러올 수 없습니다</Text>
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
          <iframe
            ref={iframeRef}
            src={dataUri}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: colors.background,
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="Daum Postcode Search"
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>로딩 중...</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

// Native (iOS/Android) component using WebView
function DaumPostcodeSearchNative({
  onAddressSelected,
  onClose,
  style,
  testID,
}: DaumPostcodeSearchProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        // Handle close event from postcode widget
        if (data._closed) {
          onClose?.();
          return;
        }

        // Handle address selection
        onAddressSelected(data as DaumPostcodeResult);
      } catch {
        // Ignore parse errors from unrelated messages
      }
    },
    [onAddressSelected, onClose]
  );

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  return (
    <View style={[styles.container, style]} testID={testID}>
      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>주소 검색을 불러올 수 없습니다</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <WebView
            ref={webViewRef}
            source={{ html: DAUM_POSTCODE_HTML }}
            onMessage={handleMessage}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            style={styles.webView}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
            mixedContentMode="compatibility"
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>로딩 중...</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

// Main export: choose implementation based on platform
export function DaumPostcodeSearch(props: DaumPostcodeSearchProps) {
  if (Platform.OS === 'web') {
    return <DaumPostcodeSearchWeb {...props} />;
  }
  return <DaumPostcodeSearchNative {...props} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
});
