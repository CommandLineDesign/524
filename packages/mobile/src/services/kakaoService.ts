import { apiClient } from '../api/client';
import type { GeocodingResult, KeywordSearchResult, ReverseGeocodeResult } from '../types/kakao';

/**
 * Geocode a Korean address to coordinates using the backend proxy
 * @param address The address to geocode
 * @returns GeocodingResult with lat/lng or null if not found
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const result = await apiClient.post<GeocodingResult>('/api/v1/geocode', { address });
    return result;
  } catch {
    return null;
  }
}

interface KeywordSearchResponse {
  results: KeywordSearchResult[];
}

/**
 * Search for places by keyword using the backend proxy
 * @param query The search query (place name, address, etc.)
 * @param coords Optional coordinates to bias search results towards
 * @returns Array of search results
 */
export async function searchKeyword(
  query: string,
  coords?: { latitude: number; longitude: number }
): Promise<KeywordSearchResult[]> {
  try {
    const body: { query: string; x?: string; y?: string } = { query };

    if (coords) {
      body.x = coords.longitude.toString();
      body.y = coords.latitude.toString();
    }

    const result = await apiClient.post<KeywordSearchResponse>(
      '/api/v1/geocode/keyword-search',
      body
    );
    return result.results;
  } catch {
    return [];
  }
}

/**
 * Reverse geocode coordinates to an address using the backend proxy
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns ReverseGeocodeResult with address or null if not found
 */
export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  try {
    const result = await apiClient.post<ReverseGeocodeResult>('/api/v1/geocode/reverse', {
      latitude,
      longitude,
    });
    return result;
  } catch {
    return null;
  }
}
