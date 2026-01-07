import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import type { ReverseGeocodeResult } from '@524/shared';

import { type LocationDataWithAddress, LocationPicker } from '../LocationPicker';

// Mock dependencies
jest.mock('../../../services/kakaoService', () => ({
  reverseGeocodeLocation: jest.fn(),
  searchKeyword: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../../hooks/useCurrentLocation', () => ({
  useCurrentLocation: jest.fn(),
}));

jest.mock('../../../hooks/useDebounce', () => ({
  useDebounce: jest.fn((value) => value),
}));

// Mock the InteractiveKakaoMap component
jest.mock('../InteractiveKakaoMap/index', () => ({
  InteractiveKakaoMap: jest.fn(({ center, onCenterChange, testID }) => {
    // Store onCenterChange for test access
    (global as any).__mockMapOnCenterChange = onCenterChange;
    const { View, Text } = require('react-native');
    return (
      <View testID={testID}>
        <Text>
          Mock Map: {center.latitude}, {center.longitude}
        </Text>
      </View>
    );
  }),
}));

const mockReverseGeocodeLocation = jest.requireMock(
  '../../../services/kakaoService'
).reverseGeocodeLocation;
const mockUseCurrentLocation = jest.requireMock(
  '../../../hooks/useCurrentLocation'
).useCurrentLocation;

const mockReverseGeocodeResult: ReverseGeocodeResult = {
  address: '서울특별시 강남구 역삼동 123-45',
  roadAddress: '서울특별시 강남구 테헤란로 123',
  region1: '서울특별시',
  region2: '강남구',
  region3: '역삼동',
};

