import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phoneNumber: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5524';

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

      const data = await response.json();
      
      // Save to async storage
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      set({ user: data.user, token: data.token });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
    set({ user: null, token: null });
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

