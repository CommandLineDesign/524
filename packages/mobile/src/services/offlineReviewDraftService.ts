import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export interface PhotoUploadState {
  uri: string;
  uploaded: boolean;
  s3Key?: string;
  publicUrl?: string;
  fileSize?: number;
  mimeType?: string;
  error?: string;
  retryCount: number;
}

export interface ReviewDraft {
  id: string;
  bookingId: string;
  overallRating: number;
  qualityRating: number;
  professionalismRating: number;
  timelinessRating: number;
  reviewText: string;
  photos: PhotoUploadState[];
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'uploading' | 'ready' | 'failed';
  lastError?: string;
}

const DRAFT_STORAGE_KEY_PREFIX = '@review_draft_';
const DRAFT_INDEX_KEY = '@review_drafts_index';
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Service for managing offline review drafts with photo upload state tracking
 */
export class OfflineReviewDraftService {
  private static instance: OfflineReviewDraftService;

  static getInstance(): OfflineReviewDraftService {
    if (!OfflineReviewDraftService.instance) {
      OfflineReviewDraftService.instance = new OfflineReviewDraftService();
    }
    return OfflineReviewDraftService.instance;
  }

  /**
   * Create a unique draft ID
   */
  private generateDraftId(bookingId: string): string {
    return `draft_${bookingId}_${Date.now()}`;
  }

  /**
   * Get storage key for a draft
   */
  private getDraftKey(draftId: string): string {
    return `${DRAFT_STORAGE_KEY_PREFIX}${draftId}`;
  }

  /**
   * Save or update a review draft
   */
  async saveDraft(params: {
    bookingId: string;
    overallRating: number;
    qualityRating: number;
    professionalismRating: number;
    timelinessRating: number;
    reviewText: string;
    photos: ImagePicker.ImagePickerAsset[];
    draftId?: string;
  }): Promise<string> {
    try {
      const draftId = params.draftId || this.generateDraftId(params.bookingId);
      const now = Date.now();

      // Convert photos to upload state
      const photoStates: PhotoUploadState[] = params.photos.map((photo) => ({
        uri: photo.uri,
        uploaded: false,
        fileSize: photo.fileSize,
        mimeType: photo.mimeType || 'image/jpeg',
        retryCount: 0,
      }));

      const draft: ReviewDraft = {
        id: draftId,
        bookingId: params.bookingId,
        overallRating: params.overallRating,
        qualityRating: params.qualityRating,
        professionalismRating: params.professionalismRating,
        timelinessRating: params.timelinessRating,
        reviewText: params.reviewText,
        photos: photoStates,
        createdAt: params.draftId ? (await this.getDraft(draftId))?.createdAt || now : now,
        updatedAt: now,
        status: 'draft',
      };

      // Save draft
      await AsyncStorage.setItem(this.getDraftKey(draftId), JSON.stringify(draft));

      // Update draft index
      await this.updateDraftIndex(draftId, params.bookingId);

      console.log('Review draft saved:', draftId);
      return draftId;
    } catch (error) {
      console.error('Failed to save review draft:', error);
      throw new Error('Failed to save draft. Please try again.');
    }
  }

