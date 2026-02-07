/**
 * Shared geocoding types for Kakao Maps integration.
 * Used by both mobile and API packages.
 */

/**
 * Result from the geocoding API (address to coordinates)
 */
export interface GeocodingResult {
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Primary address string */
  address: string;
  /** Road-based address if available */
  roadAddress?: string;
  /** Jibun (lot-number) address if available */
  jibunAddress?: string;
}

/**
 * Result from keyword search API
 */
export interface KeywordSearchResult {
  /** Unique place ID */
  id: string;
  /** Place name (e.g., "스타벅스 역삼역점") */
  placeName: string;
  /** Address (jibun-based) */
  addressName: string;
  /** Road address if available */
  roadAddressName?: string;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Category name (e.g., "음식점 > 카페") */
  category?: string;
  /** Phone number */
  phone?: string;
}

/**
 * Result from reverse geocoding API (coordinates to address)
 */
export interface ReverseGeocodeResult {
  /** Primary address string */
  address: string;
  /** Road-based address if available */
  roadAddress?: string;
  /** Province/Metropolitan city (e.g., "서울특별시") */
  region1: string;
  /** City/District (e.g., "강남구") */
  region2: string;
  /** Neighborhood name (e.g., "역삼동") */
  region3: string;
}

/**
 * Result returned from MapAddressPicker when user confirms location
 */
export interface MapAddressPickerResult {
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Primary address string */
  address: string;
  /** Road-based address if available */
  roadAddress?: string;
  /** Jibun (lot-number) address if available */
  jibunAddress?: string;
  /** Detail address (unit/apt number, e.g., "101동 1403호") */
  detailAddress?: string;
}

/**
 * Location data structure for input (address can be optional).
 * Used by LocationPicker and related components.
 */
export interface LocationData {
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Address string (optional for input) */
  address?: string;
  /** Detail address (unit/apt number, e.g., "101동 1403호") */
  detailAddress?: string;
}

/**
 * Location data structure for output (address is always present).
 * Used when location is confirmed and address has been resolved.
 */
export interface LocationDataWithAddress {
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Address string (always present) */
  address: string;
  /** Detail address (unit/apt number, e.g., "101동 1403호") */
  detailAddress?: string;
}
