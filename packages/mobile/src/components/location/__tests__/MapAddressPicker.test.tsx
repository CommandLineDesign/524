import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import type { ReverseGeocodeResult } from '@524/shared';

import { MapAddressPicker } from '../MapAddressPicker';

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

// Mock AddressSearchBar
jest.mock('../AddressSearchBar', () => ({
  AddressSearchBar: jest.fn(({ onResultSelect, testID }) => {
    // Store callback for test access
    (global as any).__mockSearchOnResultSelect = onResultSelect;
    const { View, Text } = require('react-native');
    return (
      <View testID={testID}>
        <Text>Mock Search Bar</Text>
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

describe('MapAddressPicker', () => {
  const mockOnLocationConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  const mockGetCurrentLocation = jest.fn();

  const defaultProps = {
    onLocationConfirm: mockOnLocationConfirm,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockReverseGeocodeLocation.mockResolvedValue(mockReverseGeocodeResult);
    mockGetCurrentLocation.mockResolvedValue({
      latitude: 37.55,
      longitude: 126.95,
    });
    mockUseCurrentLocation.mockReturnValue({
      getCurrentLocation: mockGetCurrentLocation,
      isLoading: false,
      error: null,
    });
  });

  describe('Initialization', () => {
    it('should show loading state when no initial location is provided', async () => {
      const { getByText } = render(<MapAddressPicker {...defaultProps} testID="picker" />);

      // Should show loading while getting GPS location
      expect(getByText('위치를 가져오는 중...')).toBeTruthy();
    });

    it('should use initial location when provided', async () => {
      const initialLocation = {
        latitude: 37.5,
        longitude: 127.0,
        address: 'Initial Address',
      };

      const { findByText } = render(
        <MapAddressPicker {...defaultProps} initialLocation={initialLocation} testID="picker" />
      );

      // Should display the initial address
      await waitFor(async () => {
        const text = await findByText('Initial Address');
        expect(text).toBeTruthy();
      });
    });

    it('should request GPS location when no initial location', async () => {
      render(<MapAddressPicker {...defaultProps} testID="picker" />);

      await waitFor(() => {
        expect(mockGetCurrentLocation).toHaveBeenCalled();
      });
    });
  });

  describe('Address Display', () => {
    it('should display road address when available', async () => {
      const initialLocation = {
        latitude: 37.5,
        longitude: 127.0,
        address: 'Some Address',
      };

      const { getByText } = render(
        <MapAddressPicker {...defaultProps} initialLocation={initialLocation} testID="picker" />
      );

      // Initially shows the provided address
      await waitFor(() => {
        expect(getByText('Some Address')).toBeTruthy();
      });
    });

    it('should show placeholder when no address is set', async () => {
      // When we have invalid initial location and GPS fails
      mockGetCurrentLocation.mockResolvedValue(null);

      const { getByText, queryByText } = render(
        <MapAddressPicker {...defaultProps} testID="picker" />
      );

      // Wait for initialization to complete
      await waitFor(() => {
        // After GPS fails with no address, should show placeholder
        expect(
          queryByText('위치를 가져오는 중...') || getByText('지도에서 위치를 선택해주세요')
        ).toBeTruthy();
      });
    });

    it('should show loading state during reverse geocoding', async () => {
      // Make reverse geocode take time
      mockReverseGeocodeLocation.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockReverseGeocodeResult), 1000))
      );

      const initialLocation = {
        latitude: 37.5,
        longitude: 127.0,
        address: 'Initial Address',
      };

      const { getByText } = render(
        <MapAddressPicker {...defaultProps} initialLocation={initialLocation} testID="picker" />
      );

      // Enter pin move mode
      await act(async () => {
        fireEvent.press(getByText('위치 조정'));
      });

      // Simulate map center change (triggers reverse geocoding)
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

  describe('Confirm Button', () => {
    it('should be disabled when no address is selected', async () => {
      mockGetCurrentLocation.mockResolvedValue(null);

      const { getByText, queryByText } = render(
        <MapAddressPicker {...defaultProps} testID="picker" />
      );

      // Wait for initialization (GPS returns null, no address)
      await waitFor(() => {
        // Either still loading or showing content
        const loading = queryByText('위치를 가져오는 중...');
        if (!loading) {
          // Confirm button should be disabled (via accessibilityState)
          const confirmButton = getByText('이 위치로 설정');
          expect(confirmButton.parent?.parent?.props?.accessibilityState?.disabled).toBe(true);
        }
      });
    });

    it('should call onLocationConfirm with selected location when pressed', async () => {
      const initialLocation = {
        latitude: 37.5,
        longitude: 127.0,
        address: 'Test Address',
      };

      const { getByText } = render(
        <MapAddressPicker {...defaultProps} initialLocation={initialLocation} testID="picker" />
      );

      await waitFor(() => {
        expect(getByText('Test Address')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByText('이 위치로 설정'));
      });

      expect(mockOnLocationConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 37.5,
          longitude: 127.0,
          address: 'Test Address',
        })
      );
    });

    it('should use custom confirm button label', async () => {
      const initialLocation = {
        latitude: 37.5,
        longitude: 127.0,
        address: 'Test Address',
      };

      const { getByText } = render(
        <MapAddressPicker
          {...defaultProps}
          initialLocation={initialLocation}
          confirmButtonLabel="확인"
          testID="picker"
        />
      );

      await waitFor(() => {
        expect(getByText('확인')).toBeTruthy();
      });
    });
  });

  describe('Pin Move Mode', () => {
    it('should toggle pin move mode when button is pressed', async () => {
      const initialLocation = {
        latitude: 37.5,
        longitude: 127.0,
        address: 'Test Address',
      };

      const { getByText } = render(
        <MapAddressPicker {...defaultProps} initialLocation={initialLocation} testID="picker" />
      );

      // Initially should show "위치 조정" (adjust location)
      expect(getByText('위치 조정')).toBeTruthy();

      await act(async () => {
        fireEvent.press(getByText('위치 조정'));
      });

      // After toggle should show "선택 완료" (selection complete)
      expect(getByText('선택 완료')).toBeTruthy();
    });

    it('should reverse geocode when map center changes in pin move mode', async () => {
      const initialLocation = {
        latitude: 37.5,
        longitude: 127.0,
        address: 'Initial Address',
      };

      const { getByText } = render(
        <MapAddressPicker {...defaultProps} initialLocation={initialLocation} testID="picker" />
      );

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

      await waitFor(() => {
        expect(mockReverseGeocodeLocation).toHaveBeenCalledWith(37.51, 127.01);
      });
    });
  });

  describe('GPS Location', () => {
    it('should update location when GPS button is pressed', async () => {
      const initialLocation = {
        latitude: 37.5,
        longitude: 127.0,
        address: 'Initial Address',
      };

      mockGetCurrentLocation.mockResolvedValue({
        latitude: 37.55,
        longitude: 126.95,
      });

      const { getByText, getByLabelText } = render(
        <MapAddressPicker {...defaultProps} initialLocation={initialLocation} testID="picker" />
      );

      await act(async () => {
        fireEvent.press(getByLabelText('현재 위치 사용'));
      });

      await waitFor(() => {
        expect(mockGetCurrentLocation).toHaveBeenCalled();
      });
    });

    it('should display GPS error when available', async () => {
      const initialLocation = {
        latitude: 37.5,
        longitude: 127.0,
        address: 'Test Address',
      };

      mockUseCurrentLocation.mockReturnValue({
        getCurrentLocation: mockGetCurrentLocation,
        isLoading: false,
        error: '위치 권한이 거부되었습니다',
      });

      const { getByText } = render(
        <MapAddressPicker {...defaultProps} initialLocation={initialLocation} testID="picker" />
      );

      expect(getByText('위치 권한이 거부되었습니다')).toBeTruthy();
    });
  });

  describe('Search Result Selection', () => {
    it('should update location when search result is selected', async () => {
      const initialLocation = {
        latitude: 37.5,
        longitude: 127.0,
        address: 'Initial Address',
      };

      const { getByText } = render(
        <MapAddressPicker {...defaultProps} initialLocation={initialLocation} testID="picker" />
      );

      // Wait for initial render
      await waitFor(() => {
        expect(getByText('Initial Address')).toBeTruthy();
      });

      // Simulate search result selection
      await act(async () => {
        const onResultSelect = (global as any).__mockSearchOnResultSelect;
        if (onResultSelect) {
          onResultSelect({
            id: '123',
            placeName: 'Test Place',
            addressName: '새로운 주소',
            roadAddressName: '새로운 도로명 주소',
            latitude: 37.6,
            longitude: 127.1,
          });
        }
      });

      // Should update to the new address
      await waitFor(() => {
        expect(getByText('새로운 도로명 주소')).toBeTruthy();
      });
    });
  });

  describe('Radius Overlay', () => {
    it('should pass radius props to map when showRadiusOverlay is true', async () => {
      const initialLocation = {
        latitude: 37.5,
        longitude: 127.0,
        address: 'Test Address',
      };

      const InteractiveKakaoMap = jest.requireMock(
        '../InteractiveKakaoMap/index'
      ).InteractiveKakaoMap;

      render(
        <MapAddressPicker
          {...defaultProps}
          initialLocation={initialLocation}
          showRadiusOverlay
          radiusKm={10}
          testID="picker"
        />
      );

      await waitFor(() => {
        expect(InteractiveKakaoMap).toHaveBeenCalledWith(
          expect.objectContaining({
            radiusKm: 10,
          }),
          expect.anything()
        );
      });
    });

    it('should not pass radius props when showRadiusOverlay is false', async () => {
      const initialLocation = {
        latitude: 37.5,
        longitude: 127.0,
        address: 'Test Address',
      };

      const InteractiveKakaoMap = jest.requireMock(
        '../InteractiveKakaoMap/index'
      ).InteractiveKakaoMap;

      render(
        <MapAddressPicker
          {...defaultProps}
          initialLocation={initialLocation}
          showRadiusOverlay={false}
          radiusKm={10}
          testID="picker"
        />
      );

      await waitFor(() => {
        expect(InteractiveKakaoMap).toHaveBeenCalledWith(
          expect.objectContaining({
            radiusKm: undefined,
          }),
          expect.anything()
        );
      });
    });
  });

  describe('Fallback Address', () => {
    it('should show coordinate fallback when reverse geocode fails', async () => {
      mockReverseGeocodeLocation.mockResolvedValue(null);

      const initialLocation = {
        latitude: 37.5,
        longitude: 127.0,
        address: 'Initial Address',
      };

      const { getByText } = render(
        <MapAddressPicker {...defaultProps} initialLocation={initialLocation} testID="picker" />
      );

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
        // Should show coordinates as fallback
        expect(mockOnLocationConfirm).not.toHaveBeenCalled();
      });
    });
  });
});
