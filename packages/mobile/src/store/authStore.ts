import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import {
  type ArtistSignupPayload,
  type AuthResponse,
  type AuthUser,
  type SignupPayload,
  setAuthFailureCallback,
  signUpArtist,
  signUpUser,
} from '../api/client';
import { TokenService } from '../services/tokenService';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUpUser: (payload: SignupPayload) => Promise<void>;
  signUpArtist: (payload: ArtistSignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  silentLogout: () => Promise<void>;
  loadSession: () => Promise<void>;
  setUserOnboardingComplete: (completed: boolean) => Promise<void>;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5240';

/**
 * Helper to store auth data after login/signup
 */
async function storeAuthData(data: AuthResponse): Promise<void> {
  await Promise.all([
    TokenService.setTokens(data.accessToken, data.refreshToken, data.expiresIn),
    AsyncStorage.setItem('user', JSON.stringify(data.user)),
  ]);
}

/**
 * Helper to clear all auth data
 */
async function clearAuthData(): Promise<void> {
  await Promise.all([TokenService.clearAllTokens(), AsyncStorage.removeItem('user')]);
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Register the auth failure callback to trigger silent logout
  // This will be called by the API client when token refresh fails
  setAuthFailureCallback(() => {
    get().silentLogout();
  });

  return {
    user: null,
    isLoading: true,
    isAuthenticated: false,

    login: async (email: string, password: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Login failed');
        }

        const data = (await response.json()) as AuthResponse;

        // Store tokens and user data
        await storeAuthData(data);

        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } finally {
        set((state) => ({ ...state, isLoading: false }));
      }
    },

    signUpUser: async (payload: SignupPayload) => {
      try {
        const data = await signUpUser(payload);
        await storeAuthData(data);
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } finally {
        set((state) => ({ ...state, isLoading: false }));
      }
    },

    signUpArtist: async (payload: ArtistSignupPayload) => {
      try {
        const data = await signUpArtist(payload);
        await storeAuthData(data);
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } finally {
        set((state) => ({ ...state, isLoading: false }));
      }
    },

    /**
     * Logout with API call to revoke refresh token
     */
    logout: async () => {
      try {
        // Try to revoke the refresh token on the server
        const [accessToken, refreshToken] = await Promise.all([
          TokenService.getAccessToken(),
          TokenService.getRefreshToken(),
        ]);

        if (accessToken && refreshToken) {
          try {
            await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ refreshToken }),
            });
          } catch {
            // Ignore errors - we're logging out anyway
          }
        }
      } finally {
        // Clear local auth data regardless of API call result
        await clearAuthData();
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    },

    /**
     * Silent logout - used when auth fails (token expired, session invalidated)
     * Does not call API since token is already invalid
     */
    silentLogout: async () => {
      await clearAuthData();
      set({ user: null, isAuthenticated: false, isLoading: false });
    },

    setUserOnboardingComplete: async (completed: boolean) => {
      let nextUser: AuthUser | null = null;
      set((state) => {
        if (!state.user) return state;
        nextUser = { ...state.user, onboardingCompleted: completed };
        return { ...state, user: nextUser };
      });

      if (nextUser) {
        await AsyncStorage.setItem('user', JSON.stringify(nextUser));
      }
    },

    /**
     * Load session from storage on app startup
     * Validates tokens and attempts refresh if needed
     */
    loadSession: async () => {
      try {
        const [hasTokens, userStr] = await Promise.all([
          TokenService.hasTokens(),
          AsyncStorage.getItem('user'),
        ]);

        if (!hasTokens || !userStr) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        const user = JSON.parse(userStr) as AuthUser;

        // Check if access token is expired
        const isExpired = await TokenService.isAccessTokenExpired();

        if (isExpired) {
          // Try to refresh the token
          const refreshToken = await TokenService.getRefreshToken();

          if (!refreshToken) {
            // No refresh token, need to re-login
            await clearAuthData();
            set({ isLoading: false, isAuthenticated: false });
            return;
          }

          try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
              // Refresh failed, need to re-login
              await clearAuthData();
              set({ isLoading: false, isAuthenticated: false });
              return;
            }

            const data = (await response.json()) as {
              accessToken: string;
              refreshToken: string;
              expiresIn: number;
            };

            // Store new tokens
            await TokenService.setTokens(data.accessToken, data.refreshToken, data.expiresIn);
          } catch {
            // Network error during refresh, need to re-login
            await clearAuthData();
            set({ isLoading: false, isAuthenticated: false });
            return;
          }
        }

        // Session is valid
        set({
          user: { ...user, onboardingCompleted: Boolean(user.onboardingCompleted) },
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        // Error during session load, clear auth data
        await clearAuthData();
        set({ isLoading: false, isAuthenticated: false });
      }
    },
  };
});
