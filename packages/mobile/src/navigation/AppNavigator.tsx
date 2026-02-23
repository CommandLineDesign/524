import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { GradientBackground } from '../components/common/GradientBackground';
import { useOfflineQueueProcessor } from '../hooks/useOfflineQueueProcessor';
import { useArtistProfile } from '../query/artist';
import { useOnboardingState } from '../query/onboarding';
import { ArtistBookingDetailScreen } from '../screens/ArtistBookingDetailScreen';
import { ArtistBookingsListScreen } from '../screens/ArtistBookingsListScreen';
import { ArtistListFilteredScreen } from '../screens/ArtistListFilteredScreen';
import { ArtistOnboardingFlowScreen } from '../screens/ArtistOnboardingFlowScreen';
import { ArtistPendingScreen } from '../screens/ArtistPendingScreen';
import { ArtistProfileScreen } from '../screens/ArtistProfileScreen';
import { ArtistReviewsScreen } from '../screens/ArtistReviewsScreen';
import { ArtistSignupScreen } from '../screens/ArtistSignupScreen';
import { BookingDetailScreen } from '../screens/BookingDetailScreen';
import { BookingSummaryScreen } from '../screens/BookingSummaryScreen';
import { BookingsListScreen } from '../screens/BookingsListScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ChatsListScreen } from '../screens/ChatsListScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MyReviewsScreen } from '../screens/MyReviewsScreen';
import { NotificationInboxScreen } from '../screens/NotificationInboxScreen';
import { OccasionSelectionScreen } from '../screens/OccasionSelectionScreen';
import { OnboardingFlowScreen } from '../screens/OnboardingFlowScreen';
import { OnboardingLookalikeScreen } from '../screens/OnboardingLookalikeScreen';
import { OnboardingServicesScreen } from '../screens/OnboardingServicesScreen';
import { ReviewConfirmationScreen } from '../screens/ReviewConfirmationScreen';
import { ReviewSubmissionScreen } from '../screens/ReviewSubmissionScreen';
import { ServiceSelectionScreen } from '../screens/ServiceSelectionScreen';
import { SignupConfirmationScreen } from '../screens/SignupConfirmationScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { BookingFlowScreen } from '../screens/booking';
import { ArtistDetailScreen } from '../screens/booking/artist/ArtistDetailScreen';
import { useAuthStore } from '../store/authStore';
import type { EntryPath } from '../store/bookingFlowStore';
import { colors } from '../theme';

// Feature flag to control customer onboarding visibility
const isCustomerOnboardingEnabled = process.env.EXPO_PUBLIC_SHOW_CUSTOMER_ONBOARDING === 'true';

// Custom hook to determine initial navigation route based on user state
function useInitialRoute() {
  const { user } = useAuthStore();
  const isArtist = Boolean(user?.primaryRole === 'artist' || user?.roles?.includes('artist'));

  const {
    data: artistProfile,
    isLoading: artistProfileLoading,
    error: artistProfileError,
  } = useArtistProfile(user?.id, Boolean(user && isArtist));

  const artistProfileForbidden =
    (artistProfileError as { response?: { status?: number } } | undefined)?.response?.status ===
    403;
  const lostArtistAccess = Boolean(isArtist && artistProfileForbidden);
  const effectiveIsArtist = isArtist && !lostArtistAccess;

  const { data: onboarding, isLoading: onboardingLoading } = useOnboardingState(
    effectiveIsArtist ? undefined : user?.id
  );

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
  const shouldShowCustomerOnboarding =
    isCustomerOnboardingEnabled &&
    Boolean(user) &&
    !effectiveIsArtist &&
    !(user?.onboardingCompleted || onboarding?.completed);

  return useMemo(() => {
    if (!user) return 'Login';

    if (lostArtistAccess) return 'Home';
    if (requiresArtistProfile) return 'ArtistOnboarding';
    if (artistPendingReview) return 'ArtistPending';
    if (effectiveIsArtist) return 'ArtistBookingsList';
    if (shouldShowCustomerOnboarding) return 'OnboardingFlow';

    return 'Home';
  }, [
    user,
    lostArtistAccess,
    requiresArtistProfile,
    artistPendingReview,
    effectiveIsArtist,
    shouldShowCustomerOnboarding,
  ]);
}

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  SignupConfirmation: undefined;
  ArtistSignup: undefined;
  Home: undefined;
  BookingFlow: { entryPath?: EntryPath } | undefined;
  ServiceSelection: undefined;
  OccasionSelection: undefined;
  BookingSummary: undefined;
  OnboardingFlow: undefined;
  OnboardingLookalike: undefined;
  OnboardingServices: undefined;
  BookingsList: undefined;
  BookingDetail: { bookingId: string };
  ReviewSubmission: { bookingId: string };
  ReviewConfirmation: { bookingId: string };
  MyReviews: undefined;
  ArtistProfile: { artistId: string };
  ArtistDetail: {
    artistId: string;
    // New params from home screen for pre-populated booking flow
    fromHomeScreen?: boolean;
    preselectedLocation?: string;
    preselectedCoordinates?: { lat: number; lng: number };
    preselectedDate?: string;
    preselectedTimeSlot?: string;
    preselectedServiceType?: 'hair' | 'makeup' | 'combo';
  };
  ArtistListFiltered: {
    serviceType: 'hair' | 'makeup' | 'combo';
    latitude: number;
    longitude: number;
    dateTime: string;
    locationAddress?: string;
  };
  ArtistOnboarding: undefined;
  ArtistPending: undefined;
  ArtistBookingsList: undefined;
  ArtistBookingDetail: { bookingId: string };
  ArtistReviews: undefined;
  ChatsList: undefined;
  Chat: {
    conversationId?: string;
    artistId?: string;
    customerId?: string;
    bookingId?: string;
  };
  NotificationInbox: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['fivetwofour://'],
  config: {
    screens: {
      BookingDetail: 'booking/:bookingId',
      Chat: 'chat/:conversationId',
      NotificationInbox: 'notifications',
      Home: 'home',
    },
  },
};

