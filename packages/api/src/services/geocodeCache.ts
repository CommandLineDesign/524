import { LRUCache } from 'lru-cache';

import type { GeocodingResult, KeywordSearchResult, ReverseGeocodeResult } from '@524/shared';

import { env } from '../config/env.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('geocode-cache');

// Track cache statistics
let cacheStatsInterval: ReturnType<typeof setInterval> | null = null;

// Cache configuration
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 1000;

/**
 * Wrapper type for cacheable results that may be "not found".
 * Using a wrapper allows us to distinguish between "not in cache" and "cached as not found".
 */
interface CacheEntry<T> {
  found: boolean;
  data: T | undefined;
}

/**
 * LRU cache for address-to-coordinates geocoding results.
 * Key: address string
 * Value: CacheEntry wrapping GeocodingResult
 */
export const geocodeCache = new LRUCache<string, CacheEntry<GeocodingResult>>({
  max: MAX_ENTRIES,
  ttl: CACHE_TTL_MS,
});

/**
 * LRU cache for coordinates-to-address reverse geocoding results.
 * Key: "lat,lng" string with 5 decimal precision
 * Value: CacheEntry wrapping ReverseGeocodeResult
 */
export const reverseGeocodeCache = new LRUCache<string, CacheEntry<ReverseGeocodeResult>>({
  max: MAX_ENTRIES,
  ttl: CACHE_TTL_MS,
});

/**
 * LRU cache for keyword search results.
 * Key: query string (optionally with coordinates)
 * Value: array of KeywordSearchResult (empty array for no results)
 */
export const keywordCache = new LRUCache<string, KeywordSearchResult[]>({
  max: MAX_ENTRIES,
  ttl: CACHE_TTL_MS,
});

/**
 * Helper to create a cache entry for a found result.
 */
export function cacheFound<T>(data: T): CacheEntry<T> {
  return { found: true, data };
}

/**
 * Helper to create a cache entry for a "not found" result.
 */
export function cacheNotFound<T>(): CacheEntry<T> {
  return { found: false, data: undefined };
}

/**
 * Generate a cache key for reverse geocoding.
 * Uses 5 decimal places (~1 meter precision) to allow for minor coordinate variations.
 */
export function makeReverseGeocodeKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
}

/**
 * Generate a cache key for keyword search.
 * Includes optional coordinates for location-aware searches.
 */
export function makeKeywordSearchKey(
  query: string,
  x?: string,
  y?: string,
  page?: number,
  size?: number
): string {
  const parts = [query];
  if (x && y) {
    parts.push(`@${x},${y}`);
  }
  if (page) {
    parts.push(`p${page}`);
  }
  if (size) {
    parts.push(`s${size}`);
  }
  return parts.join(':');
}

/**
 * Get cache statistics for monitoring.
 */
export function getCacheStats() {
  return {
    geocode: {
      size: geocodeCache.size,
      maxSize: MAX_ENTRIES,
    },
    reverseGeocode: {
      size: reverseGeocodeCache.size,
      maxSize: MAX_ENTRIES,
    },
    keyword: {
      size: keywordCache.size,
      maxSize: MAX_ENTRIES,
    },
    ttlMs: CACHE_TTL_MS,
  };
}

/**
 * Log cache statistics for monitoring.
 */
export function logCacheStats(): void {
  logger.info(getCacheStats(), 'Geocode cache statistics');
}

/**
 * Start periodic cache statistics logging.
 * Interval is configurable via GEOCODE_CACHE_STATS_INTERVAL_MS environment variable.
 * Default: 5 minutes (300000ms). Set to 0 to disable.
 */
export function startCacheStatsLogging(): void {
  const intervalMs = env.GEOCODE_CACHE_STATS_INTERVAL_MS;

  if (intervalMs <= 0) {
    logger.debug('Geocode cache stats logging disabled (interval <= 0)');
    return;
  }

  if (cacheStatsInterval) {
    logger.debug('Geocode cache stats logging already started');
    return;
  }

  cacheStatsInterval = setInterval(() => {
    logCacheStats();
  }, intervalMs);

  // Don't prevent process from exiting
  cacheStatsInterval.unref();

  logger.info({ intervalMs }, 'Geocode cache stats logging started');
}

/**
 * Stop periodic cache statistics logging.
 */
export function stopCacheStatsLogging(): void {
  if (cacheStatsInterval) {
    clearInterval(cacheStatsInterval);
    cacheStatsInterval = null;
    logger.debug('Geocode cache stats logging stopped');
  }
}
