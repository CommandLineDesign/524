import type { ArtistProfile, ArtistSearchFilters, ArtistSearchResult } from '@524/shared/artists';

import { ArtistRepository } from '../repositories/artistRepository.js';
import { SearchService } from './searchService.js';

export class ArtistService {
  constructor(
    private readonly repository = new ArtistRepository(),
    private readonly searchService = new SearchService()
  ) {}

  getArtistProfile(artistId: string): Promise<ArtistProfile | null> {
    return this.repository.findById(artistId);
  }

  updateArtistProfile(artistId: string, updates: Partial<ArtistProfile>): Promise<ArtistProfile> {
    return this.repository.update(artistId, updates);
  }

  searchArtists(filters: ArtistSearchFilters): Promise<ArtistSearchResult[]> {
    return this.searchService.searchArtists(filters);
  }
}
