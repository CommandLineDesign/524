import { create } from 'zustand';

import type { BookedService, CreateBookingPayload, ServiceType } from '@524/shared';
import { DEV_DEFAULT_LOCATION } from '@524/shared';

interface BookingState {
  serviceType: ServiceType | null;
  occasion: string | null;
  scheduledDate: string | null;
  selectedArtistId: string | null;
  services: BookedService[];
  setServiceType: (serviceType: ServiceType) => void;
  setOccasion: (occasion: string) => void;
  setScheduledDate: (date: string) => void;
  setSelectedArtist: (artistId: string | null) => void;
  addService: (service: BookedService) => void;
  reset: () => void;
  buildPayload: (customerId?: string) => CreateBookingPayload | null;
}

const DEFAULT_SERVICES: Record<ServiceType, Omit<BookedService, 'id'>> = {
  hair: {
    name: '프리미엄 헤어 스타일링',
    durationMinutes: 45,
    price: 80000,
  },
  makeup: {
    name: '시그니처 메이크업',
    durationMinutes: 40,
    price: 120000,
  },
  combo: {
    name: '헤어 & 메이크업 패키지',
    durationMinutes: 90,
    price: 180000,
  },
};

const initialState = {
  serviceType: null,
  occasion: null,
  scheduledDate: null,
  selectedArtistId: null,
  services: [] as BookedService[],
};

export const useBookingStore = create<BookingState>((set, get) => ({
  ...initialState,
  setServiceType: (serviceType) => set({ serviceType }),
  setOccasion: (occasion) => set({ occasion }),
  setScheduledDate: (date) => set({ scheduledDate: date }),
  setSelectedArtist: (artistId) => set({ selectedArtistId: artistId }),
  addService: (service) => set((state) => ({ services: [...state.services, service] })),
  reset: () => set(initialState),
  buildPayload: (customerId) => {
    const { serviceType, occasion, scheduledDate, services, selectedArtistId } = get();
    if (!serviceType || !occasion || !selectedArtistId || !scheduledDate || !customerId) {
      return null;
    }

    const effectiveServices =
      services.length > 0
        ? services
        : [
            {
              id: `svc-${serviceType}`,
              ...DEFAULT_SERVICES[serviceType],
            },
          ];

    const scheduleTimestamp = scheduledDate;
    const estimatedDurationMinutes =
      effectiveServices.reduce((sum, item) => sum + item.durationMinutes, 0) || 60;
    const scheduleEndTime = new Date(
      new Date(scheduleTimestamp).getTime() + estimatedDurationMinutes * 60 * 1000
    ).toISOString();

    return {
      customerId,
      artistId: selectedArtistId,
      serviceType,
      occasion,
      scheduledDate: scheduleTimestamp,
      scheduledStartTime: scheduleTimestamp,
      scheduledEndTime: scheduleEndTime,
      totalAmount: effectiveServices.reduce((sum, item) => sum + item.price, 0),
      services: effectiveServices,
      location: DEV_DEFAULT_LOCATION,
    };
  },
}));
