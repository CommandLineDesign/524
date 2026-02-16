// Note: Review type is duplicated from @524/database schema
// API responses use string dates while database uses Date objects
import type {
  ArtistProfile,
  ArtistSearchResult,
  BookingStatus,
  BookingSummary,
  CreateBookingPayload,
  OnboardingResponseInput,
  OnboardingState,
} from '@524/shared';
import {
  NETWORK_ERROR,
  REFRESH_TIMEOUT,
  SESSION_INVALIDATED_CODE,
  TOKEN_EXPIRED_CODE,
  TOKEN_INVALID_CODE,
} from '@524/shared';

import { TokenService } from '../services/tokenService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5240';

// Error codes imported from shared package

// Refresh state management
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let refreshFailedSubscribers: Array<(error: Error) => void> = [];

// Callback for auth failures that require re-login
let onAuthFailure: (() => void) | null = null;

/**
 * Register a callback to be called when authentication fails completely
 * (refresh token expired or session invalidated)
 */
export function setAuthFailureCallback(callback: () => void) {
  onAuthFailure = callback;
}

/**
 * Subscribe to token refresh completion
 */
function subscribeTokenRefresh(
  onSuccess: (token: string) => void,
  onFailure: (error: Error) => void
) {
  refreshSubscribers.push(onSuccess);
  refreshFailedSubscribers.push(onFailure);
}

/**
 * Notify all subscribers that token refresh completed successfully
 */
function onTokenRefreshed(token: string) {
  for (const callback of refreshSubscribers) {
    callback(token);
  }
  refreshSubscribers = [];
  refreshFailedSubscribers = [];
}

/**
 * Notify all subscribers that token refresh failed
 */
function onRefreshFailed(error: Error) {
  for (const callback of refreshFailedSubscribers) {
    callback(error);
  }
  refreshSubscribers = [];
  refreshFailedSubscribers = [];
}

export class ApiError extends Error {
  status: number;
  body?: unknown;
  code?: string;

  constructor(message: string, status: number, body?: unknown, code?: string) {
    super(message);
    this.status = status;
    this.body = body;
    this.code = code;
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required', code?: string) {
    super(message, 401, undefined, code);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Request conflicts with current state') {
    super(message, 409);
  }
}

function buildError(message: string | string[] | undefined, status: number, body?: unknown) {
  const normalizedMessage = Array.isArray(message) ? message.join(', ') : message;
  const code = (body as { code?: string } | undefined)?.code;
  return new ApiError(normalizedMessage || 'Request failed', status, body, code);
}

/**
 * Refresh the access token using the stored refresh token
 */
async function refreshAccessToken(): Promise<string> {
  const refreshToken = await TokenService.getRefreshToken();

  if (!refreshToken) {
    throw new AuthenticationError('No refresh token available', 'NO_REFRESH_TOKEN');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const code = (errorBody as { code?: string }).code;
      throw new AuthenticationError(
        (errorBody as { error?: string }).error || 'Token refresh failed',
        code
      );
    }

    const data = (await response.json()) as {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };

    // Store the new tokens
    await TokenService.setTokens(data.accessToken, data.refreshToken, data.expiresIn);

    return data.accessToken;
  } catch (error) {
    // Handle network errors and other fetch failures
    if (error instanceof AuthenticationError) {
      throw error;
    }
    // Network error, timeout, or other fetch failure
    throw new AuthenticationError('Network error during token refresh', 'NETWORK_ERROR');
  }
}

/**
 * Handle token refresh with request queueing
 * Ensures only one refresh request is made at a time
 */
