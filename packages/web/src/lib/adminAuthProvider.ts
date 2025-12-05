import type { AuthProvider } from 'react-admin';

import {
  ADMIN_USER_STORAGE_KEY,
  API_BASE_URL,
  clearStoredAuth,
  getStoredToken,
  setStoredToken,
} from './adminApi';

export const adminAuthProvider: AuthProvider = {
  async login() {
    const response = await fetch(`${API_BASE_URL}/auth/mock/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const payload = await response.json();

    setStoredToken(payload.token);
    if (typeof window !== 'undefined' && payload.user) {
      localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(payload.user));
    }
  },

  async logout() {
    clearStoredAuth();
    return Promise.resolve();
  },

  async checkAuth() {
    return getStoredToken() ? Promise.resolve() : Promise.reject();
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
    if (!token) {
      return Promise.reject();
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      clearStoredAuth();
      return Promise.reject();
    }

    const user = await response.json();

    return {
      id: user.id ?? 'admin',
      fullName: user.name ?? 'Admin',
      email: user.email,
    };
  },
};
