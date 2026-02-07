import { type LocationData, type LocationDataWithAddress } from '@524/shared';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import type { KeywordSearchResult } from '../../types/kakao';
import { AddressSearchBar } from './AddressSearchBar';
import { InteractiveKakaoMap, type MapCenter } from './InteractiveKakaoMap/index';

// Re-export types from shared for backward compatibility
export type { LocationData, LocationDataWithAddress } from '@524/shared';

/** Radius option configuration */
export interface RadiusOption {
  /** Radius value in kilometers */
  value: number;
  /** Display label (e.g., "5 km") */
  label: string;
}

export interface LocationPickerProps {
  /** Current location value */
  location: LocationData;
  /** Callback when location changes (real-time) - always includes address */
  onLocationChange: (location: LocationDataWithAddress) => void;
  /** Whether to show the radius selector (default: false) */
  showRadiusSelector?: boolean;
  /** Service radius in km (only used if showRadiusSelector is true) */
  radiusKm?: number;
  /** Callback when radius changes */
  onRadiusChange?: (radiusKm: number) => void;
  /** Placeholder for search bar */
  searchPlaceholder?: string;
  /** Custom radius options (default: 5, 10, 15, 25 km) */
  radiusOptions?: RadiusOption[];
  /** Current detail address (unit/apt number) */
  detailAddress?: string;
  /** Callback when detail address changes */
  onDetailAddressChange?: (detail: string) => void;
  /** Placeholder for detail address input */
  detailPlaceholder?: string;
  /** Test ID */
  testID?: string;
}

const DEFAULT_RADIUS_OPTIONS: RadiusOption[] = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 15, label: '15 km' },
  { value: 25, label: '25 km' },
];

// Default to Seoul City Hall
const DEFAULT_CENTER: MapCenter = {
  latitude: 37.5666,
  longitude: 126.9784,
};

const REVERSE_GEOCODE_DEBOUNCE = 200;

