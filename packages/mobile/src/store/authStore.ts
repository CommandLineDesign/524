import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import {
  type AuthResponse,
  type AuthUser,
  type SignupPayload,
  signUpArtist,
  signUpUser,
} from '../api/client';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUpUser: (payload: SignupPayload) => Promise<void>;
  signUpArtist: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5240';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

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

      // Save to async storage
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      set({ user: data.user, token: data.token, isLoading: false });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      set((state) => ({ ...state, isLoading: false }));
    }
  },

  signUpUser: async (payload: SignupPayload) => {
    try {
      const data = await signUpUser(payload);
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (error) {
      console.error('Signup user error:', error);
      throw error;
    } finally {
      set((state) => ({ ...state, isLoading: false }));
    }
  },

  signUpArtist: async (payload: SignupPayload) => {
    try {
      const data = await signUpArtist(payload);
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (error) {
      console.error('Signup artist error:', error);
      throw error;
    } finally {
      set((state) => ({ ...state, isLoading: false }));
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
    set({ user: null, token: null, isLoading: false });
  },

  loadSession: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userStr = await AsyncStorage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Load session error:', error);
      set({ isLoading: false });
    }
  },
}));
