import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { useDebounce } from '../../hooks/useDebounce';
import { reverseGeocodeLocation } from '../../services/kakaoService';
import { borderRadius, colors, spacing, typography } from '../../theme';
import type { KeywordSearchResult, MapAddressPickerResult } from '../../types/kakao';
import { AddressSearchBar } from './AddressSearchBar';
import { InteractiveKakaoMap, type MapCenter } from './InteractiveKakaoMap/index';

export interface MapAddressPickerProps {
  /** Initial location to center the map (defaults to Seoul City Hall or user's location) */
  initialLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    detailAddress?: string;
  };
  /** Callback when user confirms the selected location */
  onLocationConfirm: (result: MapAddressPickerResult) => void;
  /** Optional callback for cancel/close */
  onCancel?: () => void;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Label for confirm button */
  confirmButtonLabel?: string;
  /** Whether to show the radius overlay (for artist onboarding) */
  showRadiusOverlay?: boolean;
  /** Service radius in km (only used if showRadiusOverlay is true) */
  radiusKm?: number;
  /** Height of the map section (if not provided, map fills available space) */
  mapHeight?: number;
  /** Placeholder for detail address input */
  detailPlaceholder?: string;
  /** Test ID for testing */
  testID?: string;
}

// Default to Seoul City Hall
const DEFAULT_CENTER: MapCenter = {
  latitude: 37.5666,
  longitude: 126.9784,
};

const REVERSE_GEOCODE_DEBOUNCE = 200;

