import { SESSION_INVALIDATED_CODE, TOKEN_EXPIRED_CODE, TOKEN_INVALID_CODE } from '@524/shared';

export const ADMIN_TOKEN_STORAGE_KEY = 'adminAuthToken';
export const ADMIN_REFRESH_TOKEN_STORAGE_KEY = 'adminRefreshToken';
export const ADMIN_TOKEN_EXPIRY_KEY = 'adminTokenExpiry';
export const ADMIN_USER_STORAGE_KEY = 'adminUser';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5240/api/v1';

// Refresh state management to prevent concurrent refresh requests
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let refreshFailedSubscribers: Array<(error: Error) => void> = [];

// Callback for auth failures that require re-login
let onAuthFailure: (() => void) | null = null;

/**
 * Register a callback to be called when authentication fails completely
 */
export function setAuthFailureCallback(callback: () => void) {
  onAuthFailure = callback;
}

function subscribeTokenRefresh(
  onSuccess: (token: string) => void,
  onFailure: (error: Error) => void
) {
  refreshSubscribers.push(onSuccess);
  refreshFailedSubscribers.push(onFailure);
}

function onTokenRefreshed(token: string) {
  for (const callback of refreshSubscribers) {
    callback(token);
  }
  refreshSubscribers = [];
  refreshFailedSubscribers = [];
}

function onRefreshFailed(error: Error) {
  for (const callback of refreshFailedSubscribers) {
    callback(error);
  }
  refreshSubscribers = [];
  refreshFailedSubscribers = [];
}

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

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(ADMIN_REFRESH_TOKEN_STORAGE_KEY);
}

export function setStoredRefreshToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(ADMIN_REFRESH_TOKEN_STORAGE_KEY, token);
}

export function getTokenExpiry(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const expiry = localStorage.getItem(ADMIN_TOKEN_EXPIRY_KEY);
  return expiry ? Number.parseInt(expiry, 10) : null;
}

export function setTokenExpiry(expiresIn: number) {
  if (typeof window === 'undefined') {
    return;
  }
  const expiryTime = Date.now() + expiresIn * 1000;
  localStorage.setItem(ADMIN_TOKEN_EXPIRY_KEY, expiryTime.toString());
}

export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) {
    return true;
  }
  return Date.now() >= expiry;
}

export function isTokenExpiringSoon(thresholdSeconds = 60): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) {
    return true;
  }
  const threshold = thresholdSeconds * 1000;
  return Date.now() >= expiry - threshold;
}

/**
 * Store both tokens and expiry at once (convenience method for login)
 */
export function setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  setStoredToken(accessToken);
  setStoredRefreshToken(refreshToken);
  setTokenExpiry(expiresIn);
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(ADMIN_TOKEN_EXPIRY_KEY);
  localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
}

/**
 * Refresh the access token using the stored refresh token
 */
async function refreshAccessToken(): Promise<string> {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error((errorBody as { error?: string }).error || 'Token refresh failed');
  }

  const data = (await response.json()) as {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };

  // Store the new tokens
  setTokens(data.accessToken, data.refreshToken, data.expiresIn);

  return data.accessToken;
}

/**
 * Handle token refresh with request queueing
 * Ensures only one refresh request is made at a time
 */
export async function handleTokenRefresh(): Promise<string> {
  if (isRefreshing) {
    // Wait for the ongoing refresh to complete
    return new Promise<string>((resolve, reject) => {
      subscribeTokenRefresh(resolve, reject);
    });
  }

  isRefreshing = true;

  try {
    const newToken = await refreshAccessToken();
    onTokenRefreshed(newToken);
    return newToken;
  } catch (error) {
    const authError = error instanceof Error ? error : new Error('Token refresh failed');
    onRefreshFailed(authError);

    // Trigger auth failure callback - user needs to re-login
    onAuthFailure?.();

    throw authError;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Check if an error response indicates token expiration
 */
export function isTokenExpiredError(errorBody: unknown): boolean {
  const code = (errorBody as { code?: string } | undefined)?.code;
  return code === TOKEN_EXPIRED_CODE;
}

/**
 * Check if an error response indicates session invalidation
 */
export function isSessionInvalidatedError(errorBody: unknown): boolean {
  const code = (errorBody as { code?: string } | undefined)?.code;
  return code === SESSION_INVALIDATED_CODE || code === TOKEN_INVALID_CODE;
}