async function handleTokenRefresh(): Promise<string> {
  if (isRefreshing) {
    // Wait for the ongoing refresh to complete with timeout
    return new Promise<string>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new AuthenticationError('Token refresh timeout', 'REFRESH_TIMEOUT'));
      }, 30000); // 30 second timeout

      subscribeTokenRefresh(
        (token) => {
          clearTimeout(timeoutId);
          resolve(token);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      );
    });
  }

  isRefreshing = true;

  try {
    const newToken = await refreshAccessToken();
    onTokenRefreshed(newToken);
    return newToken;
  } catch (error) {
    const authError =
      error instanceof AuthenticationError
        ? error
        : new AuthenticationError('Token refresh failed');

    onRefreshFailed(authError);

    // Trigger auth failure callback for any unrecoverable refresh error
    // This includes token expiry, revocation, and other auth failures
    // Network errors are transient and should not force logout
    if (
      authError.code === SESSION_INVALIDATED_CODE ||
      authError.code === 'REFRESH_TOKEN_EXPIRED' ||
      authError.code === 'REFRESH_TOKEN_REVOKED' ||
      authError.code === 'NO_REFRESH_TOKEN' ||
      authError.code === 'INVALID_REFRESH_TOKEN' ||
      authError.code === 'USER_NOT_FOUND' ||
      authError.code === 'ACCOUNT_BANNED'
    ) {
      onAuthFailure?.();
    }

    throw authError;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Make an authenticated API request with automatic token refresh
 */
async function request<T>(path: string, options: RequestInit, skipRefresh = false): Promise<T> {
  // Get auth token from storage
  let token = await TokenService.getAccessToken();

  // Proactive token refresh: if token is expiring soon, refresh it before making the request
  if (token && !skipRefresh) {
    const isExpiringSoon = await TokenService.isAccessTokenExpiringSoon();
    if (isExpiringSoon) {
      try {
        token = await handleTokenRefresh();
      } catch (error) {
        // If proactive refresh fails, continue with current token
        // The reactive refresh logic below will handle it if needed
      }
    }
  }

  // Merge headers safely so Authorization is not dropped when custom headers are provided
  const headers = new Headers({ 'Content-Type': 'application/json' });

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.headers) {
    const incoming = new Headers(options.headers as HeadersInit);
    incoming.forEach((value, key) => headers.set(key, value));
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw buildError(error instanceof Error ? error.message : 'Network error', 0);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => undefined);
    const message = (errorBody as { error?: string | string[] } | undefined)?.error;
    const code = (errorBody as { code?: string } | undefined)?.code;

    // Handle token expiration - attempt refresh and retry
    if (response.status === 401 && code === TOKEN_EXPIRED_CODE && !skipRefresh) {
      try {
        const newToken = await handleTokenRefresh();

        // Retry the original request with new token
        const retryHeaders = new Headers(headers);
        retryHeaders.set('Authorization', `Bearer ${newToken}`);

        const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
          ...options,
          headers: retryHeaders,
        });

        if (!retryResponse.ok) {
          const retryErrorBody = await retryResponse.json().catch(() => undefined);
          const retryMessage = (retryErrorBody as { error?: string | string[] } | undefined)?.error;
          throw buildError(
            retryMessage ?? retryResponse.statusText,
            retryResponse.status,
            retryErrorBody
          );
        }

        return (await retryResponse.json()) as T;
      } catch (refreshError) {
        // If refresh fails, throw the original error or the refresh error
        if (refreshError instanceof AuthenticationError) {
          throw refreshError;
        }
        throw buildError(message ?? response.statusText, response.status, errorBody);
      }
    }

    // For session invalidated or invalid token, trigger auth failure
    if (
      response.status === 401 &&
      (code === SESSION_INVALIDATED_CODE || code === TOKEN_INVALID_CODE)
    ) {
      onAuthFailure?.();
    }

    throw buildError(message ?? response.statusText, response.status, errorBody);
  }

  return (await response.json()) as T;
}

/**
 * Full signup payload for customer signup with all required fields
 */
export interface SignupPayload {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phoneNumber: string;
  birthYear: number;
}

/**
 * Artist signup payload - simplified version without phone/DOB requirements
 * (Artist signup screen will be updated separately to match new design)
 */
