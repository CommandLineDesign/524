import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { BookingLayout, ContinueButton } from '../../../components/booking';
import {
  type LocationData,
  type LocationDataWithAddress,
  LocationPicker,
} from '../../../components/location';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';

interface LocationInputScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  onExit?: () => void;
  showBackButton?: boolean;
  progress?: number; // Keep for compatibility but don't use
}

export function LocationInputScreen({
  onContinue,
  onBack,
  onExit,
  showBackButton = false,
}: LocationInputScreenProps) {
  const { location, locationCoordinates, setLocation } = useBookingFlowStore();

  // Build location object for LocationPicker
  const currentLocation: LocationData = useMemo(() => {
    if (locationCoordinates && locationCoordinates.lat !== 0 && locationCoordinates.lng !== 0) {
      return {
        latitude: locationCoordinates.lat,
        longitude: locationCoordinates.lng,
        address: location ?? '',
      };
    }
    return {
      latitude: 0,
      longitude: 0,
      address: '',
    };
  }, [location, locationCoordinates]);

  // Handle real-time location changes
  const handleLocationChange = useCallback(
    (newLocation: LocationDataWithAddress) => {
      setLocation(newLocation.address, {
        lat: newLocation.latitude,
        lng: newLocation.longitude,
      });
    },
    [setLocation]
  );

  // Check if we have a valid location to enable continue button
  const hasValidLocation =
    currentLocation.latitude !== 0 &&
    currentLocation.longitude !== 0 &&
    currentLocation.address !== '';

  return (
    <BookingLayout
      showCloseButton={Boolean(onExit)}
      onClose={onExit}
      onBack={onBack}
      showBackButton={showBackButton}
      scrollable={false}
      footer={<ContinueButton label="계속" onPress={onContinue} disabled={!hasValidLocation} />}
      testID="location-input-screen"
    >
      <View style={styles.container}>
        <LocationPicker
          location={currentLocation}
          onLocationChange={handleLocationChange}
          showRadiusSelector={false}
          testID="location-picker"
        />
      </View>
    </BookingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
