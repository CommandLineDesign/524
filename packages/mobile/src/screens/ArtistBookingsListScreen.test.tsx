import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock React Navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock the useArtistBookings hook
const mockUseArtistBookings = jest.fn();
jest.mock('../query/bookings', () => ({
  useArtistBookings: mockUseArtistBookings,
}));

// Mock the BookingCard component
jest.mock('../components/bookings/BookingCard', () => ({
  BookingCard: ({ booking, onPress }: { booking: unknown; onPress: () => void }) => (
    <mock-BookingCard testID={`booking-card-${(booking as { id: string }).id}`} onPress={onPress}>
      {(booking as { bookingNumber: string }).bookingNumber}
    </mock-BookingCard>
  ),
}));

// Mock the BookingStatusBadge component
jest.mock('../components/bookings/BookingStatusBadge', () => ({
  BookingStatusBadge: ({ status }: { status: string }) => (
    <mock-BookingStatusBadge testID={`status-badge-${status}`}>{status}</mock-BookingStatusBadge>
  ),
}));

import { ArtistBookingsListScreen } from './ArtistBookingsListScreen';

// Mock data
const mockBookings = [
  {
    id: 'booking-1',
    bookingNumber: 'BK-001',
    status: 'pending',
    scheduledDate: '2024-12-15',
    scheduledStartTime: '2024-12-15T10:00:00Z',
    artistName: 'Test Artist',
    totalAmount: 100000,
    services: [{ id: 'service-1', name: 'Test Service', durationMinutes: 60, price: 100000 }],
  },
  {
    id: 'booking-2',
    bookingNumber: 'BK-002',
    status: 'confirmed',
    scheduledDate: '2024-12-14',
    scheduledStartTime: '2024-12-14T14:00:00Z',
    artistName: 'Test Artist',
    totalAmount: 150000,
    services: [{ id: 'service-2', name: 'Another Service', durationMinutes: 90, price: 150000 }],
  },
];

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ArtistBookingsListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Loading', () => {
    it('shows loading indicator while fetching', () => {
      mockUseArtistBookings.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: jest.fn(),
        isRefetching: false,
      });

      const { getByTestId } = render(<ArtistBookingsListScreen />, {
        wrapper: createTestWrapper(),
      });

      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('renders booking list when data loads', () => {
      mockUseArtistBookings.mockReturnValue({
        data: mockBookings,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
        isRefetching: false,
      });

      const { getByTestId } = render(<ArtistBookingsListScreen />, {
        wrapper: createTestWrapper(),
      });

      expect(getByTestId('booking-card-booking-1')).toBeTruthy();
      expect(getByTestId('booking-card-booking-2')).toBeTruthy();
    });

    it('shows error message on fetch failure', () => {
      const mockRefetch = jest.fn();
      mockUseArtistBookings.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
        isRefetching: false,
      });

      const { getByText, getByTestId } = render(<ArtistBookingsListScreen />, {
        wrapper: createTestWrapper(),
      });

      expect(getByText('예약 정보를 불러오지 못했어요.')).toBeTruthy();
      expect(getByTestId('retry-button')).toBeTruthy();
    });

    it('retry button refetches data', () => {
      const mockRefetch = jest.fn();
      mockUseArtistBookings.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
        isRefetching: false,
      });

      const { getByTestId } = render(<ArtistBookingsListScreen />, {
        wrapper: createTestWrapper(),
      });

      const retryButton = getByTestId('retry-button');
      fireEvent.press(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Status Filtering', () => {
    it('renders filter chips correctly', () => {
      mockUseArtistBookings.mockReturnValue({
        data: mockBookings,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
        isRefetching: false,
      });

      const { getByText } = render(<ArtistBookingsListScreen />, { wrapper: createTestWrapper() });

      expect(getByText('예약')).toBeTruthy(); // pending
      expect(getByText('전체')).toBeTruthy(); // all
      expect(getByText('확정')).toBeTruthy(); // confirmed
      expect(getByText('거절')).toBeTruthy(); // declined
      expect(getByText('취소')).toBeTruthy(); // cancelled
      expect(getByText('완료')).toBeTruthy(); // completed
    });

    it('defaults to pending filter', () => {
      mockUseArtistBookings.mockReturnValue({
        data: mockBookings,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
        isRefetching: false,
      });

      render(<ArtistBookingsListScreen />, { wrapper: createTestWrapper() });

      expect(mockUseArtistBookings).toHaveBeenCalledWith('pending');
    });

    it('changes filter when chip is selected', () => {
      mockUseArtistBookings.mockReturnValue({
        data: mockBookings,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
        isRefetching: false,
      });

      // Mock the hook to return different data based on calls
      mockUseArtistBookings
        .mockReturnValueOnce({
          data: mockBookings,
          isLoading: false,
          isError: false,
          refetch: jest.fn(),
          isRefetching: false,
        })
        .mockReturnValueOnce({
          data: [mockBookings[1]], // Only confirmed booking
          isLoading: false,
          isError: false,
          refetch: jest.fn(),
          isRefetching: false,
        });

      const { getByText, rerender } = render(<ArtistBookingsListScreen />, {
        wrapper: createTestWrapper(),
      });

      // Initially should show both bookings
      expect(getByText('BK-001')).toBeTruthy();
      expect(getByText('BK-002')).toBeTruthy();

      // Click on confirmed filter
      const confirmedChip = getByText('확정');
      fireEvent.press(confirmedChip);

      // Re-render with new hook return
      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <ArtistBookingsListScreen />
        </QueryClientProvider>
      );

      // Should now only show confirmed booking
      expect(mockUseArtistBookings).toHaveBeenLastCalledWith('confirmed');
    });
  });

  describe('Booking Cards', () => {
    it('renders booking data correctly', () => {
      mockUseArtistBookings.mockReturnValue({
        data: mockBookings,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
        isRefetching: false,
      });

      const { getByText } = render(<ArtistBookingsListScreen />, { wrapper: createTestWrapper() });

      expect(getByText('BK-001')).toBeTruthy();
      expect(getByText('BK-002')).toBeTruthy();
    });

    it('navigates to detail screen when booking card is pressed', () => {
      mockUseArtistBookings.mockReturnValue({
        data: mockBookings,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
        isRefetching: false,
      });

      const { getByTestId } = render(<ArtistBookingsListScreen />, {
        wrapper: createTestWrapper(),
      });

      const bookingCard = getByTestId('booking-card-booking-1');
      fireEvent.press(bookingCard);

      expect(mockNavigate).toHaveBeenCalledWith('ArtistBookingDetail', {
        bookingId: 'booking-1',
      });
    });
  });

  describe('Sorting', () => {
    it('sorts bookings by scheduled date descending', () => {
      const unsortedBookings = [
        {
          id: 'booking-1',
          bookingNumber: 'BK-001',
          status: 'pending',
          scheduledDate: '2024-12-14',
          scheduledStartTime: '2024-12-14T10:00:00Z',
          artistName: 'Test Artist',
          totalAmount: 100000,
          services: [{ id: 'service-1', name: 'Test Service', durationMinutes: 60, price: 100000 }],
        },
        {
          id: 'booking-2',
          bookingNumber: 'BK-002',
          status: 'confirmed',
          scheduledDate: '2024-12-15',
          scheduledStartTime: '2024-12-15T14:00:00Z',
          artistName: 'Test Artist',
          totalAmount: 150000,
          services: [
            { id: 'service-2', name: 'Another Service', durationMinutes: 90, price: 150000 },
          ],
        },
      ];

      mockUseArtistBookings.mockReturnValue({
        data: unsortedBookings,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
        isRefetching: false,
      });

      const { getAllByTestId } = render(<ArtistBookingsListScreen />, {
        wrapper: createTestWrapper(),
      });

      const bookingCards = getAllByTestId(/^booking-card-/);
      // Should be sorted with newer dates first (booking-2 should come first)
      expect(bookingCards[0]).toHaveProp('testID', 'booking-card-booking-2');
      expect(bookingCards[1]).toHaveProp('testID', 'booking-card-booking-1');
    });
  });
});
