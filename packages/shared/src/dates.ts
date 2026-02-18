import { z } from 'zod';

/**
 * Shared date/time utilities for consistent UTC-based date handling.
 *
 * PRINCIPLE: UTC everywhere on the server, localize only in the client for display.
 * - All timestamps stored in database as UTC
 * - All API operations use UTC
 * - Client converts to local timezone only for display
 */

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if a string is a valid ISO 8601 date-time string
 */
export function isValidISOString(value: string): boolean {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

/**
 * Zod schema for ISO 8601 date-time strings
 */
export const isoDateTimeSchema = z.string().refine(isValidISOString, {
  message: 'Invalid ISO 8601 date-time string',
});

/**
 * Zod schema for ISO 8601 date strings (YYYY-MM-DD)
 */
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Invalid date format. Expected YYYY-MM-DD',
});

// ============================================================================
// Parsing and Formatting
// ============================================================================

/**
 * Parse an ISO string to a Date object, with validation
 * @throws Error if the string is not a valid ISO date
 */
export function parseISO(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date string: ${value}`);
  }
  return date;
}

/**
 * Format a Date to an ISO 8601 UTC string
 */
export function toUTCString(date: Date): string {
  return date.toISOString();
}

/**
 * Get current time as ISO 8601 UTC string
 */
export function nowUTC(): string {
  return new Date().toISOString();
}

// ============================================================================
// ISO Week Calculations (UTC-based)
// ============================================================================

/**
 * Get ISO week number for a date (UTC-based)
 * ISO weeks start on Monday, and week 1 contains January 4th
 */
export function getUTCISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // Set to nearest Thursday: current date + 4 - current day number (Monday = 1, Sunday = 7)
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
}

/**
 * Get ISO week year (may differ from calendar year at year boundaries)
 */
export function getUTCISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

/**
 * Get ISO week ID from a date (format: "YYYY-Www")
 * Uses UTC to ensure consistency across timezones
 */
export function getUTCWeekId(date: Date): string {
  const year = getUTCISOWeekYear(date);
  const week = getUTCISOWeek(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * Parse a week ID back to a Date (start of that ISO week, Monday at 00:00 UTC)
 */
export function parseWeekId(weekId: string): Date {
  const match = weekId.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid week ID format: ${weekId}. Expected YYYY-Www`);
  }
  const year = Number.parseInt(match[1], 10);
  const week = Number.parseInt(match[2], 10);

  // January 4th is always in week 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  // Get Monday of week 1
  const week1Monday = new Date(jan4.getTime() - (jan4Day - 1) * 86400000);
  // Add weeks
  return new Date(week1Monday.getTime() + (week - 1) * 7 * 86400000);
}

// ============================================================================
// UTC Date Arithmetic
// ============================================================================

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * Add days to a date (UTC-based)
 */
export function addUTCDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/**
 * Add hours to a date (UTC-based)
 */
export function addUTCHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * MS_PER_HOUR);
}

/**
 * Add minutes to a date (UTC-based)
 */
export function addUTCMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MS_PER_MINUTE);
}

/**
 * Add weeks to a date (UTC-based)
 */
export function addUTCWeeks(date: Date, weeks: number): Date {
  return new Date(date.getTime() + weeks * 7 * MS_PER_DAY);
}

// ============================================================================
// UTC Day Boundaries
// ============================================================================

/**
 * Get start of day in UTC (00:00:00.000Z)
 */
export function startOfUTCDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Get end of day in UTC (23:59:59.999Z)
 */
export function endOfUTCDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999)
  );
}

/**
 * Get start of week (Monday) in UTC
 */
export function startOfUTCWeek(date: Date): Date {
  const d = startOfUTCDay(date);
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday = 1, Sunday = 0 -> -6
  return addUTCDays(d, diff);
}

/**
 * Get end of week (Sunday) in UTC
 */
export function endOfUTCWeek(date: Date): Date {
  const start = startOfUTCWeek(date);
  return endOfUTCDay(addUTCDays(start, 6));
}

// ============================================================================
// Comparison Utilities
// ============================================================================

/**
 * Check if a date is after another date
 */
export function isAfter(date: Date, dateToCompare: Date): boolean {
  return date.getTime() > dateToCompare.getTime();
}

/**
 * Check if a date is before another date
 */
export function isBefore(date: Date, dateToCompare: Date): boolean {
  return date.getTime() < dateToCompare.getTime();
}

/**
 * Check if two dates are the same day (UTC)
 */
export function isSameUTCDay(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

// ============================================================================
// Timezone Normalization
// ============================================================================

/**
 * Normalize an ISO string to UTC format.
 * Handles strings with various timezone offsets (e.g., "+09:00", "Z", no offset).
 * Returns the same moment in time as a UTC ISO string.
 *
 * Example:
 *   "2026-02-10T09:00:00+09:00" -> "2026-02-10T00:00:00.000Z"
 */
export function normalizeToUTC(isoString: string): string {
  try {
    return new Date(isoString).toISOString();
  } catch {
    // Return original if parsing fails
    return isoString;
  }
}

/**
 * Normalize an array of ISO strings to UTC format.
 * Useful for comparing availability slots stored with various timezone offsets.
 */
export function normalizeArrayToUTC(isoStrings: string[]): string[] {
  return isoStrings.map(normalizeToUTC);
}