export function AppNavigator() {
  const { user, isLoading, loadSession } = useAuthStore();
  const isArtist = Boolean(user?.primaryRole === 'artist' || user?.roles?.includes('artist'));

  // Initialize offline queue processor (hook handles user state internally)
  useOfflineQueueProcessor();
  const {
    data: artistProfile,
    isLoading: artistProfileLoading,
    error: artistProfileError,
  } = useArtistProfile(user?.id, Boolean(user && isArtist));

  const { data: onboarding, isLoading: onboardingLoading } = useOnboardingState(
    isArtist ? undefined : user?.id
  );

  const initialRoute = useInitialRoute();

  // Recalculate these for conditional screen rendering
  const artistProfileForbidden =
    (artistProfileError as { response?: { status?: number } } | undefined)?.response?.status ===
    403;
  const lostArtistAccess = Boolean(isArtist && artistProfileForbidden);
  const effectiveIsArtist = isArtist && !lostArtistAccess;
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
  const shouldShowCustomerOnboarding =
    isCustomerOnboardingEnabled &&
    Boolean(user) &&
    !effectiveIsArtist &&
    !(user?.onboardingCompleted || onboarding?.completed);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  if (isLoading || (user && (onboardingLoading || artistProfileLoading))) {
    return (
      <GradientBackground>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.spinner} />
        </View>
      </GradientBackground>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName={initialRoute}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="SignupConfirmation"
              component={SignupConfirmationScreen}
              options={{ headerShown: false }}
            />
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
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen
                  name="BookingFlow"
                  component={BookingFlowScreen}
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
                  name="ArtistReviews"
                  component={ArtistReviewsScreen}
                  options={{ title: '내 리뷰' }}
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
                <Stack.Screen
                  name="ReviewSubmission"
                  component={ReviewSubmissionScreen}
                  options={{ title: '리뷰 작성' }}
                />
                <Stack.Screen
                  name="ReviewConfirmation"
                  component={ReviewConfirmationScreen}
                  options={{ title: '리뷰 제출 완료', headerShown: false }}
                />
                <Stack.Screen
                  name="MyReviews"
                  component={MyReviewsScreen}
                  options={{ title: '내 리뷰' }}
                />
                <Stack.Screen
                  name="ArtistProfile"
                  component={ArtistProfileScreen}
                  options={{ title: '아티스트 프로필' }}
                />
                {/*
                  Navigation entry points for ArtistProfile screen:
                  - From search results when users tap on artist cards
                  - From booking details when viewing artist information
                  - From review listings when users want to see artist's profile
                  - From artist selection flows during booking process

                  Navigation call: navigation.navigate('ArtistProfile', { artistId })
                  Expected to be implemented in upcoming stories for search and booking flows.
                */}
                <Stack.Screen
                  name="ArtistDetail"
                  component={ArtistDetailScreen}
                  options={{ title: '아티스트 정보' }}
                />
                <Stack.Screen
                  name="ArtistListFiltered"
                  component={ArtistListFilteredScreen}
                  options={{ title: '아티스트 목록' }}
                />
                <Stack.Screen
                  name="ChatsList"
                  component={ChatsListScreen}
                  options={{ title: 'Messages' }}
                />
                <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
                <Stack.Screen
                  name="NotificationInbox"
                  component={NotificationInboxScreen}
                  options={{ title: '알림' }}
                />
              </>
            )}
            {/* Ensure Home is available even while onboarding to avoid reset race */}
            {shouldShowCustomerOnboarding ? (
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            ) : null}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
