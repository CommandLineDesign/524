import { useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
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
type BookingFlowRouteProp = RouteProp<RootStackParamList, 'BookingFlow'>;

interface BookingFlowScreenProps {
  route: BookingFlowRouteProp;
}

export function BookingFlowScreen({ route }: BookingFlowScreenProps) {
  const initialEntryPath = route.params?.entryPath;
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
    selectedArtistId,
    locationCoordinates,
  } = useBookingFlowStore();

  // Initialize the flow on mount
  useEffect(() => {
    const pathToUse = initialEntryPath ?? 'celebrity';

    // For homeEntry, the store is already initialized via initializeFromHome
    // which atomically sets entryPath, currentStep, and all pre-populated data
    if (pathToUse === 'homeEntry') {
      // Guard: verify required data was pre-populated via initializeFromHome
      // If missing, fall back to regular celebrity flow to avoid broken state
      if (!selectedArtistId || !locationCoordinates) {
        console.warn(
          'homeEntry missing required data (artistId or coordinates), falling back to celebrity flow'
        );
        reset();
        setEntryPath('celebrity');
        return;
      }
      // No additional state updates needed - initializeFromHome already set
      // entryPath to 'homeEntry' and currentStep to 'occasionSelection' atomically
    } else {
      // For other entry paths, reset the store and start fresh
      reset();
      setEntryPath(pathToUse);
    }
  }, [initialEntryPath, reset, setEntryPath, selectedArtistId, locationCoordinates]);

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
    let steps: BookingStepKey[];
    if (entryPath === 'homeEntry') {
      steps = getHomeEntryFlowSteps();
    } else if (entryPath === 'celebrity') {
      steps = getCelebrityFlowSteps();
    } else {
      steps = getDirectFlowSteps();
    }

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

  // Handle back navigation (go to previous step)
  const handleBack = useCallback(() => {
    if (canGoBack()) {
      goBack();
    }
  }, [canGoBack, goBack]);

  // Handle exit (close the entire booking flow and return to home)
  const handleExit = useCallback(() => {
    reset();
    navigation.navigate('Home');
  }, [reset, navigation]);

  // Determine if back button should be shown
  const showBackButton = canGoBack();

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
            onExit={handleExit}
            showBackButton={showBackButton}
          />
        );

      case 'serviceSelection':
        return (
          <ServiceSelectionScreen
            progress={progress}
            onContinue={() => handleNext('occasionSelection')}
            onBack={handleBack}
            onExit={handleExit}
            showBackButton={showBackButton}
          />
        );

      // Common flow screens
      case 'occasionSelection':
        return (
          <OccasionSelectionScreen
            progress={progress}
            onContinue={() =>
              // For homeEntry, skip schedule/artist selection since they're pre-selected
              handleNext(entryPath === 'homeEntry' ? 'treatmentSelection' : 'scheduleSelection')
            }
            onBack={handleBack}
            onExit={handleExit}
            showBackButton={showBackButton}
          />
        );

      case 'scheduleSelection':
        return (
          <ScheduleSelectionScreen
            progress={progress}
            onContinue={() => handleNext('artistList')}
            onBack={handleBack}
            onExit={handleExit}
            showBackButton={showBackButton}
          />
        );

      // Artist screens
      case 'artistList':
        return (
          <ArtistListScreen
            progress={progress}
            onContinue={() => handleNext('treatmentSelection')}
            onBack={handleBack}
            onExit={handleExit}
            showBackButton={showBackButton}
            variant="default"
          />
        );

      case 'bookmarkedArtists':
        return (
          <ArtistListScreen
            progress={progress}
            onContinue={() => handleNext('treatmentSelection')}
            onBack={handleBack}
            onExit={handleExit}
            showBackButton={showBackButton}
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
            onExit={handleExit}
            showBackButton={showBackButton}
          />
        );

      case 'styleSelection':
        return (
          <StyleSelectionScreen
            progress={progress}
            onContinue={() => handleNext('paymentConfirmation')}
            onBack={handleBack}
            onExit={handleExit}
            showBackButton={showBackButton}
          />
        );

      // Checkout screens
      case 'paymentConfirmation':
        return (
          <PaymentConfirmationScreen
            progress={progress}
            onContinue={handleComplete}
            onBack={handleBack}
            onExit={handleExit}
            showBackButton={showBackButton}
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
            onExit={handleExit}
            showBackButton={showBackButton}
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

// Home entry flow - location, time, artist, and service are pre-selected from home screen
function getHomeEntryFlowSteps(): BookingStepKey[] {
  return [
    'occasionSelection',
    'treatmentSelection',
    'styleSelection',
    'paymentConfirmation',
    'bookingComplete',
  ];
}
