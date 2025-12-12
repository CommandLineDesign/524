import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useArtistProfile } from '../query/artist';
import { useOnboardingState } from '../query/onboarding';
import { ArtistBookingDetailScreen } from '../screens/ArtistBookingDetailScreen';
import { ArtistBookingsListScreen } from '../screens/ArtistBookingsListScreen';
import { ArtistOnboardingFlowScreen } from '../screens/ArtistOnboardingFlowScreen';
import { ArtistPendingScreen } from '../screens/ArtistPendingScreen';
import { ArtistSignupScreen } from '../screens/ArtistSignupScreen';
import { BookingDetailScreen } from '../screens/BookingDetailScreen';
import { BookingSummaryScreen } from '../screens/BookingSummaryScreen';
import { BookingsListScreen } from '../screens/BookingsListScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OccasionSelectionScreen } from '../screens/OccasionSelectionScreen';
import { OnboardingFlowScreen } from '../screens/OnboardingFlowScreen';
import { OnboardingLookalikeScreen } from '../screens/OnboardingLookalikeScreen';
import { OnboardingServicesScreen } from '../screens/OnboardingServicesScreen';
import { ServiceSelectionScreen } from '../screens/ServiceSelectionScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { useAuthStore } from '../store/authStore';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ArtistSignup: undefined;
  Welcome: undefined;
  ServiceSelection: undefined;
  OccasionSelection: undefined;
  BookingSummary: undefined;
  OnboardingFlow: undefined;
  OnboardingLookalike: undefined;
  OnboardingServices: undefined;
  BookingsList: undefined;
  BookingDetail: { bookingId: string };
  ArtistOnboarding: undefined;
  ArtistPending: undefined;
  ArtistBookingsList: undefined;
  ArtistBookingDetail: { bookingId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { user, isLoading, loadSession } = useAuthStore();
  const isArtist = Boolean(user?.primaryRole === 'artist' || user?.roles?.includes('artist'));
  const {
    data: artistProfile,
    isLoading: artistProfileLoading,
    error: artistProfileError,
  } = useArtistProfile(user?.id, Boolean(user && isArtist));

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const artistProfileForbidden =
    (artistProfileError as { response?: { status?: number } } | undefined)?.response?.status ===
    403;
  const lostArtistAccess = Boolean(isArtist && artistProfileForbidden);
  const effectiveIsArtist = isArtist && !lostArtistAccess;

  const { data: onboarding, isLoading: onboardingLoading } = useOnboardingState(
    effectiveIsArtist ? undefined : user?.id
  );

  const shouldShowCustomerOnboarding =
    Boolean(user) && !(user?.onboardingCompleted || onboarding?.completed);
  const requiresArtistProfile =
    effectiveIsArtist &&
    (!artistProfile ||
      !artistProfile.stageName ||
      !artistProfile.primaryLocation ||
      !artistProfile.profileImageUrl);
  const artistPendingReview =
    effectiveIsArtist &&
    !requiresArtistProfile &&
    artistProfile?.verificationStatus === 'pending_review';

  if (isLoading || (user && (onboardingLoading || artistProfileLoading))) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}
      >
        <ActivityIndicator size="large" color="#d4a574" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={
          user
            ? lostArtistAccess
              ? 'Welcome'
              : requiresArtistProfile
                ? 'ArtistOnboarding'
                : artistPendingReview
                  ? 'ArtistPending'
                  : effectiveIsArtist
                    ? 'ArtistBookingsList'
                    : shouldShowCustomerOnboarding
                      ? 'OnboardingFlow'
                      : 'Welcome'
            : 'Login'
        }
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="ArtistSignup"
              component={ArtistSignupScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            {requiresArtistProfile ? (
              <>
                <Stack.Screen
                  name="ArtistOnboarding"
                  component={ArtistOnboardingFlowScreen}
                  options={{ headerShown: false }}
                />
              </>
            ) : artistPendingReview ? (
              <Stack.Screen
                name="ArtistPending"
                component={ArtistPendingScreen}
                options={{ headerShown: false }}
              />
            ) : shouldShowCustomerOnboarding ? (
              <>
                <Stack.Screen
                  name="OnboardingFlow"
                  component={OnboardingFlowScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="OnboardingLookalike"
                  component={OnboardingLookalikeScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="OnboardingServices"
                  component={OnboardingServicesScreen}
                  options={{ headerShown: false }}
                />
              </>
            ) : (
              <>
                <Stack.Screen
                  name="Welcome"
                  component={WelcomeScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="ArtistBookingsList"
                  component={ArtistBookingsListScreen}
                  options={{ title: '예약 요청' }}
                />
                <Stack.Screen
                  name="ArtistBookingDetail"
                  component={ArtistBookingDetailScreen}
                  options={{ title: '예약 요청 상세' }}
                />
                <Stack.Screen
                  name="ServiceSelection"
                  component={ServiceSelectionScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="OccasionSelection"
                  component={OccasionSelectionScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="BookingSummary"
                  component={BookingSummaryScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="BookingsList"
                  component={BookingsListScreen}
                  options={{ title: '내 예약' }}
                />
                <Stack.Screen
                  name="BookingDetail"
                  component={BookingDetailScreen}
                  options={{ title: '예약 상세' }}
                />
              </>
            )}
            {/* Ensure Welcome is available even while onboarding to avoid reset race */}
            {shouldShowCustomerOnboarding ? (
              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }}
              />
            ) : null}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
