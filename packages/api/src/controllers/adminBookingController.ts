import type { NextFunction, Request, Response } from 'express';

import {
  type AdminBookingListParams,
  AdminBookingService,
} from '../services/adminBookingService.js';

const adminBookingService = new AdminBookingService();

function parsePage(value: unknown, fallback: number) {
  if (typeof value !== 'string') return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : Math.max(parsed, 1);
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function resolveDateRange(
  dateRange?: string,
  startDate?: string,
  endDate?: string
): { from?: Date; to?: Date } {
  if (dateRange === 'today') {
    const from = startOfDay(new Date());
    const to = addDays(from, 1);
    return { from, to };
  }

  if (dateRange === 'this_week') {
    const now = new Date();
    const from = startOfDay(now);
    const day = from.getDay(); // 0 (Sun) - 6 (Sat)
    const mondayOffset = (day + 6) % 7;
    from.setDate(from.getDate() - mondayOffset);
    const to = addDays(from, 7);
    return { from, to };
  }

  let from: Date | undefined;
  let to: Date | undefined;

  if (startDate) {
    const parsed = new Date(startDate);
    if (!Number.isNaN(parsed.valueOf())) {
      from = startOfDay(parsed);
    }
  }

  if (endDate) {
    const parsed = new Date(endDate);
    if (!Number.isNaN(parsed.valueOf())) {
      to = addDays(startOfDay(parsed), 1);
    }
  }

  return { from, to };
}

export function parseListParams(req: Request): AdminBookingListParams {
  const page = parsePage(req.query.page ?? req.query._page, 1);
  const perPage = parsePage(req.query.perPage ?? req.query._perPage, 25);
  const sortField =
    (req.query.sortField as AdminBookingListParams['sortField']) ??
    (req.query._sort as AdminBookingListParams['sortField']) ??
    'createdAt';
  const sortOrder =
    (req.query.sortOrder as AdminBookingListParams['sortOrder']) ??
    (req.query._order as AdminBookingListParams['sortOrder']) ??
    'DESC';

  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const search =
    (typeof req.query.q === 'string' && req.query.q) ||
    (typeof req.query.search === 'string' && req.query.search) ||
    undefined;
  const dateRange = typeof req.query.dateRange === 'string' ? req.query.dateRange : undefined;
  const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
  const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;

  const { from, to } = resolveDateRange(dateRange, startDate, endDate);

  return {
    page,
    perPage,
    sortField,
    sortOrder,
    status,
    search,
    dateFrom: from,
    dateTo: to,
  };
}

export const AdminBookingController = {
  async listBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parseListParams(req);
      const result = await adminBookingService.listBookings(params);

      res.json({
        data: result.items,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  },

  async getBookingDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await adminBookingService.getBookingDetail(req.params.bookingId);
      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      res.json({ data: booking });
    } catch (error) {
      next(error);
    }
  },
};
