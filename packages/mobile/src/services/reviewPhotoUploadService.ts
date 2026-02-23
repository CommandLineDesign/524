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
  try {
    const response = await apiClient.post<PresignedUploadResponse>(
      '/api/v1/uploads/review-photos/presign',
      {
        contentType,
        contentLength,
        bookingId,
      }
    );

    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const statusCode =
      (error as { status?: number; response?: { status?: number } })?.status ||
      (error as { status?: number; response?: { status?: number } })?.response?.status;

    // Provide user-friendly error messages based on the error
    const is400Error = statusCode === 400 || errorMessage.includes('400');
    if (is400Error) {
      if (errorMessage.includes('Invalid content type')) {
        throw new Error('Unsupported image format. Please use JPEG, PNG, or WebP images.');
      }
      if (errorMessage.includes('File too large')) {
        throw new Error('Image file is too large. Maximum size is 5MB.');
      }
      if (errorMessage.includes('bookingId is required')) {
        throw new Error('Booking information is missing. Please try again.');
      }
    }

    const is401Error = statusCode === 401 || errorMessage.includes('401');
    if (is401Error) {
      throw new Error('Authentication required. Please log in and try again.');
    }

    const is403Error = statusCode === 403 || errorMessage.includes('403');
    if (is403Error) {
      throw new Error('You do not have permission to upload photos for this booking.');
    }

    if (errorMessage.includes('Network request failed') || errorMessage.includes('timeout')) {
      throw new Error(
        'Network connection failed. Please check your internet connection and try again.'
      );
    }

    // Generic fallback
    throw new Error('Failed to prepare photo upload. Please try again.');
  }
}

/**
 * Upload file to S3 using presigned URL
 */
async function uploadToS3(signedUrl: string, fileUri: string, contentType: string): Promise<void> {
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
    throw new Error('Unable to determine file size. Please try selecting the image again.');
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
    throw new Error('Failed to upload photo. Please try again.');
  }
}

/**
 * Pick multiple images from device gallery
 * Returns up to maxCount images
 */
export async function pickReviewPhotos(maxCount = 5): Promise<ImagePicker.ImagePickerAsset[]> {
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
}

/**
 * Retry utility with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error = new Error('Unknown error occurred');

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      // Check if error is retryable (network errors, 5xx status codes, timeouts)
      const isRetryable =
        lastError.message.includes('Network request failed') ||
        lastError.message.includes('timeout') ||
        lastError.message.includes('S3 upload failed') ||
        lastError.message.includes('Failed to upload photo');

      if (!isRetryable) {
        break;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * 2 ** attempt + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Upload multiple review photos with parallel processing and progress tracking
 */
export async function uploadReviewPhotos(
  images: ImagePicker.ImagePickerAsset[],
  bookingId?: string,
  onProgress?: (current: number, total: number) => void
): Promise<ReviewPhotoUploadResult[]> {
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  // Pre-validate all images before uploading
  const validatedImages: Array<{
    image: ImagePicker.ImagePickerAsset;
    fileSize: number;
    contentType: string;
  }> = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    // Get file size
    const fileSize = image.fileSize ?? (await getFileSize(image.uri));

    // Validate file size
    if (fileSize > maxFileSize) {
      throw new Error(`Image ${i + 1} exceeds 5MB limit`);
    }

    // Determine content type
    if (!image.mimeType) {
      throw new Error(`Image ${i + 1} mime type is required`);
    }
    const contentType = image.mimeType;

    // Validate content type
    if (!allowedTypes.includes(contentType)) {
      throw new Error(`Image ${i + 1} has unsupported format`);
    }

    validatedImages.push({ image, fileSize, contentType });
  }

  // Upload all photos in parallel using Promise.allSettled for better error handling
  let completed = 0;
  const uploadPromises = validatedImages.map(async ({ image, fileSize, contentType }) => {
    const result = await retryWithBackoff(
      () =>
        uploadReviewPhoto({
          imageUri: image.uri,
          bookingId,
          contentType,
          contentLength: fileSize,
        }),
      3, // maxRetries
      1000 // baseDelay
    );

    // Report progress for successful uploads with atomic increment
    if (onProgress) {
      onProgress(++completed, images.length);
    }

    return result;
  });

  // Wait for all uploads to complete (parallel execution)
  const results = await Promise.allSettled(uploadPromises);

  // Process results and throw if any failed
  const successfulResults: ReviewPhotoUploadResult[] = [];
  const failures: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successfulResults.push(result.value);
    } else {
      failures.push(`Image ${index + 1}: ${result.reason.message}`);
    }
  });

  if (failures.length > 0) {
    throw new Error(`Upload failed for ${failures.length} image(s): ${failures.join(', ')}`);
  }

  return successfulResults;
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

    if (!fileSize || fileSize > maxFileSize) {
      return {
        valid: false,
        error: !fileSize
          ? `Photo ${i + 1} file size could not be determined`
          : `Photo ${i + 1} exceeds 5MB limit`,
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
