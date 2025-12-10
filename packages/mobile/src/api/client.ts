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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.error ?? response.statusText;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
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
