import type {
  ArtistSearchResult,
  CreateBookingPayload,
  OnboardingResponseInput,
  OnboardingState,
} from '@524/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5240';

async function request<T>(path: string, options: RequestInit): Promise<T> {
  // Get auth token from storage
  const token = await AsyncStorage.getItem('auth_token');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
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

export async function createBooking(payload: CreateBookingPayload) {
  return request('/api/v1/bookings', {
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