  /**
   * Update draft index for quick lookups
   */
  private async updateDraftIndex(draftId: string, bookingId: string): Promise<void> {
    try {
      const indexJson = await AsyncStorage.getItem(DRAFT_INDEX_KEY);
      const index: Record<string, string> = indexJson ? JSON.parse(indexJson) : {};

      index[bookingId] = draftId;

      await AsyncStorage.setItem(DRAFT_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('Failed to update draft index:', error);
    }
  }

  /**
   * Get a review draft by ID
   */
  async getDraft(draftId: string): Promise<ReviewDraft | null> {
    try {
      const draftJson = await AsyncStorage.getItem(this.getDraftKey(draftId));
      return draftJson ? JSON.parse(draftJson) : null;
    } catch (error) {
      console.error('Failed to get review draft:', error);
      return null;
    }
  }

  /**
   * Get draft for a specific booking
   */
  async getDraftForBooking(bookingId: string): Promise<ReviewDraft | null> {
    try {
      const indexJson = await AsyncStorage.getItem(DRAFT_INDEX_KEY);
      const index: Record<string, string> = indexJson ? JSON.parse(indexJson) : {};

      const draftId = index[bookingId];
      if (!draftId) return null;

      return this.getDraft(draftId);
    } catch (error) {
      console.error('Failed to get draft for booking:', error);
      return null;
    }
  }

  /**
   * Get all drafts
   */
  async getAllDrafts(): Promise<ReviewDraft[]> {
    try {
      const indexJson = await AsyncStorage.getItem(DRAFT_INDEX_KEY);
      const index: Record<string, string> = indexJson ? JSON.parse(indexJson) : {};

      const drafts: ReviewDraft[] = [];
      for (const draftId of Object.values(index)) {
        const draft = await this.getDraft(draftId);
        if (draft) {
          drafts.push(draft);
        }
      }

      return drafts.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('Failed to get all drafts:', error);
      return [];
    }
  }

  /**
   * Update photo upload state
   */
  async updatePhotoState(
    draftId: string,
    photoUri: string,
    updates: Partial<PhotoUploadState>
  ): Promise<void> {
    try {
      const draft = await this.getDraft(draftId);
      if (!draft) return;

      const photoIndex = draft.photos.findIndex((p) => p.uri === photoUri);
      if (photoIndex === -1) return;

      draft.photos[photoIndex] = { ...draft.photos[photoIndex], ...updates };
      draft.updatedAt = Date.now();

      await AsyncStorage.setItem(this.getDraftKey(draftId), JSON.stringify(draft));
    } catch (error) {
      console.error('Failed to update photo state:', error);
    }
  }

  /**
   * Update draft status
   */
  async updateDraftStatus(
    draftId: string,
    status: ReviewDraft['status'],
    error?: string
  ): Promise<void> {
    try {
      const draft = await this.getDraft(draftId);
      if (!draft) return;

      draft.status = status;
      draft.updatedAt = Date.now();
      if (error) {
        draft.lastError = error;
      }

      await AsyncStorage.setItem(this.getDraftKey(draftId), JSON.stringify(draft));
    } catch (error) {
      console.error('Failed to update draft status:', error);
    }
  }

  /**
   * Check if all photos are uploaded
   */
  async areAllPhotosUploaded(draftId: string): Promise<boolean> {
    const draft = await this.getDraft(draftId);
    if (!draft) return false;

    return draft.photos.length === 0 || draft.photos.every((photo) => photo.uploaded);
  }

  /**
   * Get photos that need to be uploaded
   */
  async getPendingPhotos(draftId: string): Promise<PhotoUploadState[]> {
    const draft = await this.getDraft(draftId);
    if (!draft) return [];

    return draft.photos.filter((photo) => !photo.uploaded && photo.retryCount < MAX_RETRY_ATTEMPTS);
  }

  /**
   * Delete a draft
   */
  async deleteDraft(draftId: string): Promise<void> {
    try {
      const draft = await this.getDraft(draftId);
      if (!draft) return;

      // Remove from storage
      await AsyncStorage.removeItem(this.getDraftKey(draftId));

      // Remove from index
      const indexJson = await AsyncStorage.getItem(DRAFT_INDEX_KEY);
      const index: Record<string, string> = indexJson ? JSON.parse(indexJson) : {};
      delete index[draft.bookingId];
      await AsyncStorage.setItem(DRAFT_INDEX_KEY, JSON.stringify(index));

      console.log('Review draft deleted:', draftId);
    } catch (error) {
      console.error('Failed to delete review draft:', error);
    }
  }

  /**
   * Clean up old completed drafts
   */
  async cleanupOldDrafts(maxAgeMs = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const drafts = await this.getAllDrafts();
      const now = Date.now();

      for (const draft of drafts) {
        const age = now - draft.updatedAt;

        // Delete drafts that are old and completed/failed
        if (age > maxAgeMs && (draft.status === 'ready' || draft.status === 'failed')) {
          await this.deleteDraft(draft.id);
        }
      }

      console.log('Cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup old drafts:', error);
    }
  }

  /**
   * Get draft statistics
   */
  async getDraftStats(): Promise<{
    total: number;
    draft: number;
    uploading: number;
    ready: number;
    failed: number;
  }> {
    try {
      const drafts = await this.getAllDrafts();

      return {
        total: drafts.length,
        draft: drafts.filter((d) => d.status === 'draft').length,
        uploading: drafts.filter((d) => d.status === 'uploading').length,
        ready: drafts.filter((d) => d.status === 'ready').length,
        failed: drafts.filter((d) => d.status === 'failed').length,
      };
    } catch (error) {
      console.error('Failed to get draft stats:', error);
      return { total: 0, draft: 0, uploading: 0, ready: 0, failed: 0 };
    }
  }

  /**
   * Clear all drafts (e.g., on logout)
   */
  async clearAllDrafts(): Promise<void> {
    try {
      const drafts = await this.getAllDrafts();

      for (const draft of drafts) {
        await AsyncStorage.removeItem(this.getDraftKey(draft.id));
      }

      await AsyncStorage.removeItem(DRAFT_INDEX_KEY);

      console.log('All review drafts cleared');
    } catch (error) {
      console.error('Failed to clear all drafts:', error);
    }
  }
}
