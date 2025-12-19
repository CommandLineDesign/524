/**
 * Utility functions for pagination parameter parsing
 */

/**
 * Parse pagination parameters from query string with validation and defaults
 */
export function parsePaginationParams(
  query: { limit?: string; offset?: string },
  defaults = { limit: 20, maxLimit: 50 }
) {
  const rawLimit = Number(query.limit);
  const rawOffset = Number(query.offset);
  return {
    limit: Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), defaults.maxLimit)
      : defaults.limit,
    offset: Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0,
  };
}
