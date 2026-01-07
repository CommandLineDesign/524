/**
 * Tests for InteractiveKakaoMap component and related utilities.
 *
 * Since InteractiveKakaoMap uses platform-specific implementations
 * (iframe for web, WebView for native) with web APIs (Blob, URL),
 * we test the shared logic through the useMapState hook and utility functions.
 */

import { act, renderHook } from '@testing-library/react-native';

import { areCentersEqual, getZoomLevelForRadius } from '../InteractiveKakaoMap/mapUtils';
import { useMapState } from '../InteractiveKakaoMap/useMapState';

describe('InteractiveKakaoMap', () => {
  describe('useMapState Hook', () => {
    const defaultCenter = { latitude: 37.5666, longitude: 126.9784 };
    const mockOnCenterChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should initialize with loading state', () => {
      const { result } = renderHook(() =>
        useMapState({
          center: defaultCenter,
          onCenterChange: mockOnCenterChange,
        })
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.hasError).toBe(false);
      expect(result.current.isMapReady).toBe(false);
    });

    it('should store initial center in ref', () => {
      const { result } = renderHook(() =>
        useMapState({
          center: defaultCenter,
          onCenterChange: mockOnCenterChange,
        })
      );

      expect(result.current.initialCenterRef.current).toEqual(defaultCenter);
    });

    it('should handle ready message', () => {
      const { result } = renderHook(() =>
        useMapState({
          center: defaultCenter,
          onCenterChange: mockOnCenterChange,
        })
      );

      act(() => {
        result.current.handleMapMessage({ type: 'ready' });
      });

      expect(result.current.isMapReady).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle error message', () => {
      const { result } = renderHook(() =>
        useMapState({
          center: defaultCenter,
          onCenterChange: mockOnCenterChange,
        })
      );

      act(() => {
        result.current.handleMapMessage({
          type: 'error',
          payload: { error: 'Test error' },
        });
      });

      expect(result.current.hasError).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle centerChanged message when isPinMoveEnabled', () => {
      const { result } = renderHook(() =>
        useMapState({
          center: defaultCenter,
          onCenterChange: mockOnCenterChange,
          isPinMoveEnabled: true,
        })
      );

      // First make map ready
      act(() => {
        result.current.handleMapMessage({ type: 'ready' });
      });

      // Then trigger center change
      act(() => {
        result.current.handleMapMessage({
          type: 'centerChanged',
          payload: { latitude: 37.5, longitude: 127.0 },
        });
      });

      expect(mockOnCenterChange).toHaveBeenCalledWith({
        latitude: 37.5,
        longitude: 127.0,
      });
    });

    it('should NOT call onCenterChange when isPinMoveEnabled is false', () => {
      const { result } = renderHook(() =>
        useMapState({
          center: defaultCenter,
          onCenterChange: mockOnCenterChange,
          isPinMoveEnabled: false,
        })
      );

      // First make map ready
      act(() => {
        result.current.handleMapMessage({ type: 'ready' });
      });

      // Then trigger center change
      act(() => {
        result.current.handleMapMessage({
          type: 'centerChanged',
          payload: { latitude: 37.5, longitude: 127.0 },
        });
      });

      expect(mockOnCenterChange).not.toHaveBeenCalled();
    });

    it('should handle retry by resetting error state', () => {
      const { result } = renderHook(() =>
        useMapState({
          center: defaultCenter,
          onCenterChange: mockOnCenterChange,
        })
      );

      // Simulate error
      act(() => {
        result.current.handleMapMessage({
          type: 'error',
          payload: { error: 'Test error' },
        });
      });

      expect(result.current.hasError).toBe(true);

      // Retry
      act(() => {
        result.current.handleRetry();
      });

      expect(result.current.hasError).toBe(false);
      expect(result.current.isLoading).toBe(true);
    });

    it('should store radius in initial ref', () => {
      const { result } = renderHook(() =>
        useMapState({
          center: defaultCenter,
          onCenterChange: mockOnCenterChange,
          radiusKm: 10,
        })
      );

      expect(result.current.initialRadiusRef.current).toBe(10);
    });

    it('should store circle center in initial ref', () => {
      const circleCenter = { latitude: 37.5, longitude: 127.0 };

      const { result } = renderHook(() =>
        useMapState({
          center: defaultCenter,
          onCenterChange: mockOnCenterChange,
          circleCenter,
        })
      );

      expect(result.current.initialCircleCenterRef.current).toEqual(circleCenter);
    });

    it('should store isPinMoveEnabled in initial ref', () => {
      const { result } = renderHook(() =>
        useMapState({
          center: defaultCenter,
          onCenterChange: mockOnCenterChange,
          isPinMoveEnabled: true,
        })
      );

      expect(result.current.initialIsPinMoveEnabledRef.current).toBe(true);
    });

    it('should handle dragStart message', () => {
      const { result } = renderHook(() =>
        useMapState({
          center: defaultCenter,
          onCenterChange: mockOnCenterChange,
        })
      );

      // Should not throw
      act(() => {
        result.current.handleMapMessage({ type: 'dragStart' });
      });
    });

    it('should handle dragEnd message', () => {
      const { result } = renderHook(() =>
        useMapState({
          center: defaultCenter,
          onCenterChange: mockOnCenterChange,
        })
      );

      // Should not throw
      act(() => {
        result.current.handleMapMessage({ type: 'dragEnd' });
      });
    });
  });

  describe('Map Utilities', () => {
    describe('getZoomLevelForRadius', () => {
      it('should return level 5 for radius <= 5km', () => {
        expect(getZoomLevelForRadius(5)).toBe(5);
        expect(getZoomLevelForRadius(3)).toBe(5);
        expect(getZoomLevelForRadius(1)).toBe(5);
      });

      it('should return level 6 for radius <= 10km', () => {
        expect(getZoomLevelForRadius(10)).toBe(6);
        expect(getZoomLevelForRadius(7)).toBe(6);
      });

      it('should return level 7 for radius <= 15km', () => {
        expect(getZoomLevelForRadius(15)).toBe(7);
        expect(getZoomLevelForRadius(12)).toBe(7);
      });

      it('should return level 8 for radius > 15km', () => {
        expect(getZoomLevelForRadius(20)).toBe(8);
        expect(getZoomLevelForRadius(25)).toBe(8);
        expect(getZoomLevelForRadius(50)).toBe(8);
      });
    });

    describe('areCentersEqual', () => {
      it('should return true for equal centers', () => {
        const center1 = { latitude: 37.5666, longitude: 126.9784 };
        const center2 = { latitude: 37.5666, longitude: 126.9784 };

        expect(areCentersEqual(center1, center2)).toBe(true);
      });

      it('should return false for different latitudes', () => {
        const center1 = { latitude: 37.5666, longitude: 126.9784 };
        const center2 = { latitude: 37.5, longitude: 126.9784 };

        expect(areCentersEqual(center1, center2)).toBe(false);
      });

      it('should return false for different longitudes', () => {
        const center1 = { latitude: 37.5666, longitude: 126.9784 };
        const center2 = { latitude: 37.5666, longitude: 127.0 };

        expect(areCentersEqual(center1, center2)).toBe(false);
      });

      it('should return false when one center is null', () => {
        const center = { latitude: 37.5666, longitude: 126.9784 };

        expect(areCentersEqual(null, center)).toBe(false);
        expect(areCentersEqual(center, null)).toBe(false);
        expect(areCentersEqual(null, null)).toBe(false);
      });
    });
  });
});