export function MapAddressPicker({
  initialLocation,
  onLocationConfirm,
  onCancel,
  searchPlaceholder,
  confirmButtonLabel = '이 위치로 설정',
  showRadiusOverlay = false,
  radiusKm,
  mapHeight,
  detailPlaceholder = '동/호수 입력 (예: 101동 1403호)',
  testID,
}: MapAddressPickerProps) {
  // Location state - mapCenter is the visual center of the map
  const [mapCenter, setMapCenter] = useState<MapCenter>(() => {
    if (initialLocation?.latitude && initialLocation.longitude) {
      return {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
      };
    }
    return DEFAULT_CENTER;
  });

  // Selected location - the pinned location that will be confirmed
  const [selectedLocation, setSelectedLocation] = useState<MapCenter>(() => {
    if (initialLocation?.latitude && initialLocation.longitude) {
      return {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
      };
    }
    return DEFAULT_CENTER;
  });

  // Pin move mode - when true, moving the map updates the selected location
  const [isPinMoveMode, setIsPinMoveMode] = useState(false);

  const [currentAddress, setCurrentAddress] = useState<{
    address: string;
    roadAddress?: string;
  } | null>(() => {
    if (initialLocation?.address) {
      return { address: initialLocation.address };
    }
    return null;
  });

  // Detail address state
  const [detailAddress, setDetailAddress] = useState(initialLocation?.detailAddress ?? '');

  // Loading states
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!initialLocation);

  // Ref to track if initialization has been attempted
  const hasInitializedRef = useRef(false);

  // GPS hook
  const { getCurrentLocation, isLoading: isGettingGPS, error: gpsError } = useCurrentLocation();

  // Debounce map center for reverse geocoding (only used in pin move mode)
  const debouncedCenter = useDebounce(mapCenter, REVERSE_GEOCODE_DEBOUNCE);

  // Get user's current location on mount if no initial location
  useEffect(() => {
    const initializeLocation = async () => {
      // Only initialize once
      if (hasInitializedRef.current) {
        return;
      }
      hasInitializedRef.current = true;

      if (initialLocation) {
        setIsInitializing(false);
        return;
      }

      const location = await getCurrentLocation();
      if (location) {
        setMapCenter(location);
        setSelectedLocation(location);
      }
      setIsInitializing(false);
    };

    initializeLocation();
  }, [initialLocation, getCurrentLocation]);

  // Reverse geocode when map center changes - ONLY in pin move mode
  useEffect(() => {
    const performReverseGeocode = async () => {
      // Only reverse geocode in pin move mode
      if (!isPinMoveMode) {
        return;
      }

      if (!debouncedCenter.latitude || !debouncedCenter.longitude) {
        return;
      }

      setIsReverseGeocoding(true);

      try {
        const result = await reverseGeocodeLocation(
          debouncedCenter.latitude,
          debouncedCenter.longitude
        );

        // Update selected location to match map center when in pin move mode
        setSelectedLocation({
          latitude: debouncedCenter.latitude,
          longitude: debouncedCenter.longitude,
        });

        if (result) {
          setCurrentAddress({
            address: result.address,
            roadAddress: result.roadAddress,
          });
        } else {
          // If reverse geocode fails, show coordinates as fallback
          setCurrentAddress({
            address: `${debouncedCenter.latitude.toFixed(6)}, ${debouncedCenter.longitude.toFixed(6)}`,
          });
        }
      } catch {
        setCurrentAddress({
          address: `${debouncedCenter.latitude.toFixed(6)}, ${debouncedCenter.longitude.toFixed(6)}`,
        });
      } finally {
        setIsReverseGeocoding(false);
      }
    };

    performReverseGeocode();
  }, [debouncedCenter.latitude, debouncedCenter.longitude, isPinMoveMode]);

  // Handle search result selection - directly sets the pin location
  const handleSearchResultSelect = useCallback((result: KeywordSearchResult) => {
    const newLocation = {
      latitude: result.latitude,
      longitude: result.longitude,
    };
    setMapCenter(newLocation);
    setSelectedLocation(newLocation);
    setCurrentAddress({
      address: result.addressName,
      roadAddress: result.roadAddressName,
    });
    // Exit pin move mode since user explicitly selected a location
    setIsPinMoveMode(false);
  }, []);

  // Handle map center change (from dragging)
  const handleMapCenterChange = useCallback((newCenter: MapCenter) => {
    setMapCenter(newCenter);
  }, []);

  // Handle "Use my location" button - directly sets the pin location
  const handleUseMyLocation = useCallback(async () => {
    const location = await getCurrentLocation();
    if (location) {
      setMapCenter(location);
      setSelectedLocation(location);
      // Exit pin move mode since user explicitly selected a location
      setIsPinMoveMode(false);

      // Reverse geocode the GPS location
      setIsReverseGeocoding(true);
      try {
        const result = await reverseGeocodeLocation(location.latitude, location.longitude);
        if (result) {
          setCurrentAddress({
            address: result.address,
            roadAddress: result.roadAddress,
          });
        } else {
          setCurrentAddress({
            address: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
          });
        }
      } catch {
        setCurrentAddress({
          address: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
        });
      } finally {
        setIsReverseGeocoding(false);
      }
    }
  }, [getCurrentLocation]);

  // Handle confirm button - uses selectedLocation, not mapCenter
  const handleConfirm = useCallback(() => {
    if (!currentAddress) {
      return;
    }

    onLocationConfirm({
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      address: currentAddress.address,
      roadAddress: currentAddress.roadAddress,
      detailAddress: detailAddress || undefined,
    });
  }, [selectedLocation, currentAddress, detailAddress, onLocationConfirm]);

  // Handle pin move mode toggle
  const handleTogglePinMoveMode = useCallback(() => {
    setIsPinMoveMode((prev) => !prev);
  }, []);

  // Dismiss keyboard when tapping outside search
  // MUST be before early return to maintain hook order
  const handleDismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const canConfirm = currentAddress !== null && !isReverseGeocoding;

  if (isInitializing) {
    return (
      <View style={[styles.container, styles.loadingContainer]} testID={testID}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>위치를 가져오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      {/* Map - fullscreen background */}
      <View style={styles.mapContainer}>
        <InteractiveKakaoMap
          center={mapCenter}
          onCenterChange={handleMapCenterChange}
          isPinMoveEnabled={isPinMoveMode}
          pinLocation={isPinMoveMode ? undefined : selectedLocation}
          circleCenter={showRadiusOverlay ? selectedLocation : undefined}
          radiusKm={showRadiusOverlay ? radiusKm : undefined}
          height={mapHeight}
          testID={`${testID}-map`}
        />
      </View>

      {/* Search Bar - overlayed at top */}
      <View style={styles.searchContainer}>
        <AddressSearchBar
          onResultSelect={handleSearchResultSelect}
          currentLocation={mapCenter}
          placeholder={searchPlaceholder}
          testID={`${testID}-search`}
        />
      </View>

      {/* Bottom Panel - overlayed at bottom */}
      <Pressable style={styles.bottomPanel} onPress={handleDismissKeyboard}>
        {/* GPS and Pin Move Toggle Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.gpsButton}
            onPress={handleUseMyLocation}
            disabled={isGettingGPS}
            accessibilityLabel="현재 위치 사용"
          >
            {isGettingGPS ? <ActivityIndicator size="small" color={colors.primary} /> : <GPSIcon />}
            <Text style={styles.gpsButtonText}>현재 위치</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pinMoveButton, isPinMoveMode && styles.pinMoveButtonActive]}
            onPress={handleTogglePinMoveMode}
            accessibilityLabel={isPinMoveMode ? '위치 선택 완료' : '위치 조정'}
          >
            <PinMoveIcon active={isPinMoveMode} />
            <Text
              style={[styles.pinMoveButtonText, isPinMoveMode && styles.pinMoveButtonTextActive]}
            >
              {isPinMoveMode ? '선택 완료' : '위치 조정'}
            </Text>
          </TouchableOpacity>
        </View>

        {gpsError && <Text style={styles.gpsErrorText}>{gpsError}</Text>}

        {/* Selected Address Display */}
        <View style={styles.addressDisplay}>
          {isReverseGeocoding ? (
            <View style={styles.addressLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.addressLoadingText}>주소 확인 중...</Text>
            </View>
          ) : currentAddress ? (
            <View style={styles.addressContent}>
              <Text style={styles.addressLabel}>선택한 위치</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {currentAddress.roadAddress || currentAddress.address}
              </Text>
              {currentAddress.roadAddress &&
                currentAddress.address !== currentAddress.roadAddress && (
                  <Text style={styles.addressSubtext} numberOfLines={1}>
                    {currentAddress.address}
                  </Text>
                )}
            </View>
          ) : (
            <Text style={styles.addressPlaceholder}>지도에서 위치를 선택해주세요</Text>
          )}
        </View>

        {/* Detail Address Input */}
        {currentAddress && (
          <View style={styles.detailInputContainer}>
            <Text style={styles.detailLabel}>상세 주소</Text>
            <TextInput
              style={styles.detailInput}
              placeholder={detailPlaceholder}
              placeholderTextColor={colors.textSecondary}
              value={detailAddress}
              onChangeText={setDetailAddress}
              testID={testID ? `${testID}-detail-input` : undefined}
            />
          </View>
        )}

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!canConfirm}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canConfirm }}
        >
          <Text style={[styles.confirmButtonText, !canConfirm && styles.confirmButtonTextDisabled]}>
            {confirmButtonLabel}
          </Text>
        </TouchableOpacity>
      </Pressable>
    </View>
  );
}

