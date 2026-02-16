import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type AvailabilityData,
  getArtistAvailability,
  updateArtistAvailability,
} from '../api/client';
import { getPreviousWeekId } from '../utils/weekUtils';

/**
 * Query key for artist availability
 */
const availabilityKey = (weekId: string) => ['artist', 'availability', weekId];

/**
 * Hook to fetch artist availability for a specific week
 * @param weekId - ISO week ID (e.g., "2026-W07")
 * @param enabled - Whether to enable the query
 */
export function useArtistAvailability(weekId: string, enabled = true) {
  return useQuery<AvailabilityData>({
    queryKey: availabilityKey(weekId),
    queryFn: async () => {
      const response = await getArtistAvailability(weekId);
      return response.data;
    },
    enabled: Boolean(weekId && enabled),
  });
}

/**
 * Hook to update artist availability for a specific week
 */
export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ weekId, slots }: { weekId: string; slots: string[] }) => {
      const response = await updateArtistAvailability(weekId, slots);
      return response.data;
    },
    onSuccess: (data, { weekId }) => {
      // Update the cache with the new data
      queryClient.setQueryData(availabilityKey(weekId), data);
    },
  });
}

/**
 * Hook to copy availability from the previous week
 * This fetches the previous week's availability and applies it to the current week
 */
export function useCopyPreviousWeekAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ currentWeekId }: { currentWeekId: string }) => {
      const previousWeekId = getPreviousWeekId(currentWeekId);

      // Fetch previous week's availability
      const previousResponse = await getArtistAvailability(previousWeekId);
      const previousSlots = previousResponse.data.slots;

      if (previousSlots.length === 0) {
        throw new Error('Previous week has no availability set');
      }

      // Calculate the date offset between weeks (7 days)
      const slotDateRegex = /^(\d{4})-(\d{2})-(\d{2})/;

      // Transform slots to the new week by adding 7 days
      const newSlots = previousSlots.map((slot) => {
        const match = slot.match(slotDateRegex);
        if (!match) return slot;

        const date = new Date(slot);
        date.setDate(date.getDate() + 7);

        // Preserve the original time portion and timezone
        const timePart = slot.substring(10); // "T09:00:00+09:00"
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}${timePart}`;
      });

      // Save to current week
      const response = await updateArtistAvailability(currentWeekId, newSlots);
      return response.data;
    },
    onSuccess: (data, { currentWeekId }) => {
      queryClient.setQueryData(availabilityKey(currentWeekId), data);
    },
  });
}

/**
 * Prefetch availability for adjacent weeks (useful for smooth navigation)
 */
export function usePrefetchAdjacentWeeks(currentWeekId: string) {
  const queryClient = useQueryClient();

  const prefetch = async () => {
    const previousWeekId = getPreviousWeekId(currentWeekId);
    const { getNextWeekId } = await import('../utils/weekUtils');
    const nextWeekId = getNextWeekId(currentWeekId);

    // Prefetch both adjacent weeks
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: availabilityKey(previousWeekId),
        queryFn: async () => {
          const response = await getArtistAvailability(previousWeekId);
          return response.data;
        },
        staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
      }),
      queryClient.prefetchQuery({
        queryKey: availabilityKey(nextWeekId),
        queryFn: async () => {
          const response = await getArtistAvailability(nextWeekId);
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  };

  return { prefetch };
}
