import type { LocationData, LocationDataWithAddress } from '@524/shared';
import React, { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { borderRadius, colors, spacing } from '../../theme';
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

  const handleLocationChange = useCallback((location: LocationDataWithAddress) => {
    setTempLocation(location);
  }, []);

  const handleConfirm = useCallback(() => {
    if (tempLocation) {
      onLocationSelect(tempLocation);
    }
    onClose();
  }, [tempLocation, onLocationSelect, onClose]);

  const handleClose = useCallback(() => {
    setTempLocation(null);
    onClose();
  }, [onClose]);

  // Convert initial location to LocationData format
  const locationData: LocationData = initialLocation ?? {
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
            <Text style={styles.closeButtonText}>취소</Text>
          </TouchableOpacity>

          <Text style={styles.title}>위치 선택</Text>

          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.confirmButton}
            accessibilityLabel="확인"
            accessibilityRole="button"
          >
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
        </View>

        {/* Location Picker */}
        <View style={styles.pickerContainer}>
          <LocationPicker
            location={locationData}
            onLocationChange={handleLocationChange}
            showRadiusSelector={false}
            searchPlaceholder="주소 또는 장소 검색"
          />
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.muted,
  },
  confirmButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  pickerContainer: {
    flex: 1,
    padding: spacing.md,
  },
});
