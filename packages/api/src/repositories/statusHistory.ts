import type { BookingSummary } from '@524/shared/bookings';

type StatusHistoryEntry = { status: string; timestamp: string };

export function buildStatusHistory(
  existing: Array<StatusHistoryEntry> | null | undefined,
  nextStatus: BookingSummary['status']
): Array<StatusHistoryEntry> {
  const normalizedHistory = existing ?? [];
  return [...normalizedHistory, { status: nextStatus, timestamp: new Date().toISOString() }];
}
