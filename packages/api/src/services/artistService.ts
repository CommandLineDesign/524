import type { PendingArtistDetail } from '@524/shared/admin';
import type { ArtistProfile, ArtistSearchFilters, ArtistSearchResult } from '@524/shared/artists';

import {
  type ArtistProfileUpdateInput,
  ArtistRepository,
  type PendingArtistQuery,
} from '../repositories/artistRepository.js';
import { SearchService } from './searchService.js';

export class ArtistService {
  constructor(
    private readonly repository = new ArtistRepository(),
    private readonly searchService = new SearchService()
  ) {}

  getArtistProfile(artistId: string): Promise<ArtistProfile | null> {
    return this.repository.findById(artistId);
  }

  getArtistProfileByUserId(userId: string): Promise<ArtistProfile | null> {
    return this.repository.findByUserId(userId);
  }

  updateArtistProfile(artistId: string, updates: ArtistProfileUpdateInput): Promise<ArtistProfile> {
    return this.repository.update(artistId, updates);
  }

  updateMyArtistProfile(userId: string, updates: ArtistProfileUpdateInput): Promise<ArtistProfile> {
    return this.repository.updateByUserId(userId, updates);
  }

  searchArtists(filters: ArtistSearchFilters): Promise<ArtistSearchResult[]> {
    return this.searchService.searchArtists(filters);
  }

  getPendingArtists(query: PendingArtistQuery) {
    return this.repository.findPending(query);
  }

  getPendingArtistById(artistId: string): Promise<PendingArtistDetail | null> {
    return this.repository.findPendingById(artistId);
  }

  activatePendingArtist(artistId: string, reviewerId?: string) {
    return this.repository.activatePendingArtist(artistId, reviewerId);
  }
}
