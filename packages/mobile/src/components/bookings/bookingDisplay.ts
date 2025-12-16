import type { BookingStatus } from '@524/shared';

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: '대기',
  declined: '거절됨',
  confirmed: '확정',
  paid: '결제 완료',
  in_progress: '진행 중',
  completed: '완료',
  cancelled: '취소됨',
};

export function formatCurrency(amount?: number) {
  if (typeof amount !== 'number') return '-';
  return `${amount.toLocaleString('ko-KR')}원`;
}

export function formatSchedule(dateIso?: string, startIso?: string, endIso?: string) {
  if (!dateIso && !startIso) return '일정 미정';
  const start = startIso ?? dateIso;
  const startDate = start ? new Date(start) : null;
  const endDate = endIso ? new Date(endIso) : null;

  if (!startDate) return '일정 미정';

  const y = startDate.getFullYear();
  const m = String(startDate.getMonth() + 1).padStart(2, '0');
  const d = String(startDate.getDate()).padStart(2, '0');
  const startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(
    startDate.getMinutes()
  ).padStart(2, '0')}`;
  const endTime = endDate
    ? `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`
    : null;

  return endTime ? `${y}.${m}.${d} ${startTime} - ${endTime}` : `${y}.${m}.${d} ${startTime}`;
}

export function formatStatusTimestamp(iso?: string) {
  if (!iso) return '시간 정보 없음';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  return `${y}.${m}.${d} ${hh}:${mm}`;
}

export function summarizeServices(services: { name: string }[]) {
  const primary = services?.[0]?.name ?? '서비스 정보 없음';
  const extraCount = Math.max((services?.length ?? 0) - 1, 0);
  return extraCount > 0 ? `${primary} 외 ${extraCount}건` : primary;
}
