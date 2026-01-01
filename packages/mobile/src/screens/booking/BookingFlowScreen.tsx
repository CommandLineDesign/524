import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';

import { type BookingStepKey, flowConfig } from '../../constants/bookingOptions';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import {
  type EntryPath,
  selectIsFlowComplete,
  useBookingFlowStore,
} from '../../store/bookingFlowStore';

import { ArtistListScreen } from './artist';
import { BookingCompleteScreen, PaymentConfirmationScreen } from './checkout';
import { OccasionSelectionScreen, ScheduleSelectionScreen } from './common';
// Import all screens
import { LocationInputScreen, ServiceSelectionScreen } from './entry';
import { StyleSelectionScreen, TreatmentSelectionScreen } from './treatment';

type BookingFlowNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookingFlow'>;

interface BookingFlowScreenProps {
  entryPath?: EntryPath;
}

export function BookingFlowScreen({ entryPath: initialEntryPath }: BookingFlowScreenProps) {
  const navigation = useNavigation<BookingFlowNavigationProp>();
  const {
    entryPath,
    currentStep,
    setEntryPath,
    setStep,
    goBack,
    canGoBack,
    reset,
    completeFlow,
    createdBookingId,
  } = useBookingFlowStore();

  // Initialize the flow on mount - always reset and start fresh
  useEffect(() => {
    // Reset the store and set the entry path when entering the flow
    // This ensures we always start fresh and don't have stale state
    reset();
    const pathToUse = initialEntryPath ?? 'celebrity';
    setEntryPath(pathToUse);
  }, [initialEntryPath, reset, setEntryPath]);

  // Handle hardware back button
  useEffect(() => {
    const handleBackPress = () => {
      if (canGoBack()) {
        goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [canGoBack, goBack]);

  // Calculate progress based on current step
  const getProgress = useCallback((): number => {
    const steps = entryPath === 'celebrity' ? getCelebrityFlowSteps() : getDirectFlowSteps();

    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / steps.length) * 100;
  }, [entryPath, currentStep]);

  // Handle navigation to next step
  const handleNext = useCallback(
    (nextStep: BookingStepKey) => {
      setStep(nextStep);
    },
    [setStep]
  );

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (canGoBack()) {
      goBack();
    } else {
      // Exit flow if at the beginning
      reset();
      navigation.goBack();
    }
  }, [canGoBack, goBack, reset, navigation]);

  // Handle flow completion
  const handleComplete = useCallback(() => {
    // Generate a mock booking ID
    const bookingId = `BK${Date.now()}`;
    completeFlow(bookingId);
  }, [completeFlow]);

  // Handle going home after completion
  const handleGoHome = useCallback(() => {
    reset();
    navigation.navigate('Home');
  }, [reset, navigation]);

  // Handle viewing booking details
  const handleViewDetails = useCallback(() => {
    if (createdBookingId) {
      reset();
      navigation.navigate('BookingDetail', { bookingId: createdBookingId });
    }
  }, [createdBookingId, reset, navigation]);

  const progress = getProgress();

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      // Entry screens
      case 'locationInput':
        return (
          <LocationInputScreen
            progress={progress}
            onContinue={() => handleNext('serviceSelection')}
            onBack={handleBack}
          />
        );

      case 'serviceSelection':
        return (
          <ServiceSelectionScreen
            progress={progress}
            onContinue={() => handleNext('occasionSelection')}
            onBack={handleBack}
          />
        );

      // Common flow screens
      case 'occasionSelection':
        return (
          <OccasionSelectionScreen
            progress={progress}
            onContinue={() => handleNext('scheduleSelection')}
            onBack={handleBack}
          />
        );

      case 'scheduleSelection':
        return (
          <ScheduleSelectionScreen
            progress={progress}
            onContinue={() => handleNext('artistList')}
            onBack={handleBack}
          />
        );

      // Artist screens
      case 'artistList':
        return (
          <ArtistListScreen
            progress={progress}
            onContinue={() => handleNext('treatmentSelection')}
            onBack={handleBack}
            variant="default"
          />
        );

      case 'bookmarkedArtists':
        return (
          <ArtistListScreen
            progress={progress}
            onContinue={() => handleNext('treatmentSelection')}
            onBack={handleBack}
            variant="bookmarked"
          />
        );

      // Treatment screens
      case 'treatmentSelection':
        return (
          <TreatmentSelectionScreen
            progress={progress}
            onContinue={() => handleNext('styleSelection')}
            onBack={handleBack}
          />
        );

      case 'styleSelection':
        return (
          <StyleSelectionScreen
            progress={progress}
            onContinue={() => handleNext('paymentConfirmation')}
            onBack={handleBack}
          />
        );

      // Checkout screens
      case 'paymentConfirmation':
        return (
          <PaymentConfirmationScreen
            progress={progress}
            onContinue={handleComplete}
            onBack={handleBack}
          />
        );

      case 'bookingComplete':
        return <BookingCompleteScreen onGoHome={handleGoHome} onViewDetails={handleViewDetails} />;

      default:
        // Fallback to service selection if unknown step
        return (
          <ServiceSelectionScreen
            progress={progress}
            onContinue={() => handleNext('occasionSelection')}
            onBack={handleBack}
          />
        );
    }
  };

  return renderStep();
}

// Helper functions to define step order for each flow
function getCelebrityFlowSteps(): BookingStepKey[] {
  return [
    'locationInput',
    'serviceSelection',
    'occasionSelection',
    'scheduleSelection',
    'artistList',
    'treatmentSelection',
    'styleSelection',
    'paymentConfirmation',
    'bookingComplete',
  ];
}

function getDirectFlowSteps(): BookingStepKey[] {
  return [
    'serviceSelection',
    'occasionSelection',
    'scheduleSelection',
    'artistList',
    'treatmentSelection',
    'styleSelection',
    'paymentConfirmation',
    'bookingComplete',
  ];
}
