import type {
  ArtistProfile,
  ArtistSearchResult,
  BookingStatus,
  BookingSummary,
  CreateBookingPayload,
  OnboardingResponseInput,
  OnboardingState,
} from '@524/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5240';

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401);
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
  return new ApiError(normalizedMessage || 'Request failed', status, body);
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  // Get auth token from storage
  const token = await AsyncStorage.getItem('auth_token');

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
    throw buildError(message ?? response.statusText, response.status, errorBody);
  }

  return (await response.json()) as T;
}

export interface SignupPayload {
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
  token: string;
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
  reviewImages?: string[];
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

export async function signUpUser(payload: SignupPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/api/v1/auth/signup/user', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function signUpArtist(payload: SignupPayload): Promise<AuthResponse> {
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

export async function getArtistProfile(): Promise<ArtistProfile> {
  return request('/api/v1/artists/me/profile', { method: 'GET' });
}

export async function updateArtistProfile(payload: Partial<ArtistProfile>) {
  return request('/api/v1/artists/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
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