export function LocationPicker({
  location,
  onLocationChange,
  showRadiusSelector = false,
  radiusKm = 0,
  onRadiusChange,
  searchPlaceholder = '주소 또는 장소 검색',
  radiusOptions = DEFAULT_RADIUS_OPTIONS,
  detailAddress = '',
  onDetailAddressChange,
  detailPlaceholder = '동/호수 입력 (예: 101동 1403호)',
  testID,
}: LocationPickerProps) {
  const hasValidCoordinates = location.latitude !== 0 && location.longitude !== 0;

  // Map center state - the visual center of the map
  const [mapCenter, setMapCenter] = useState<MapCenter>(() => {
    if (hasValidCoordinates) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
      };
    }
    return DEFAULT_CENTER;
  });

  // Selected location - the pinned location for the service area
  const [selectedLocation, setSelectedLocation] = useState<MapCenter>(() => {
    if (hasValidCoordinates) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
      };
    }
    return DEFAULT_CENTER;
  });

  // Pin move mode - when true, moving the map updates the selected location
  const [isPinMoveMode, setIsPinMoveMode] = useState(false);

  // Address state
  const [currentAddress, setCurrentAddress] = useState<{
    address: string;
    roadAddress?: string;
  } | null>(() => {
    if (location.address && location.address.length > 0) {
      return { address: location.address };
    }
    return null;
  });

  // Loading states
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!hasValidCoordinates);

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

      if (hasValidCoordinates) {
        setIsInitializing(false);
        return;
      }

      const gpsLocation = await getCurrentLocation();
      if (gpsLocation) {
        setMapCenter(gpsLocation);
        setSelectedLocation(gpsLocation);
      }
      setIsInitializing(false);
    };

    initializeLocation();
  }, [hasValidCoordinates, getCurrentLocation]);

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

          // Update parent with new location
          onLocationChange({
            latitude: debouncedCenter.latitude,
            longitude: debouncedCenter.longitude,
            address: result.roadAddress || result.address,
          });
        } else {
          // If reverse geocode fails, show coordinates as fallback
          const fallbackAddress = `${debouncedCenter.latitude.toFixed(6)}, ${debouncedCenter.longitude.toFixed(6)}`;
          setCurrentAddress({ address: fallbackAddress });
          onLocationChange({
            latitude: debouncedCenter.latitude,
            longitude: debouncedCenter.longitude,
            address: fallbackAddress,
          });
        }
      } catch {
        const fallbackAddress = `${debouncedCenter.latitude.toFixed(6)}, ${debouncedCenter.longitude.toFixed(6)}`;
        setCurrentAddress({ address: fallbackAddress });
        onLocationChange({
          latitude: debouncedCenter.latitude,
          longitude: debouncedCenter.longitude,
          address: fallbackAddress,
        });
      } finally {
        setIsReverseGeocoding(false);
      }
    };

    performReverseGeocode();
  }, [debouncedCenter.latitude, debouncedCenter.longitude, isPinMoveMode, onLocationChange]);

  // Handle search result selection - directly sets the pin location
  const handleSearchResultSelect = useCallback(
    (result: KeywordSearchResult) => {
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
      // Update parent
      onLocationChange({
        ...newLocation,
        address: result.roadAddressName || result.addressName,
      });
    },
    [onLocationChange]
  );

  // Handle map center change (from dragging)
  const handleMapCenterChange = useCallback((newCenter: MapCenter) => {
    setMapCenter(newCenter);
  }, []);

  // Handle "Use my location" button - directly sets the pin location
  const handleUseMyLocation = useCallback(async () => {
    const gpsLocation = await getCurrentLocation();
    if (gpsLocation) {
      setMapCenter(gpsLocation);
      setSelectedLocation(gpsLocation);
      // Exit pin move mode since user explicitly selected a location
      setIsPinMoveMode(false);

      // Reverse geocode the GPS location
      setIsReverseGeocoding(true);
      try {
        const result = await reverseGeocodeLocation(gpsLocation.latitude, gpsLocation.longitude);
        if (result) {
          setCurrentAddress({
            address: result.address,
            roadAddress: result.roadAddress,
          });
          onLocationChange({
            ...gpsLocation,
            address: result.roadAddress || result.address,
          });
        } else {
          const fallbackAddress = `${gpsLocation.latitude.toFixed(6)}, ${gpsLocation.longitude.toFixed(6)}`;
          setCurrentAddress({ address: fallbackAddress });
          onLocationChange({
            ...gpsLocation,
            address: fallbackAddress,
          });
        }
      } catch {
        const fallbackAddress = `${gpsLocation.latitude.toFixed(6)}, ${gpsLocation.longitude.toFixed(6)}`;
        setCurrentAddress({ address: fallbackAddress });
        onLocationChange({
          ...gpsLocation,
          address: fallbackAddress,
        });
      } finally {
        setIsReverseGeocoding(false);
      }
    }
  }, [getCurrentLocation, onLocationChange]);

  // Handle pin move mode toggle
  const handleTogglePinMoveMode = useCallback(() => {
    setIsPinMoveMode((prev) => !prev);
  }, []);

  // Handle radius selection
  const handleRadiusSelect = useCallback(
    (value: number) => {
      onRadiusChange?.(value);
    },
    [onRadiusChange]
  );

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
      {/* Map Section - fills available space */}
      <View style={styles.mapSection}>
        <InteractiveKakaoMap
          center={mapCenter}
          onCenterChange={handleMapCenterChange}
          isPinMoveEnabled={isPinMoveMode}
          pinLocation={isPinMoveMode ? undefined : selectedLocation}
          circleCenter={showRadiusSelector ? selectedLocation : undefined}
          radiusKm={showRadiusSelector && radiusKm > 0 ? radiusKm : undefined}
          testID={testID ? `${testID}-map` : undefined}
        />

        {/* Search Bar - overlayed at top */}
        <View style={styles.searchContainer}>
          <AddressSearchBar
            onResultSelect={handleSearchResultSelect}
            currentLocation={mapCenter}
            placeholder={searchPlaceholder}
            testID={testID ? `${testID}-search` : undefined}
          />
        </View>

        {/* GPS and Pin Move Toggle Buttons - overlayed at bottom of map */}
        <View style={styles.mapButtonsContainer}>
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
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
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
            </View>
          ) : (
            <Text style={styles.addressPlaceholder}>지도에서 위치를 선택해주세요</Text>
          )}
        </View>

        {/* Detail Address Input - shown when address is selected */}
        {currentAddress && onDetailAddressChange && (
          <View style={styles.detailInputContainer}>
            <Text style={styles.detailLabel}>상세 주소</Text>
            <TextInput
              style={styles.detailInput}
              placeholder={detailPlaceholder}
              placeholderTextColor={colors.textSecondary}
              value={detailAddress}
              onChangeText={onDetailAddressChange}
              testID={testID ? `${testID}-detail-input` : undefined}
            />
          </View>
        )}

        {/* Radius Selection - only shown when showRadiusSelector is true */}
        {showRadiusSelector && (
          <View style={styles.radiusSection}>
            <Text style={styles.radiusLabel}>서비스 반경</Text>
            <View style={styles.radiusButtons}>
              {radiusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.radiusButton,
                    radiusKm === option.value && styles.radiusButtonSelected,
                  ]}
                  onPress={() => handleRadiusSelect(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: radiusKm === option.value }}
                >
                  <Text
                    style={[
                      styles.radiusButtonText,
                      radiusKm === option.value && styles.radiusButtonTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
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
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  mapSection: {
    flex: 1,
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    minHeight: 200,
  },
  bottomControls: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    zIndex: 20,
  },
  mapButtonsContainer: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    zIndex: 10,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  gpsButtonText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  pinMoveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
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
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  pinMoveButtonTextActive: {
    color: colors.background,
  },
  gpsErrorText: {
    fontSize: 12,
    color: colors.error,
    paddingHorizontal: spacing.xs,
  },
  addressDisplay: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 60,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
    gap: 2,
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
  radiusSection: {
    gap: spacing.sm,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  radiusButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  radiusButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  radiusButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radiusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  radiusButtonTextSelected: {
    color: colors.background,
  },
  // GPS Icon styles
  gpsIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  gpsInner: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  gpsCrosshair: {
    position: 'absolute',
    backgroundColor: colors.primary,
  },
  gpsCrosshairHorizontal: {
    width: 16,
    height: 1.5,
  },
  gpsCrosshairVertical: {
    width: 1.5,
    height: 16,
  },
  // Pin Move Icon styles
  pinMoveIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinMoveIconOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    width: 16,
    height: 1.5,
  },
  pinMoveIconCrosshairV: {
    width: 1.5,
    height: 16,
  },
});

/** @deprecated Use LocationPicker instead */
export const ArtistServiceAreaPicker = LocationPicker;
/** @deprecated Use LocationPickerProps instead */
export type ArtistServiceAreaPickerProps = LocationPickerProps;

/** Default radius options exported for extension/customization */
export { DEFAULT_RADIUS_OPTIONS };
