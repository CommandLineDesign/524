import type { AdminBookingDetail, AdminBookingListItem } from '@524/shared';

import {
  type AdminBookingListQuery,
  AdminBookingRepository,
} from '../repositories/adminBookingRepository.js';

export interface AdminBookingListParams {
  page: number;
  perPage: number;
  sortField?: AdminBookingListQuery['sortField'];
  sortOrder?: AdminBookingListQuery['sortOrder'];
  status?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class AdminBookingService {
  constructor(private readonly repository = new AdminBookingRepository()) {}

  async listBookings(
    params: AdminBookingListParams
  ): Promise<{ items: AdminBookingListItem[]; total: number }> {
    return this.repository.list(params);
  }

  async getBookingDetail(bookingId: string): Promise<AdminBookingDetail | null> {
    return this.repository.getDetail(bookingId);
  }
}
