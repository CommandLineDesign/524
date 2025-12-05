export const ADMIN_TOKEN_STORAGE_KEY = 'adminAuthToken';
export const ADMIN_USER_STORAGE_KEY = 'adminUser';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
}
