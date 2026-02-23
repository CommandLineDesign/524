import type { ArtistLocation } from '@524/shared';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, overlays, spacing } from '../../theme';
import { formStyles } from '../../theme/formStyles';
import type { MapAddressPickerResult } from '../../types/kakao';
import { KakaoMapView } from './KakaoMapView';
import { MapAddressPicker } from './MapAddressPicker';

export interface ServiceAreaInputProps {
  /** Current location value */
  location: ArtistLocation;
  /** Current service radius in kilometers */
  serviceRadiusKm: number;
  /** Callback when location changes */
  onLocationChange: (location: ArtistLocation) => void;
  /** Callback when service radius changes */
  onRadiusChange: (radiusKm: number) => void;
}

type ViewMode = 'display' | 'picker';

export function ServiceAreaInput({
  location,
  serviceRadiusKm,
  onLocationChange,
  onRadiusChange,
}: ServiceAreaInputProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('display');

  const hasValidCoordinates = location.latitude !== 0 && location.longitude !== 0;

  const handleLocationConfirm = useCallback(
    (result: MapAddressPickerResult) => {
      onLocationChange({
        latitude: result.latitude,
        longitude: result.longitude,
        address: result.roadAddress || result.address,
      });
      setViewMode('display');
    },
    [onLocationChange]
  );

  const handleRadiusChange = useCallback(
    (text: string) => {
      const radius = Number.parseFloat(text) || 0;
      onRadiusChange(radius);
    },
    [onRadiusChange]
  );

  const handleOpenPicker = useCallback(() => {
    setViewMode('picker');
  }, []);

  const handleCancelPicker = useCallback(() => {
    setViewMode('display');
  }, []);

  // Picker mode - full map-based location selection
  if (viewMode === 'picker') {
    return (
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>위치 선택</Text>
          <TouchableOpacity onPress={handleCancelPicker}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
        </View>
        <MapAddressPicker
          initialLocation={
            hasValidCoordinates
              ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  address: location.address,
                }
              : undefined
          }
          onLocationConfirm={handleLocationConfirm}
          onCancel={handleCancelPicker}
          confirmButtonLabel="이 위치로 설정"
          showRadiusOverlay={serviceRadiusKm > 0}
          radiusKm={serviceRadiusKm}
          mapHeight={250}
          testID="service-area-picker"
        />
      </View>
    );
  }

  // Display mode - show selected location with edit option
  return (
    <View style={styles.container}>
      {/* Location Display / Select Button */}
      <View>
        <Text style={formStyles.label}>주소</Text>
        <TouchableOpacity
          style={styles.addressButton}
          onPress={handleOpenPicker}
          accessibilityRole="button"
          accessibilityLabel="주소 선택"
          accessibilityHint="탭하여 지도에서 위치를 선택합니다"
        >
          {location.address ? (
            <View style={styles.addressContent}>
              <Text style={styles.addressText} numberOfLines={2}>
                {location.address}
              </Text>
              <Text style={styles.changeText}>변경</Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>탭하여 위치 선택</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Map Preview */}
      {hasValidCoordinates && (
        <TouchableOpacity
          style={styles.mapContainer}
          onPress={handleOpenPicker}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="지도 미리보기"
          accessibilityHint="탭하여 위치를 변경합니다"
        >
          <Text style={formStyles.label}>위치 미리보기</Text>
          <KakaoMapView
            latitude={location.latitude}
            longitude={location.longitude}
            radiusKm={serviceRadiusKm || undefined}
            height={180}
            interactive={false}
          />
          <View style={styles.mapOverlay}>
            <Text style={styles.mapOverlayText}>탭하여 변경</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Service Radius Input */}
      <View>
        <Text style={formStyles.label}>서비스 반경 (km)</Text>
        <TextInput
          value={serviceRadiusKm?.toString() ?? ''}
          onChangeText={handleRadiusChange}
          placeholder="예: 10"
          placeholderTextColor={colors.muted}
          keyboardType="decimal-pad"
          selectionColor={colors.text}
          cursorColor={colors.text}
          style={formStyles.input}
          accessibilityLabel="서비스 반경"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  pickerContainer: {
    flex: 1,
    gap: spacing.md,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  cancelText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  addressButton: {
    minHeight: spacing.inputHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  changeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 16,
    color: colors.muted,
  },
  mapContainer: {
    gap: spacing.xs,
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: overlays.modalBackdropDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  mapOverlayText: {
    fontSize: 12,
    color: colors.background,
    fontWeight: '500',
  },
  helperText: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