export interface ArtistSignupPayload {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  primaryRole: string;
  phoneNumber: string;
  onboardingCompleted: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface GetBookingsParams {
  status?: BookingStatus;
}

export async function createBooking(payload: CreateBookingPayload) {
  return request('/api/v1/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getBookings(params: GetBookingsParams = {}) {
  const query = new URLSearchParams();
  if (params.status) {
    query.append('status', params.status);
  }

  const path = query.size ? `/api/v1/bookings?${query.toString()}` : '/api/v1/bookings';

  return request<BookingSummary[]>(path, {
    method: 'GET',
  });
}

export async function getBookingDetail(bookingId: string) {
  return request<BookingSummary>(`/api/v1/bookings/${bookingId}`, {
    method: 'GET',
  });
}

export interface GetArtistBookingsParams {
  status?: BookingStatus;
}

export async function getArtistBookings(params: GetArtistBookingsParams = {}) {
  const query = new URLSearchParams();
  if (params.status) {
    query.append('status', params.status);
  }

  const path = query.size
    ? `/api/v1/bookings/artist?${query.toString()}`
    : '/api/v1/bookings/artist';

  return request<BookingSummary[]>(path, { method: 'GET' });
}

export async function acceptBooking(bookingId: string) {
  return request<BookingSummary>(`/api/v1/bookings/${bookingId}/accept`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function declineBooking(bookingId: string, reason?: string) {
  return request<BookingSummary>(`/api/v1/bookings/${bookingId}/decline`, {
    method: 'POST',
    body: JSON.stringify(reason ? { reason } : {}),
  });
}

export async function cancelBooking(bookingId: string) {
  return request<BookingSummary>(`/api/v1/bookings/${bookingId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function completeBooking(bookingId: string) {
  try {
    return await request<BookingSummary>(`/api/v1/bookings/${bookingId}/complete`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          throw new AuthenticationError(error.message);
        case 403:
          throw new ForbiddenError('You do not have permission to complete this booking');
        case 404:
          throw new NotFoundError('Booking not found');
        case 409:
          throw new ConflictError('Booking cannot be completed in its current state');
        default:
          throw error;
      }
    }
    throw error;
  }
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  return request<BookingSummary>(`/api/v1/bookings/${bookingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export interface SubmitReviewPayload {
  overallRating: number;
  qualityRating: number;
  professionalismRating: number;
  timelinessRating: number;
  reviewText?: string;
  reviewImageKeys?: Array<{
    s3Key: string;
    fileSize: number;
    mimeType: string;
    displayOrder: number;
  }>;
}

export interface ReviewResponse {
  id: string;
  bookingId: string;
  userId: string;
  overallRating: number;
  qualityRating: number;
  professionalismRating: number;
  timelinessRating: number;
  reviewText?: string;
  reviewImages?: string[];
  createdAt: string;
  updatedAt: string;
}

export async function submitReview(bookingId: string, payload: SubmitReviewPayload) {
  return request<ReviewResponse>(`/api/v1/bookings/${bookingId}/review`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface GetReviewsParams {
  limit?: number;
  offset?: number;
  role?: 'customer' | 'artist';
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  artistId: string;
  overallRating: number;
  qualityRating: number;
  professionalismRating: number;
  timelinessRating: number;
  reviewText?: string | null;
  artistResponse?: string | null;
  reviewImages?: string[];
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetReviewsResponse {
  reviews: Review[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export async function getReviews(params: GetReviewsParams = {}) {
  const query = new URLSearchParams();
  if (params.limit) {
    query.append('limit', params.limit.toString());
  }
  if (params.offset) {
    query.append('offset', params.offset.toString());
  }
  if (params.role) {
    query.append('role', params.role);
  }

  const path = query.size ? `/api/v1/reviews?${query.toString()}` : '/api/v1/reviews';

  return request<GetReviewsResponse>(path, {
    method: 'GET',
  });
}

export interface ReviewStats {
  totalReviews: number;
  averageOverallRating: number;
  averageQualityRating: number;
  averageProfessionalismRating: number;
  averageTimelinessRating: number;
}

export async function getReviewStats() {
  return request<ReviewStats>('/api/v1/reviews/stats', {
    method: 'GET',
  });
}

export interface AvailabilityCheckPayload {
  email?: string;
  phoneNumber?: string;
}

export interface AvailabilityCheckResponse {
  emailAvailable: boolean;
  phoneAvailable: boolean;
}

export async function checkAvailability(
  payload: AvailabilityCheckPayload
): Promise<AvailabilityCheckResponse> {
  return request<AvailabilityCheckResponse>('/api/v1/auth/check-availability', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function signUpUser(payload: SignupPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/api/v1/auth/signup/user', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function signUpArtist(payload: ArtistSignupPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/api/v1/auth/signup/artist', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getOnboardingState(): Promise<OnboardingState> {
  return request<OnboardingState>('/api/v1/onboarding/state', {
    method: 'GET',
  });
}

export async function submitOnboardingResponse(
  payload: OnboardingResponseInput
): Promise<OnboardingState> {
  return request<OnboardingState>('/api/v1/onboarding/responses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function completeOnboarding(): Promise<OnboardingState> {
  return request<OnboardingState>('/api/v1/onboarding/complete', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export interface ArtistSearchParams {
  query?: string;
  occasion?: string;
  serviceType?: string;
}

export async function searchArtists(params: ArtistSearchParams = {}) {
  const query = new URLSearchParams();

  if (params.query) {
    query.append('query', params.query);
  }

  if (params.occasion) {
    query.append('occasion', params.occasion);
  }

  if (params.serviceType) {
    query.append('serviceType', params.serviceType);
  }

  const searchPath = query.toString() ? `/api/v1/artists?${query.toString()}` : '/api/v1/artists';

  return request<ArtistSearchResult[]>(searchPath, {
    method: 'GET',
  });
}

export interface FilteredArtistSearchParams {
  serviceType: 'hair' | 'makeup' | 'combo';
  latitude: number;
  longitude: number;
  dateTime: string; // ISO datetime string
  radiusKm?: number;
}

/**
 * Search artists filtered by location and availability
 * Used by home screen carousels to show nearby available artists
 */
export async function searchArtistsFiltered(params: FilteredArtistSearchParams) {
  const query = new URLSearchParams();
  query.append('serviceType', params.serviceType);
  query.append('lat', params.latitude.toString());
  query.append('lng', params.longitude.toString());
  query.append('dateTime', params.dateTime);

  if (params.radiusKm !== undefined) {
    query.append('radiusKm', params.radiusKm.toString());
  }

  return request<ArtistSearchResult[]>(`/api/v1/artists/search/filtered?${query.toString()}`, {
    method: 'GET',
  });
}

export async function getArtistProfile(): Promise<ArtistProfile> {
  return request('/api/v1/artists/me/profile', { method: 'GET' });
}

export async function getArtistById(artistId: string): Promise<ArtistProfile> {
  return request(`/api/v1/artists/${artistId}`, { method: 'GET' });
}

export async function checkArtistAvailability(
  artistId: string,
  dateTime: string
): Promise<{ isAvailable: boolean }> {
  const query = new URLSearchParams({ dateTime });
  return request(`/api/v1/artists/${artistId}/check-availability?${query.toString()}`, {
    method: 'GET',
  });
}

export async function updateArtistProfile(payload: Partial<ArtistProfile>) {
  return request('/api/v1/artists/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * Get reviews for a specific artist (public endpoint)
 */
export async function getArtistReviews(artistId: string, params: GetReviewsParams = {}) {
  const query = new URLSearchParams();
  if (params.limit) {
    query.append('limit', params.limit.toString());
  }
  if (params.offset) {
    query.append('offset', params.offset.toString());
  }

  const path =
    query.size > 0
      ? `/api/v1/artists/${artistId}/reviews?${query.toString()}`
      : `/api/v1/artists/${artistId}/reviews`;

  return request<GetReviewsResponse>(path, {
    method: 'GET',
  });
}

/**
 * Get review statistics for a specific artist (public endpoint)
 */
export async function getArtistReviewStats(artistId: string) {
  return request<ReviewStats>(`/api/v1/artists/${artistId}/reviews/stats`, {
    method: 'GET',
  });
}

export interface PresignUploadResponse {
  uploadUrl: string;
  key: string;
  bucket: string;
  publicUrl: string;
  contentType: string;
  maxBytes: number;
}

export async function presignProfilePhoto(
  contentType: string,
  contentLength: number
): Promise<PresignUploadResponse> {
  return request('/api/v1/uploads/profile-photo/presign', {
    method: 'POST',
    headers: {
      'X-Upload-Content-Type': contentType,
      'X-Upload-Content-Length': String(contentLength),
    },
    body: JSON.stringify({ contentType, contentLength }),
  });
}

// === Notifications API ===

export interface NotificationPreferences {
  bookingCreated: boolean;
  bookingConfirmed: boolean;
  bookingDeclined: boolean;
  bookingCancelled: boolean;
  bookingInProgress: boolean;
  bookingCompleted: boolean;
  newMessage: boolean;
  marketing: boolean;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  readAt: string | null;
  createdAt: string;
}

export async function getNotificationPreferences(): Promise<{
  preferences: NotificationPreferences;
}> {
  return request('/api/v1/notifications/preferences', { method: 'GET' });
}

export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<{ preferences: NotificationPreferences }> {
  return request('/api/v1/notifications/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  });
}

export interface GetNotificationsParams {
  limit?: number;
  offset?: number;
}

export interface GetNotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  hasMore: boolean;
}

export async function getNotifications(
  params: GetNotificationsParams = {}
): Promise<GetNotificationsResponse> {
  const query = new URLSearchParams();
  if (params.limit) {
    query.append('limit', params.limit.toString());
  }
  if (params.offset) {
    query.append('offset', params.offset.toString());
  }

  const path = query.size ? `/api/v1/notifications?${query.toString()}` : '/api/v1/notifications';
  return request(path, { method: 'GET' });
}

export async function getUnreadNotificationCount(): Promise<{ unreadCount: number }> {
  return request('/api/v1/notifications/unread-count', { method: 'GET' });
}

export async function markNotificationAsRead(
  id: string
): Promise<{ notification: NotificationItem }> {
  return request(`/api/v1/notifications/${id}/read`, { method: 'POST' });
}

export async function markAllNotificationsAsRead(): Promise<{
  success: boolean;
  markedCount: number;
}> {
  return request('/api/v1/notifications/read-all', { method: 'POST' });
}

// Artist Availability API
export interface AvailabilityData {
  weekId: string;
  slots: string[];
  updatedAt: string | null;
}

export interface AvailabilityResponse {
  data: AvailabilityData;
}

/**
 * Get the authenticated artist's availability for a specific week
 * @param weekId - ISO week ID (e.g., "2026-W07")
 */
export async function getArtistAvailability(weekId: string): Promise<AvailabilityResponse> {
  return request(`/api/v1/artists/me/availability/${weekId}`, { method: 'GET' });
}

/**
 * Update the authenticated artist's availability for a specific week
 * @param weekId - ISO week ID (e.g., "2026-W07")
 * @param slots - Array of ISO datetime strings representing selected time slots
 */
export async function updateArtistAvailability(
  weekId: string,
  slots: string[]
): Promise<AvailabilityResponse> {
  return request(`/api/v1/artists/me/availability/${weekId}`, {
    method: 'PUT',
    body: JSON.stringify({ slots }),
  });
}

// Axios-like API client for compatibility
export const apiClient = {
  async get<T>(path: string, config?: { params?: Record<string, string> }): Promise<T> {
    const url = config?.params ? `${path}?${new URLSearchParams(config.params)}` : path;
    return request<T>(url, { method: 'GET' });
  },

  async post<T>(path: string, data?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put<T>(path: string, data?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' });
  },
};
