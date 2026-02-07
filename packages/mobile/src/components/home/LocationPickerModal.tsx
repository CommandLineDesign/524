import type { LocationData, LocationDataWithAddress } from '@524/shared';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { borderRadius, colors, spacing, typography } from '../../theme';
import { LocationPicker } from '../location/LocationPicker';

export interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  initialLocation: LocationData | null;
  onLocationSelect: (location: LocationDataWithAddress) => void;
}

export function LocationPickerModal({
  visible,
  onClose,
  initialLocation,
  onLocationSelect,
}: LocationPickerModalProps) {
  // Temporary location state - only confirmed when user taps "Confirm"
  const [tempLocation, setTempLocation] = useState<LocationDataWithAddress | null>(null);
  // Detail address state
  const [detailAddress, setDetailAddress] = useState(initialLocation?.detailAddress ?? '');

  // Reset detail address when modal opens with new initial location
  useEffect(() => {
    if (visible) {
      setDetailAddress(initialLocation?.detailAddress ?? '');
    }
  }, [visible, initialLocation?.detailAddress]);

  const handleLocationChange = useCallback((location: LocationDataWithAddress) => {
    setTempLocation(location);
  }, []);

  const handleDetailAddressChange = useCallback((detail: string) => {
    setDetailAddress(detail);
  }, []);

  const handleConfirm = useCallback(() => {
    if (tempLocation) {
      onLocationSelect({
        ...tempLocation,
        detailAddress: detailAddress || undefined,
      });
    }
    onClose();
  }, [tempLocation, detailAddress, onLocationSelect, onClose]);

  const handleClose = useCallback(() => {
    setTempLocation(null);
    setDetailAddress('');
    onClose();
  }, [onClose]);

  // Convert initial location to LocationData format
  const locationData: LocationData = initialLocation
    ? {
        ...initialLocation,
        detailAddress: detailAddress,
      }
    : {
        latitude: 0,
        longitude: 0,
      };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityLabel="닫기"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>위치 선택</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Location Picker */}
        <View style={styles.pickerContainer}>
          <LocationPicker
            location={locationData}
            onLocationChange={handleLocationChange}
            showRadiusSelector={false}
            searchPlaceholder="주소 또는 장소 검색"
            detailAddress={detailAddress}
            onDetailAddressChange={handleDetailAddressChange}
          />
        </View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.cancelButton}
            accessibilityLabel="취소"
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.confirmButton}
            accessibilityLabel="확인"
            accessibilityRole="button"
          >
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.text,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  pickerContainer: {
    flex: 1,
    padding: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
  confirmButton: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.background,
  },
});
