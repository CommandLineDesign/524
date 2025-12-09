import type { ArtistProfile } from '@524/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getArtistProfile, updateArtistProfile } from '../api/client';

const artistProfileKey = ['artist', 'profile'];

export function useArtistProfile(enabled: boolean) {
  return useQuery<ArtistProfile>({
    queryKey: artistProfileKey,
    queryFn: getArtistProfile,
    enabled,
    retry: false,
  });
}

export function useUpdateArtistProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateArtistProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(artistProfileKey, profile);
    },
  });
}
