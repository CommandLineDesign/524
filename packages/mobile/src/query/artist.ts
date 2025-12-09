import type { ArtistProfile } from '@524/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getArtistProfile, updateArtistProfile } from '../api/client';

const artistProfileKey = (userId?: string) => ['artist', 'profile', userId ?? 'anonymous'];

export function useArtistProfile(userId: string | undefined, enabled: boolean) {
  return useQuery<ArtistProfile>({
    queryKey: artistProfileKey(userId),
    queryFn: getArtistProfile,
    enabled: Boolean(enabled && userId),
    retry: false,
  });
}

export function useUpdateArtistProfile(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateArtistProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(artistProfileKey(userId), profile);
    },
  });
}