function GPSIcon() {
  return (
    <View style={styles.gpsIcon}>
      <View style={styles.gpsOuter} />
      <View style={styles.gpsInner} />
      <View style={[styles.gpsCrosshair, styles.gpsCrosshairHorizontal]} />
      <View style={[styles.gpsCrosshair, styles.gpsCrosshairVertical]} />
    </View>
  );
}

function PinMoveIcon({ active }: { active: boolean }) {
  const color = active ? colors.background : colors.primary;
  return (
    <View style={styles.pinMoveIcon}>
      {/* Crosshair/target icon */}
      <View style={[styles.pinMoveIconOuter, { borderColor: color }]} />
      <View style={[styles.pinMoveIconInner, { backgroundColor: color }]} />
      <View
        style={[
          styles.pinMoveIconCrosshair,
          styles.pinMoveIconCrosshairH,
          { backgroundColor: color },
        ]}
      />
      <View
        style={[
          styles.pinMoveIconCrosshair,
          styles.pinMoveIconCrosshairV,
          { backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    zIndex: 20,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    gap: spacing.md,
    zIndex: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    // Shadow for visibility against map
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  gpsButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  pinMoveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    // Shadow for visibility against map
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  pinMoveButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pinMoveButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  pinMoveButtonTextActive: {
    color: colors.background,
  },
  gpsErrorText: {
    fontSize: 12,
    color: colors.error,
  },
  addressDisplay: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 70,
    justifyContent: 'center',
    // Shadow for visibility against map
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  addressLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addressLoadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addressContent: {
    gap: 4,
  },
  addressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  addressSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  addressPlaceholder: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  detailInputContainer: {
    gap: spacing.md,
  },
  detailLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.text,
  },
  detailInput: {
    height: spacing.inputHeight,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
    backgroundColor: colors.background,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    // Shadow for visibility against map
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  confirmButtonTextDisabled: {
    color: colors.textSecondary,
  },
  // GPS Icon styles
  gpsIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  gpsInner: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  gpsCrosshair: {
    position: 'absolute',
    backgroundColor: colors.primary,
  },
  gpsCrosshairHorizontal: {
    width: 20,
    height: 2,
  },
  gpsCrosshairVertical: {
    width: 2,
    height: 20,
  },
  // Pin Move Icon styles
  pinMoveIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinMoveIconOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  pinMoveIconInner: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  pinMoveIconCrosshair: {
    position: 'absolute',
  },
  pinMoveIconCrosshairH: {
    width: 20,
    height: 2,
  },
  pinMoveIconCrosshairV: {
    width: 2,
    height: 20,
  },
});
