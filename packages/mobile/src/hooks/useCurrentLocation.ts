import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface UseCurrentLocationReturn {
  getCurrentLocation: () => Promise<LocationCoordinates | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for getting the user's current GPS location
 * Handles permission requests and error states
 */
export function useCurrentLocation(): UseCurrentLocationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('위치 접근 권한이 필요합니다');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : '위치를 가져오는데 실패했습니다';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getCurrentLocation,
    isLoading,
    error,
    clearError,
  };
}
