import type { ArtistSearchResult } from '@524/shared/artists';
import { useQuery } from '@tanstack/react-query';

import { searchArtistsFiltered } from '../api/client';

export interface HomeArtistSearchParams {
  latitude: number | null;
  longitude: number | null;
  dateTime: string | null;
}

/**
 * Build query key for filtered artist search
 */
function buildQueryKey(serviceType: 'hair' | 'makeup' | 'combo', params: HomeArtistSearchParams) {
  return [
    'filteredArtists',
    serviceType,
    params.latitude,
    params.longitude,
    params.dateTime,
  ] as const;
}

/**
 * Hook to fetch filtered artists for a specific service type
 */
function useFilteredArtists(
  serviceType: 'hair' | 'makeup' | 'combo',
  params: HomeArtistSearchParams
) {
  const { latitude, longitude, dateTime } = params;

  const isEnabled =
    latitude !== null &&
    longitude !== null &&
    dateTime !== null &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude);

  return useQuery<ArtistSearchResult[]>({
    queryKey: buildQueryKey(serviceType, params),
    queryFn: () => {
      // These are guaranteed to be non-null when enabled is true
      if (latitude === null || longitude === null || dateTime === null) {
        throw new Error('Invalid search params');
      }
      return searchArtistsFiltered({
        serviceType,
        latitude,
        longitude,
        dateTime,
      });
    },
    enabled: isEnabled,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes (previously called cacheTime)
  });
}

export interface HomeArtistSearchResult {
  comboArtists: {
    data: ArtistSearchResult[];
    isLoading: boolean;
    error: Error | null;
  };
  hairArtists: {
    data: ArtistSearchResult[];
    isLoading: boolean;
    error: Error | null;
  };
  makeupArtists: {
    data: ArtistSearchResult[];
    isLoading: boolean;
    error: Error | null;
  };
}

/**
 * Hook to fetch filtered artists for all three categories at once
 * Used by the home screen to populate the artist carousels
 */
export function useHomeArtistSearch(params: HomeArtistSearchParams): HomeArtistSearchResult {
  const comboQuery = useFilteredArtists('combo', params);
  const hairQuery = useFilteredArtists('hair', params);
  const makeupQuery = useFilteredArtists('makeup', params);

  return {
    comboArtists: {
      data: comboQuery.data ?? [],
      isLoading: comboQuery.isLoading,
      error: comboQuery.error,
    },
    hairArtists: {
      data: hairQuery.data ?? [],
      isLoading: hairQuery.isLoading,
      error: hairQuery.error,
    },
    makeupArtists: {
      data: makeupQuery.data ?? [],
      isLoading: makeupQuery.isLoading,
      error: makeupQuery.error,
    },
  };
}
