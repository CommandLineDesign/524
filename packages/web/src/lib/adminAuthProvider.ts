import type { AuthProvider } from 'react-admin';

import {
  ADMIN_USER_STORAGE_KEY,
  API_BASE_URL,
  clearStoredAuth,
  getStoredToken,
  setStoredToken,
} from './adminApi';

type LoginParams = {
  email?: string;
  password?: string;
};

export const adminAuthProvider: AuthProvider = {
  async login(params?: LoginParams) {
    const email = params?.email?.trim();
    const password = params?.password;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = typeof errorBody?.error === 'string' ? errorBody.error : 'Login failed';
      throw new Error(message);
    }

    const payload = await response.json();
    console.log('[AdminAuthProvider] Login successful, received token:', !!payload.token);

    setStoredToken(payload.token);
    if (typeof window !== 'undefined' && payload.user) {
      localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(payload.user));
      console.log('[AdminAuthProvider] User data stored:', payload.user);
    }
  },

  async logout() {
    clearStoredAuth();
    return Promise.resolve();
  },

  async checkAuth() {
    const token = getStoredToken();
    console.log('[AdminAuthProvider] checkAuth called, token exists:', !!token);
    return token ? Promise.resolve() : Promise.reject();
  },

  async checkError(error) {
    if (error?.status === 401 || error?.status === 403) {
      clearStoredAuth();
      return Promise.reject();
    }
    return Promise.resolve();
  },

  async getPermissions() {
    return 'admin';
  },

  async getIdentity() {
    const token = getStoredToken();
    console.log('[AdminAuthProvider] getIdentity called, token exists:', !!token);
    if (!token) {
      return Promise.reject();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log('[AdminAuthProvider] getIdentity failed with status:', response.status);
        clearStoredAuth();
        return Promise.reject();
      }

      const user = await response.json();
      console.log('[AdminAuthProvider] getIdentity successful for user:', user.email);

      return {
        id: user.id ?? 'admin',
        fullName: user.name ?? 'Admin',
        email: user.email,
      };
    } catch (error) {
      console.error('[AdminAuthProvider] getIdentity error:', error);
      throw error;
    }
  },
};
