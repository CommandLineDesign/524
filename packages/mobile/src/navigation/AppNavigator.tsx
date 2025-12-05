import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { BookingSummaryScreen } from '../screens/BookingSummaryScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OccasionSelectionScreen } from '../screens/OccasionSelectionScreen';
import { ServiceSelectionScreen } from '../screens/ServiceSelectionScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { useAuthStore } from '../store/authStore';

export type RootStackParamList = {
  Login: undefined;
  Welcome: undefined;
  ServiceSelection: undefined;
  OccasionSelection: undefined;
  BookingSummary: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { user, isLoading, loadSession } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  if (isLoading) {
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
      <Stack.Navigator initialRouteName={user ? 'Welcome' : 'Login'}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
