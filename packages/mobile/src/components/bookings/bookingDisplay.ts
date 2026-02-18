import type { BookingStatus } from '@524/shared';

import { formatLocalDate, formatTimeRange, parseISO } from '../../utils/dateDisplay';

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: '대기',
  declined: '거절됨',
  confirmed: '확정',
  in_progress: '진행 중',
  completed: '완료',
  cancelled: '취소됨',
};

export function formatCurrency(amount?: number) {
  if (typeof amount !== 'number') return '-';
  return `${amount.toLocaleString('ko-KR')}원`;
}

/**
 * Format booking schedule for display.
 * Converts UTC timestamps to device's local timezone.
 */
export function formatSchedule(dateIso?: string, startIso?: string, endIso?: string) {
  if (!dateIso && !startIso) return '일정 미정';
  const start = startIso ?? dateIso;

  if (!start) return '일정 미정';

  try {
    const dateStr = formatLocalDate(start, 'yyyy.MM.dd');
    const startTime = formatLocalDate(start, 'HH:mm');

    if (endIso) {
      const endTime = formatLocalDate(endIso, 'HH:mm');
      return `${dateStr} ${startTime} - ${endTime}`;
    }

    return `${dateStr} ${startTime}`;
  } catch {
    return '일정 미정';
  }
}

/**
 * Format status change timestamp for display.
 * Converts UTC timestamp to device's local timezone.
 */
export function formatStatusTimestamp(iso?: string) {
  if (!iso) return '시간 정보 없음';

  try {
    return formatLocalDate(iso, 'yyyy.MM.dd HH:mm');
  } catch {
    return iso;
  }
}

export function summarizeServices(services: { name: string }[]) {
  const primary = services?.[0]?.name ?? '서비스 정보 없음';
  const extraCount = Math.max((services?.length ?? 0) - 1, 0);
  return extraCount > 0 ? `${primary} 외 ${extraCount}건` : primary;
}
