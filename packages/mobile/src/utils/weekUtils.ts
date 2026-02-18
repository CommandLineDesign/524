import {
  addDays,
  addWeeks,
  format,
  getISOWeek,
  getISOWeekYear,
  parse,
  setISOWeek,
  setISOWeekYear,
  startOfISOWeek,
  subWeeks,
} from 'date-fns';

/**
 * Time slots for availability grid (00:00 to 23:30 in 30-minute increments)
 * Full 24-hour coverage to allow artists to be available at any time
 */
export const TIME_SLOTS = [
  '00:00',
  '00:30',
  '01:00',
  '01:30',
  '02:00',
  '02:30',
  '03:00',
  '03:30',
  '04:00',
  '04:30',
  '05:00',
  '05:30',
  '06:00',
  '06:30',
  '07:00',
  '07:30',
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
  '22:30',
  '23:00',
  '23:30',
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

/**
 * Day names for the availability grid (Monday = 0, Sunday = 6)
 */
export const DAY_NAMES_KO = ['월', '화', '수', '목', '금', '토', '일'] as const;
export const DAY_NAMES_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/**
 * Get ISO week ID from a date (e.g., "2026-W07")
 */
export function getISOWeekId(date: Date): string {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * Parse an ISO week ID back to a date (returns Monday of that week)
 */
export function parseWeekId(weekId: string): Date {
  const match = weekId.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid week ID format: ${weekId}`);
  }
  const year = Number.parseInt(match[1], 10);
  const week = Number.parseInt(match[2], 10);

  // Start with January 4th of the year (always in week 1)
  let date = new Date(year, 0, 4);
  date = setISOWeekYear(date, year);
  date = setISOWeek(date, week);
  date = startOfISOWeek(date);

  return date;
}

/**
 * Get the date range for a given week ID
 */
export function getWeekRange(weekId: string): { start: Date; end: Date } {
  const monday = parseWeekId(weekId);
  const sunday = addDays(monday, 6);
  return { start: monday, end: sunday };
}

/**
 * Format a week ID for display (e.g., "2/10 - 2/16")
 */
export function formatWeekDisplay(weekId: string): string {
  const { start, end } = getWeekRange(weekId);
  const startStr = format(start, 'M/d');
  const endStr = format(end, 'M/d');
  return `${startStr} - ${endStr}`;
}

/**
 * Get the previous week's ID
 */
export function getPreviousWeekId(weekId: string): string {
  const monday = parseWeekId(weekId);
  const prevMonday = subWeeks(monday, 1);
  return getISOWeekId(prevMonday);
}

/**
 * Get the next week's ID
 */
export function getNextWeekId(weekId: string): string {
  const monday = parseWeekId(weekId);
  const nextMonday = addWeeks(monday, 1);
  return getISOWeekId(nextMonday);
}

/**
 * Get the current week's ID
 */
export function getCurrentWeekId(): string {
  return getISOWeekId(new Date());
}

/**
 * Convert a grid cell (row, column) to an ISO datetime string.
 *
 * The returned string uses KST timezone (+09:00) because:
 * 1. The UI displays times in Korean local time for user convenience
 * 2. The server normalizes all slots to UTC for storage and comparison
 * 3. This approach allows the same slot to represent "9 AM Korean time"
 *    regardless of the server's timezone
 *
 * @param weekId The week ID (e.g., "2026-W07")
 * @param dayIndex Day index (0 = Monday, 6 = Sunday)
 * @param slotIndex Time slot index (0 = 08:00, 1 = 08:30, etc.)
 * @returns ISO datetime string with KST timezone (e.g., "2026-02-10T09:00:00+09:00")
 */
export function cellToSlotKey(weekId: string, dayIndex: number, slotIndex: number): string {
  const monday = parseWeekId(weekId);
  const date = addDays(monday, dayIndex);
  const timeSlot = TIME_SLOTS[slotIndex];
  const [hours, minutes] = timeSlot.split(':').map(Number);

  // Format as ISO string with KST timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+09:00`;
}

/**
 * Parse a slot key back to grid coordinates
 * @param slotKey ISO datetime string (e.g., "2026-02-10T09:00:00+09:00")
 * @returns Object with weekId, dayIndex, slotIndex, or null if invalid
 */
export function slotKeyToCell(
  slotKey: string
): { weekId: string; dayIndex: number; slotIndex: number } | null {
  try {
    // Parse the datetime - handle both +09:00 and Z formats
    const dateStr = slotKey.substring(0, 10); // "2026-02-10"
    const timeStr = slotKey.substring(11, 16); // "09:00"

    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    const weekId = getISOWeekId(date);

    // Calculate day index (Monday = 0)
    const monday = parseWeekId(weekId);
    const dayIndex = Math.round((date.getTime() - monday.getTime()) / (24 * 60 * 60 * 1000));

    // Find slot index
    const slotIndex = TIME_SLOTS.indexOf(timeStr as TimeSlot);

    if (dayIndex < 0 || dayIndex > 6 || slotIndex === -1) {
      return null;
    }

    return { weekId, dayIndex, slotIndex };
  } catch {
    return null;
  }
}

/**
 * Generate all slot keys for standard work hours (Mon-Fri, 9am-5pm)
 * @param weekId The week ID
 * @returns Array of slot keys for weekday 9-5 hours
 */
export function getWeekdayWorkHoursSlots(weekId: string): string[] {
  const slots: string[] = [];

  // Monday (0) through Friday (4)
  for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
    // 09:00 (index 18) through 16:30 (index 33) - covers 9am to 5pm
    // Note: 17:00 slot starts at 5pm and ends at 5:30pm, so we stop at 16:30
    for (let slotIndex = 18; slotIndex <= 33; slotIndex++) {
      slots.push(cellToSlotKey(weekId, dayIndex, slotIndex));
    }
  }

  return slots;
}

/**
 * Calculate total hours from a set of slots
 * @param slots Set of slot keys
 * @returns Total hours (each slot is 30 minutes)
 */
export function calculateTotalHours(slots: Set<string> | string[]): number {
  const count = slots instanceof Set ? slots.size : slots.length;
  return count * 0.5;
}

/**
 * Check if a day index is a weekend (Saturday = 5, Sunday = 6)
 */
export function isWeekend(dayIndex: number): boolean {
  return dayIndex === 5 || dayIndex === 6;
}
