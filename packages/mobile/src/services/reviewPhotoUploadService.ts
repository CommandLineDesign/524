import * as ImagePicker from 'expo-image-picker';

import { apiClient } from '../api/client';

export interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
  bucket: string;
  publicUrl: string;
  contentType: string;
  maxBytes: number;
}

export interface ReviewPhotoUploadResult {
  publicUrl: string;
  key: string;
  fileSize: number;
  mimeType: string;
}

export interface UploadReviewPhotoParams {
  imageUri: string;
  bookingId?: string;
  contentType: string;
  contentLength: number;
}

/**
 * Get presigned URL for review photo upload
 */
async function getPresignedUrl(
  contentType: string,
  contentLength: number,
  bookingId?: string
): Promise<PresignedUploadResponse> {
  const response = await apiClient.post<PresignedUploadResponse>('/uploads/review-photo/presign', {
    contentType,
    contentLength,
    bookingId,
  });

  return response;
}

/**
 * Upload file to S3 using presigned URL
 */
async function uploadToS3(signedUrl: string, fileUri: string, contentType: string): Promise<void> {
  try {
    // Convert file URI to blob for upload
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Upload to S3
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': contentType,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
}

/**
 * Get file size from URI
 */
async function getFileSize(uri: string): Promise<number> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    console.error('Failed to get file size:', error);
    // Return a default size if we can't determine it
    return 1024 * 1024; // 1MB default
  }
}

/**
 * Upload a review photo to S3
 */
export async function uploadReviewPhoto(
  params: UploadReviewPhotoParams
): Promise<ReviewPhotoUploadResult> {
  const { imageUri, bookingId, contentType, contentLength } = params;

  try {
    // Step 1: Get presigned upload URL from our API
    const presignedData = await getPresignedUrl(contentType, contentLength, bookingId);

    // Step 2: Upload the image to S3 using the presigned URL
    await uploadToS3(presignedData.uploadUrl, imageUri, contentType);

    return {
      publicUrl: presignedData.publicUrl,
      key: presignedData.key,
      fileSize: contentLength,
      mimeType: contentType,
    };
  } catch (error) {
    console.error('Review photo upload failed:', error);
    throw new Error('Failed to upload photo. Please try again.');
  }
}

/**
 * Pick multiple images from device gallery
 * Returns up to maxCount images
 */
export async function pickReviewPhotos(maxCount = 5): Promise<ImagePicker.ImagePickerAsset[]> {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      throw new Error('Permission to access media library is required');
    }

    // Launch image picker with multi-select
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: maxCount,
      quality: 0.8, // Compress images to 80% quality
      allowsEditing: false,
    });

    if (result.canceled) {
      return [];
    }

    return result.assets;
  } catch (error) {
    console.error('Failed to pick images:', error);
    throw error;
  }
}

/**
 * Upload multiple review photos with progress tracking
 */
export async function uploadReviewPhotos(
  images: ImagePicker.ImagePickerAsset[],
  bookingId?: string,
  onProgress?: (current: number, total: number) => void
): Promise<ReviewPhotoUploadResult[]> {
  const results: ReviewPhotoUploadResult[] = [];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    try {
      // Get file size
      const fileSize = image.fileSize ?? (await getFileSize(image.uri));

      // Validate file size
      if (fileSize > maxFileSize) {
        throw new Error(`Image ${i + 1} exceeds 5MB limit`);
      }

      // Determine content type
      const contentType = image.mimeType || 'image/jpeg';

      // Validate content type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(contentType)) {
        throw new Error(`Image ${i + 1} has unsupported format`);
      }

      // Upload the photo
      const result = await uploadReviewPhoto({
        imageUri: image.uri,
        bookingId,
        contentType,
        contentLength: fileSize,
      });

      results.push(result);

      // Report progress
      if (onProgress) {
        onProgress(i + 1, images.length);
      }
    } catch (error) {
      console.error(`Failed to upload image ${i + 1}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Validate photo constraints
 */
export function validateReviewPhotos(images: ImagePicker.ImagePickerAsset[]): {
  valid: boolean;
  error?: string;
} {
  if (images.length === 0) {
    return { valid: true }; // Photos are optional
  }

  if (images.length > 5) {
    return {
      valid: false,
      error: 'Maximum 5 photos allowed per review',
    };
  }

  const maxFileSize = 5 * 1024 * 1024; // 5MB
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const fileSize = image.fileSize;

    if (fileSize && fileSize > maxFileSize) {
      return {
        valid: false,
        error: `Photo ${i + 1} exceeds 5MB limit`,
      };
    }

    const contentType = image.mimeType || 'image/jpeg';
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      return {
        valid: false,
        error: `Photo ${i + 1} has unsupported format (use JPEG, PNG, or WebP)`,
      };
    }
  }

  return { valid: true };
}
