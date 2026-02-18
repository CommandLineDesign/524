/**
 * Date display utilities for the mobile client.
 *
 * PRINCIPLE: All timestamps from the API are in UTC (ISO 8601 format).
 * These utilities convert UTC to the device's local timezone for display.
 * JavaScript's Date object automatically handles this conversion.
 */

import { parseISO as dateFnsParseISO, format } from 'date-fns';

/**
 * Parse an ISO string to a Date object.
 * The resulting Date object represents the same moment in time,
 * and can be formatted in the device's local timezone.
 */
export function parseISO(isoString: string): Date {
  return dateFnsParseISO(isoString);
}

/**
 * Format a UTC ISO string for display in the device's local timezone.
 * @param isoString - UTC ISO 8601 date string from API
 * @param formatStr - date-fns format string (e.g., 'yyyy-MM-dd', 'HH:mm')
 * @returns Formatted string in device's local timezone
 */
export function formatLocalDate(isoString: string, formatStr: string): string {
  const date = parseISO(isoString);
  return format(date, formatStr);
}

/**
 * Format a date for Korean display (월/일 format).
 * @param isoString - UTC ISO 8601 date string from API
 * @returns Formatted string like "2월 10일"
 */
export function formatKoreanDate(isoString: string): string {
  const date = parseISO(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
}

/**
 * Format a date with day of week for Korean display.
 * @param isoString - UTC ISO 8601 date string from API
 * @returns Formatted string like "2월 10일 (월)"
 */
export function formatKoreanDateWithDay(isoString: string): string {
  const date = parseISO(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = dayNames[date.getDay()];
  return `${month}월 ${day}일 (${dayOfWeek})`;
}

/**
 * Format time for Korean display with AM/PM.
 * @param isoString - UTC ISO 8601 date string from API
 * @returns Formatted string like "오후 2:30"
 */
export function formatKoreanTime(isoString: string): string {
  const date = parseISO(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? '오전' : '오후';
  const displayHours = hours % 12 || 12;
  return `${period} ${displayHours}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Format a full date and time for Korean display.
 * @param isoString - UTC ISO 8601 date string from API
 * @returns Formatted string like "2월 10일 (월), 오후 2:30"
 */
export function formatKoreanDateTime(isoString: string): string {
  return `${formatKoreanDateWithDay(isoString)}, ${formatKoreanTime(isoString)}`;
}

/**
 * Format a date for standard display (YYYY.MM.DD).
 * @param isoString - UTC ISO 8601 date string from API
 * @returns Formatted string like "2026.02.10"
 */
export function formatStandardDate(isoString: string): string {
  const date = parseISO(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * Format a relative time (e.g., "2시간 전", "3일 전").
 * @param isoString - UTC ISO 8601 date string from API
 * @returns Formatted relative time string in Korean
 */
export function formatRelativeTime(isoString: string): string {
  const date = parseISO(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return '방금 전';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }
  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }

  // For older dates, show the actual date
  return formatStandardDate(isoString);
}

/**
 * Format a time range for display.
 * @param startIso - UTC ISO 8601 date string for start time
 * @param endIso - UTC ISO 8601 date string for end time
 * @returns Formatted string like "오후 2:00 - 오후 4:00"
 */
export function formatTimeRange(startIso: string, endIso: string): string {
  return `${formatKoreanTime(startIso)} - ${formatKoreanTime(endIso)}`;
}