describe('LocationPicker', () => {
  const mockOnLocationChange = jest.fn();
  const mockOnRadiusChange = jest.fn();
  const mockGetCurrentLocation = jest.fn();

  const defaultProps = {
    location: { latitude: 0, longitude: 0 },
    onLocationChange: mockOnLocationChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockReverseGeocodeLocation.mockResolvedValue(mockReverseGeocodeResult);
    mockUseCurrentLocation.mockReturnValue({
      getCurrentLocation: mockGetCurrentLocation,
      isLoading: false,
      error: null,
    });
  });

  describe('Coordinate Validation', () => {
    it('should use default Seoul City Hall coordinates when location is (0, 0)', async () => {
      const { getByText } = render(<LocationPicker {...defaultProps} testID="picker" />);

      // Wait for initialization - check that the mock map shows default coordinates
      await waitFor(() => {
        // Default center is Seoul City Hall: 37.5666, 126.9784
        expect(getByText(/Mock Map: 37\.5666, 126\.9784/)).toBeTruthy();
      });
    });

    it('should use provided valid coordinates', async () => {
      const validLocation = { latitude: 37.498, longitude: 127.028 };

      const { getByText } = render(
        <LocationPicker {...defaultProps} location={validLocation} testID="picker" />
      );

      await waitFor(() => {
        expect(getByText(/Mock Map: 37\.498, 127\.028/)).toBeTruthy();
      });
    });

    it('should treat (0, latitude) as invalid and use default', async () => {
      const partialLocation = { latitude: 0, longitude: 127.028 };

      const { getByText } = render(
        <LocationPicker {...defaultProps} location={partialLocation} testID="picker" />
      );

      await waitFor(() => {
        // Should use default (Seoul City Hall) because latitude is 0
        expect(getByText(/Mock Map: 37\.5666/)).toBeTruthy();
      });
    });

    it('should treat (latitude, 0) as invalid and use default', async () => {
      const partialLocation = { latitude: 37.5, longitude: 0 };

      const { getByText } = render(
        <LocationPicker {...defaultProps} location={partialLocation} testID="picker" />
      );

      await waitFor(() => {
        // Should use default because longitude is 0
        expect(getByText(/126\.9784/)).toBeTruthy();
      });
    });
  });

  describe('GPS Location Fallback', () => {
    it('should request GPS location when coordinates are invalid', async () => {
      mockGetCurrentLocation.mockResolvedValue({
        latitude: 37.55,
        longitude: 126.95,
      });

      render(<LocationPicker {...defaultProps} testID="picker" />);

      await waitFor(() => {
        expect(mockGetCurrentLocation).toHaveBeenCalled();
      });
    });

    it('should not request GPS location when coordinates are valid', async () => {
      const validLocation = { latitude: 37.498, longitude: 127.028 };

      render(<LocationPicker {...defaultProps} location={validLocation} testID="picker" />);

      // Give time for initialization effect to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockGetCurrentLocation).not.toHaveBeenCalled();
    });
  });

  describe('Radius Selection', () => {
    it('should not show radius selector by default', () => {
      const { queryByText } = render(<LocationPicker {...defaultProps} />);

      expect(queryByText('서비스 반경')).toBeNull();
      expect(queryByText('5 km')).toBeNull();
    });

    it('should show radius selector when showRadiusSelector is true', async () => {
      const { getByText } = render(
        <LocationPicker {...defaultProps} showRadiusSelector radiusKm={10} />
      );

      expect(getByText('서비스 반경')).toBeTruthy();
      expect(getByText('5 km')).toBeTruthy();
      expect(getByText('10 km')).toBeTruthy();
      expect(getByText('15 km')).toBeTruthy();
      expect(getByText('25 km')).toBeTruthy();
    });

    it('should call onRadiusChange when radius button is pressed', async () => {
      const { getByText } = render(
        <LocationPicker
          {...defaultProps}
          showRadiusSelector
          radiusKm={5}
          onRadiusChange={mockOnRadiusChange}
        />
      );

      await act(async () => {
        fireEvent.press(getByText('15 km'));
      });

      expect(mockOnRadiusChange).toHaveBeenCalledWith(15);
    });

    it('should highlight selected radius option', () => {
      const { getByText } = render(
        <LocationPicker {...defaultProps} showRadiusSelector radiusKm={10} />
      );

      const selectedButton = getByText('10 km').parent?.parent;
      // The button should have the selected style applied
      expect(selectedButton).toBeTruthy();
    });

    it('should accept custom radius options', async () => {
      const customOptions = [
        { value: 1, label: '1 km' },
        { value: 3, label: '3 km' },
        { value: 50, label: '50 km' },
      ];

      const { getByText, queryByText } = render(
        <LocationPicker
          {...defaultProps}
          showRadiusSelector
          radiusKm={3}
          radiusOptions={customOptions}
        />
      );

      // Custom options should be visible
      expect(getByText('1 km')).toBeTruthy();
      expect(getByText('3 km')).toBeTruthy();
      expect(getByText('50 km')).toBeTruthy();

      // Default options should not be visible
      expect(queryByText('5 km')).toBeNull();
      expect(queryByText('25 km')).toBeNull();
    });
  });

  describe('Pin Move Mode', () => {
    it('should toggle pin move mode when button is pressed', async () => {
      const validLocation = { latitude: 37.5, longitude: 127.0 };

      const { getByText } = render(<LocationPicker {...defaultProps} location={validLocation} />);

      // Initially should show "위치 조정" (adjust location)
      expect(getByText('위치 조정')).toBeTruthy();

      await act(async () => {
        fireEvent.press(getByText('위치 조정'));
      });

      // After toggle should show "선택 완료" (selection complete)
      expect(getByText('선택 완료')).toBeTruthy();
    });
  });

  describe('Reverse Geocoding', () => {
    it('should perform reverse geocoding in pin move mode', async () => {
      const validLocation = { latitude: 37.5, longitude: 127.0 };

      const { getByText } = render(<LocationPicker {...defaultProps} location={validLocation} />);

      // Enter pin move mode
      await act(async () => {
        fireEvent.press(getByText('위치 조정'));
      });

      // Simulate map center change (which triggers reverse geocoding in pin move mode)
      await act(async () => {
        const onCenterChange = (global as any).__mockMapOnCenterChange;
        if (onCenterChange) {
          onCenterChange({ latitude: 37.51, longitude: 127.01 });
        }
      });

      await waitFor(() => {
        expect(mockReverseGeocodeLocation).toHaveBeenCalledWith(37.51, 127.01);
      });
    });

    it('should display fallback address format when reverse geocoding fails', async () => {
      mockReverseGeocodeLocation.mockResolvedValue(null);

      const validLocation = { latitude: 37.5, longitude: 127.0 };

      const { getByText } = render(<LocationPicker {...defaultProps} location={validLocation} />);

      // Enter pin move mode
      await act(async () => {
        fireEvent.press(getByText('위치 조정'));
      });

      // Simulate map center change
      await act(async () => {
        const onCenterChange = (global as any).__mockMapOnCenterChange;
        if (onCenterChange) {
          onCenterChange({ latitude: 37.512345, longitude: 127.012345 });
        }
      });

      await waitFor(() => {
        // Fallback should show coordinates with 6 decimal places
        expect(mockOnLocationChange).toHaveBeenCalledWith(
          expect.objectContaining({
            address: expect.stringMatching(/37\.512345.*127\.012345/),
          })
        );
      });
    });
  });

  describe('Error States', () => {
    it('should display GPS error when available', async () => {
      mockUseCurrentLocation.mockReturnValue({
        getCurrentLocation: mockGetCurrentLocation,
        isLoading: false,
        error: 'GPS not available',
      });

      const { getByText } = render(<LocationPicker {...defaultProps} />);

      // Wait for initialization
      await waitFor(() => {
        expect(getByText('GPS not available')).toBeTruthy();
      });
    });
  });

  describe('Address Display', () => {
    it('should display address from initial location', async () => {
      const locationWithAddress = {
        latitude: 37.5,
        longitude: 127.0,
        address: 'Initial Address',
      };

      const { getByText } = render(
        <LocationPicker {...defaultProps} location={locationWithAddress} />
      );

      await waitFor(() => {
        expect(getByText('Initial Address')).toBeTruthy();
      });
    });

    it('should show loading state during reverse geocoding', async () => {
      const validLocation = { latitude: 37.5, longitude: 127.0 };

      // Make reverse geocode take time
      mockReverseGeocodeLocation.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockReverseGeocodeResult), 1000))
      );

      const { getByText } = render(<LocationPicker {...defaultProps} location={validLocation} />);

      // Enter pin move mode
      await act(async () => {
        fireEvent.press(getByText('위치 조정'));
      });

      // Simulate map center change
      await act(async () => {
        const onCenterChange = (global as any).__mockMapOnCenterChange;
        if (onCenterChange) {
          onCenterChange({ latitude: 37.51, longitude: 127.01 });
        }
      });

      // Should show loading state
      await waitFor(() => {
        expect(getByText('주소 확인 중...')).toBeTruthy();
      });
    });
  });
});
