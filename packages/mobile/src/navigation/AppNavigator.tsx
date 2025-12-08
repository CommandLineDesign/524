import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useOnboardingState } from '../query/onboarding';
import { ArtistSignupScreen } from '../screens/ArtistSignupScreen';
import { BookingSummaryScreen } from '../screens/BookingSummaryScreen';
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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { user, isLoading, loadSession } = useAuthStore();
  const { data: onboarding, isLoading: onboardingLoading } = useOnboardingState(user?.id);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const shouldShowOnboarding =
    Boolean(user) && !(user?.onboardingCompleted || onboarding?.completed);

  if (isLoading || (user && onboardingLoading)) {
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
        initialRouteName={user ? (shouldShowOnboarding ? 'OnboardingFlow' : 'Welcome') : 'Login'}
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
            {shouldShowOnboarding ? (
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
              </>
            )}
            {/* Ensure Welcome is available even while onboarding to avoid reset race */}
            {shouldShowOnboarding ? (
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
