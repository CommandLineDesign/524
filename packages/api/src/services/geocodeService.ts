import axios from 'axios';

import type { GeocodingResult, KeywordSearchResult, ReverseGeocodeResult } from '@524/shared';

import { createLogger } from '../utils/logger.js';
import {
  cacheFound,
  cacheNotFound,
  geocodeCache,
  keywordCache,
  makeKeywordSearchKey,
  makeReverseGeocodeKey,
  reverseGeocodeCache,
} from './geocodeCache.js';

const logger = createLogger('geocode-service');

// Re-export types for backward compatibility
export type { GeocodingResult, KeywordSearchResult, ReverseGeocodeResult } from '@524/shared';

interface KakaoAddressDocument {
  address_name: string;
  address_type: 'REGION' | 'ROAD' | 'REGION_ADDR' | 'ROAD_ADDR';
  x: string;
  y: string;
  address?: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    region_3depth_h_name: string;
    h_code: string;
    b_code: string;
    mountain_yn: string;
    main_address_no: string;
    sub_address_no: string;
    x: string;
    y: string;
  };
  road_address?: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    road_name: string;
    underground_yn: string;
    main_building_no: string;
    sub_building_no: string;
    building_name: string;
    zone_no: string;
    x: string;
    y: string;
  };
}

interface KakaoAddressResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: KakaoAddressDocument[];
}

interface KakaoKeywordDocument {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance: string;
}

interface KakaoKeywordResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
    same_name?: {
      region: string[];
      keyword: string;
      selected_region: string;
    };
  };
  documents: KakaoKeywordDocument[];
}

interface KakaoCoord2AddressDocument {
  road_address?: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    road_name: string;
    underground_yn: string;
    main_building_no: string;
    sub_building_no: string;
    building_name: string;
    zone_no: string;
  };
  address: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    mountain_yn: string;
    main_address_no: string;
    sub_address_no: string;
  };
}

interface KakaoCoord2AddressResponse {
  meta: {
    total_count: number;
  };
  documents: KakaoCoord2AddressDocument[];
}

const KAKAO_API_BASE = 'https://dapi.kakao.com/v2/local';

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  // Check cache first
  const cached = geocodeCache.get(address);
  if (cached !== undefined) {
    logger.debug({ cacheHit: true, found: cached.found }, 'Geocode cache hit');
    return cached.data ?? null;
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    throw new Error('KAKAO_REST_API_KEY is not configured');
  }

  try {
    const response = await axios.get<KakaoAddressResponse>(
      `${KAKAO_API_BASE}/search/address.json`,
      {
        params: { query: address },
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      }
    );

    const { documents } = response.data;

    if (!documents || documents.length === 0) {
      logger.debug('No geocode results found, caching negative result');
      // Cache "not found" result to avoid repeated lookups for non-existent addresses
      geocodeCache.set(address, cacheNotFound());
      return null;
    }

    const doc = documents[0];
    const longitude = Number.parseFloat(doc.x);
    const latitude = Number.parseFloat(doc.y);

    const result: GeocodingResult = {
      latitude,
      longitude,
      address: doc.address_name,
      roadAddress: doc.road_address?.address_name,
      jibunAddress: doc.address?.address_name,
    };

    // Cache the result
    geocodeCache.set(address, cacheFound(result));
    logger.debug('Geocode result cached');

    return result;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      logger.error({ status: error.response?.status }, 'Kakao geocode API error');
    } else {
      logger.error({ err: error }, 'Unexpected geocode error');
    }
    return null;
  }
}

export interface KeywordSearchOptions {
  x?: string;
  y?: string;
  page?: number;
  size?: number;
}

export async function keywordSearch(
  query: string,
  options?: KeywordSearchOptions
): Promise<KeywordSearchResult[]> {
  // Generate cache key
  const cacheKey = makeKeywordSearchKey(
    query,
    options?.x,
    options?.y,
    options?.page,
    options?.size
  );

  // Check cache first
  if (keywordCache.has(cacheKey)) {
    logger.debug({ cacheHit: true }, 'Keyword search cache hit');
    return keywordCache.get(cacheKey) ?? [];
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    throw new Error('KAKAO_REST_API_KEY is not configured');
  }

  try {
    const params: Record<string, string | number> = {
      query,
      size: options?.size ?? 10,
      page: options?.page ?? 1,
    };

    if (options?.x && options?.y) {
      params.x = options.x;
      params.y = options.y;
      params.sort = 'distance';
    }

    const response = await axios.get<KakaoKeywordResponse>(
      `${KAKAO_API_BASE}/search/keyword.json`,
      {
        params,
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      }
    );

    const { documents } = response.data;

    if (!documents || documents.length === 0) {
      // Cache empty results
      keywordCache.set(cacheKey, []);
      return [];
    }

    const results: KeywordSearchResult[] = documents.map((doc: KakaoKeywordDocument) => ({
      id: doc.id,
      placeName: doc.place_name,
      addressName: doc.address_name,
      roadAddressName: doc.road_address_name || undefined,
      latitude: Number.parseFloat(doc.y),
      longitude: Number.parseFloat(doc.x),
      category: doc.category_name || undefined,
      phone: doc.phone || undefined,
    }));

    // Cache the results
    keywordCache.set(cacheKey, results);
    logger.debug({ resultCount: results.length }, 'Keyword search results cached');

    return results;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      logger.error({ status: error.response?.status }, 'Kakao keyword search API error');
    } else {
      logger.error({ err: error }, 'Unexpected keyword search error');
    }
    return [];
  }
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  // Generate cache key with 5 decimal precision (~1 meter)
  const cacheKey = makeReverseGeocodeKey(latitude, longitude);

  // Check cache first
  const cached = reverseGeocodeCache.get(cacheKey);
  if (cached !== undefined) {
    logger.debug({ cacheHit: true, found: cached.found }, 'Reverse geocode cache hit');
    return cached.data ?? null;
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    throw new Error('KAKAO_REST_API_KEY is not configured');
  }

  try {
    const response = await axios.get<KakaoCoord2AddressResponse>(
      `${KAKAO_API_BASE}/geo/coord2address.json`,
      {
        params: {
          x: longitude.toString(),
          y: latitude.toString(),
        },
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      }
    );

    const { documents } = response.data;

    if (!documents || documents.length === 0) {
      logger.debug('No reverse geocode results found, caching negative result');
      // Cache "not found" result
      reverseGeocodeCache.set(cacheKey, cacheNotFound());
      return null;
    }

    const doc = documents[0];
    const addr = doc.address;

    const result: ReverseGeocodeResult = {
      address: addr.address_name,
      roadAddress: doc.road_address?.address_name,
      region1: addr.region_1depth_name,
      region2: addr.region_2depth_name,
      region3: addr.region_3depth_name,
    };

    // Cache the result
    reverseGeocodeCache.set(cacheKey, cacheFound(result));
    logger.debug('Reverse geocode result cached');

    return result;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      logger.error({ status }, 'Kakao reverse geocode API error');

      // Check for specific Kakao API permission errors
      const errorData = error.response?.data as
        | { errorType?: string; message?: string }
        | undefined;
      if (status === 403 && errorData?.errorType === 'NotAuthorizedError') {
        logger.error(
          'CRITICAL: Kakao API key does not have OPEN_MAP_AND_LOCAL service enabled. Please enable this service in Kakao Developers Console: https://developers.kakao.com'
        );
      }
    } else {
      logger.error({ err: error }, 'Unexpected reverse geocode error');
    }
    return null;
  }
}
