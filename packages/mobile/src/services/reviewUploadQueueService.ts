import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo/lib/typescript/src/internal/types';

import { SubmitReviewPayload, submitReview } from '../api/client';
import {
  OfflineReviewDraftService,
  type PhotoUploadState,
  type ReviewDraft,
} from './offlineReviewDraftService';
import { uploadReviewPhoto } from './reviewPhotoUploadService';

/**
 * Service for managing background upload queue for review drafts
 */
export class ReviewUploadQueueService {
  private static instance: ReviewUploadQueueService;
  private isProcessing = false;
  private processingInterval: ReturnType<typeof setInterval> | null = null;
  private readonly PROCESSING_INTERVAL_MS = 30000; // 30 seconds

  static getInstance(): ReviewUploadQueueService {
    if (!ReviewUploadQueueService.instance) {
      ReviewUploadQueueService.instance = new ReviewUploadQueueService();
    }
    return ReviewUploadQueueService.instance;
  }

  /**
   * Start automatic background processing
   */
  startAutoProcessing(): void {
    if (this.processingInterval) {
      return;
    }

    console.log('Starting auto-processing for review upload queue');

    // Process immediately
    this.processQueue();

    // Set up periodic processing
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.PROCESSING_INTERVAL_MS);

    // Listen for network changes
    NetInfo.addEventListener((state: NetInfoState) => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('Network connected, processing review upload queue');
        this.processQueue();
      }
    });
  }

  /**
   * Stop automatic background processing
   */
  stopAutoProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('Stopped auto-processing for review upload queue');
    }
  }

  /**
   * Process the upload queue
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('Queue processing already in progress');
      return;
    }

    // Check network connectivity
    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) {
      console.log('No internet connection, skipping queue processing');
      return;
    }

    this.isProcessing = true;

    try {
      const draftService = OfflineReviewDraftService.getInstance();
      const drafts = await draftService.getAllDrafts();

      // Filter drafts that need processing
      const draftsToProcess = drafts.filter(
        (draft) =>
          draft.status === 'draft' || draft.status === 'uploading' || draft.status === 'failed'
      );

      if (draftsToProcess.length === 0) {
        console.log('No drafts to process');
        return;
      }

      console.log(`Processing ${draftsToProcess.length} review draft(s)`);

      for (const draft of draftsToProcess) {
        try {
          await this.processDraft(draft);
        } catch (error) {
          console.error(`Failed to process draft ${draft.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error processing review upload queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single draft
   */
  private async processDraft(draft: ReviewDraft): Promise<void> {
    const draftService = OfflineReviewDraftService.getInstance();

    try {
      // Update status to uploading
      await draftService.updateDraftStatus(draft.id, 'uploading');

      // Step 1: Upload pending photos
      if (draft.photos.length > 0) {
        const pendingPhotos = await draftService.getPendingPhotos(draft.id);

        for (const photo of pendingPhotos) {
          try {
            console.log(`Uploading photo: ${photo.uri}`);

            const result = await uploadReviewPhoto({
              imageUri: photo.uri,
              bookingId: draft.bookingId,
              contentType: photo.mimeType || 'image/jpeg',
              contentLength: photo.fileSize || 0,
            });

            // Update photo state
            await draftService.updatePhotoState(draft.id, photo.uri, {
              uploaded: true,
              s3Key: result.key,
              publicUrl: result.publicUrl,
              error: undefined,
            });

            console.log(`Photo uploaded successfully: ${result.key}`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            console.error('Photo upload failed:', error);

            // Update photo with error and increment retry count
            await draftService.updatePhotoState(draft.id, photo.uri, {
              error: errorMessage,
              retryCount: photo.retryCount + 1,
            });
          }
        }
      }

      // Step 2: Check if all photos are uploaded
      const allPhotosUploaded = await draftService.areAllPhotosUploaded(draft.id);

      if (!allPhotosUploaded) {
        console.log('Not all photos uploaded, will retry later');
        await draftService.updateDraftStatus(draft.id, 'failed', 'Some photos failed to upload');
        return;
      }

      // Step 3: Submit the review
      const updatedDraft = await draftService.getDraft(draft.id);
      if (!updatedDraft) {
        throw new Error('Draft not found');
      }

      const reviewImageKeys = updatedDraft.photos
        .filter((p) => p.uploaded && p.s3Key)
        .map((photo, index) => ({
          s3Key: photo.s3Key as string,
          fileSize: photo.fileSize || 0,
          mimeType: photo.mimeType || 'image/jpeg',
          displayOrder: index,
        }));

      const payload: SubmitReviewPayload = {
        overallRating: updatedDraft.overallRating,
        qualityRating: updatedDraft.qualityRating,
        professionalismRating: updatedDraft.professionalismRating,
        timelinessRating: updatedDraft.timelinessRating,
        reviewText: updatedDraft.reviewText.trim() || undefined,
        reviewImageKeys: reviewImageKeys.length > 0 ? reviewImageKeys : undefined,
      };

      await submitReview(updatedDraft.bookingId, payload);

      // Step 4: Mark as ready and delete draft
      await draftService.updateDraftStatus(draft.id, 'ready');
      console.log(`Review submitted successfully for booking ${draft.bookingId}`);

      // Clean up the draft after successful submission
      setTimeout(() => {
        draftService.deleteDraft(draft.id);
      }, 5000); // Keep for 5 seconds for user feedback
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to process draft ${draft.id}:`, error);
      await draftService.updateDraftStatus(draft.id, 'failed', errorMessage);
    }
  }

  /**
   * Manually trigger processing for a specific draft
   */
  async processDraftById(draftId: string): Promise<void> {
    const draftService = OfflineReviewDraftService.getInstance();
    const draft = await draftService.getDraft(draftId);

    if (!draft) {
      throw new Error('Draft not found');
    }

    await this.processDraft(draft);
  }

  /**
   * Get processing status
   */
  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}
