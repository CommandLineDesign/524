import type { ArtistDetail, PendingArtistDetail } from '@524/shared/admin';
import type { ArtistProfile, ArtistSearchFilters, ArtistSearchResult } from '@524/shared/artists';

import {
  type ArtistProfileUpdateInput,
  type ArtistQuery,
  ArtistRepository,
  type PendingArtistQuery,
} from '../repositories/artistRepository.js';
import { type FilteredArtistSearchFilters, SearchService } from './searchService.js';

export class ArtistService {
  constructor(
    private readonly repository = new ArtistRepository(),
    private readonly searchService = new SearchService()
  ) {}

  getArtistProfile(artistProfileId: string): Promise<ArtistProfile | null> {
    return this.repository.findById(artistProfileId);
  }

  getArtistProfileByUserId(userId: string): Promise<ArtistProfile | null> {
    return this.repository.findByUserId(userId);
  }

  updateArtistProfile(
    artistProfileId: string,
    updates: ArtistProfileUpdateInput
  ): Promise<ArtistProfile> {
    return this.repository.update(artistProfileId, updates);
  }

  updateArtistProfileById(
    artistProfileId: string,
    updates: ArtistProfileUpdateInput
  ): Promise<ArtistProfile> {
    return this.repository.update(artistProfileId, updates);
  }

  updateMyArtistProfile(userId: string, updates: ArtistProfileUpdateInput): Promise<ArtistProfile> {
    return this.repository.updateByUserId(userId, updates);
  }

  searchArtists(filters: ArtistSearchFilters): Promise<ArtistSearchResult[]> {
    return this.searchService.searchArtists(filters);
  }

  searchArtistsFiltered(filters: FilteredArtistSearchFilters): Promise<ArtistSearchResult[]> {
    return this.searchService.searchArtistsFiltered(filters);
  }

  getPendingArtists(query: PendingArtistQuery) {
    return this.repository.findPending(query);
  }

  getPendingArtistById(userId: string): Promise<PendingArtistDetail | null> {
    return this.repository.findPendingById(userId);
  }

  activatePendingArtist(userId: string, reviewerId?: string) {
    return this.repository.activatePendingArtist(userId, reviewerId);
  }

  getAllArtists(query: ArtistQuery) {
    return this.repository.findAllArtists(query);
  }

  getArtistDetailById(artistProfileId: string): Promise<ArtistDetail | null> {
    return this.repository.findArtistDetailById(artistProfileId);
  }

  updateArtistAdmin(
    artistProfileId: string,
    updates: Partial<{
      isAcceptingBookings: boolean;
      verificationStatus: ArtistProfile['verificationStatus'];
      reviewNotes: string;
    }>
  ) {
    return this.repository.updateArtistAdmin(artistProfileId, updates);
  }

  /**
   * Recalculate and update artist review statistics
   * This should be called whenever reviews are added, updated, or removed
   */
  async recalculateArtistReviewStats(artistId: string): Promise<void> {
    const reviewRepository = (await import('../repositories/reviewRepository.js')).ReviewRepository;
    const reviewRepo = new reviewRepository();

    const stats = await reviewRepo.getArtistReviewStats(artistId);

    await this.repository.updateReviewStats(artistId, {
      averageRating: stats.averageOverallRating,
      totalReviews: stats.totalReviews,
    });
  }
}
