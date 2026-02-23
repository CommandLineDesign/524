import * as ImagePicker from 'expo-image-picker';

import { apiClient } from '../api/client';
import { compressImageForMessaging } from '../utils/imageCompression';

export interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
  bucket: string;
  publicUrl: string;
  contentType: string;
  maxBytes: number;
}

export interface BookingReferencePhotoResult {
  publicUrl: string;
  key: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Get presigned URL for booking reference photo upload
 */
async function getPresignedUrl(
  contentType: string,
  contentLength: number
): Promise<PresignedUploadResponse> {
  try {
    const response = await apiClient.post<PresignedUploadResponse>(
      '/api/v1/uploads/booking-reference-photos/presign',
      {
        contentType,
        contentLength,
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
        throw new Error('지원하지 않는 이미지 형식입니다. JPEG, PNG, WebP 이미지를 사용해주세요.');
      }
      if (errorMessage.includes('File too large')) {
        throw new Error('이미지 파일이 너무 큽니다. 최대 5MB까지 업로드할 수 있습니다.');
      }
    }

    const is401Error = statusCode === 401 || errorMessage.includes('401');
    if (is401Error) {
      throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
    }

    if (errorMessage.includes('Network request failed') || errorMessage.includes('timeout')) {
      throw new Error('네트워크 연결에 실패했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.');
    }

    // Generic fallback
    throw new Error('이미지 업로드 준비에 실패했습니다. 다시 시도해주세요.');
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
    throw new Error(`S3 업로드 실패: ${uploadResponse.status}`);
  }
}

/**
 * Pick a single image from device gallery for booking reference
 * Allows editing (cropping) and uses square aspect ratio
 */
export async function pickBookingReferencePhoto(): Promise<ImagePicker.ImagePickerAsset | null> {
  // Request permissions
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('갤러리 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.');
  }

  // Launch image picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: false,
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1], // Square aspect ratio for style reference
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return result.assets[0];
}

/**
 * Upload booking reference photo to S3
 * Compresses the image before upload for optimal file size
 */
export async function uploadBookingReferencePhoto(
  imageUri: string
): Promise<BookingReferencePhotoResult> {
  try {
    // Compress the image first (max 1200px, 80% quality)
    const compressed = await compressImageForMessaging(imageUri, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      format: 'jpeg',
    });

    // Get file blob to determine size
    const response = await fetch(compressed.uri);
    const blob = await response.blob();
    const fileSize = blob.size;
    const contentType = 'image/jpeg'; // After compression it's always JPEG

    // Validate file size
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (fileSize > maxFileSize) {
      throw new Error('이미지 파일이 너무 큽니다. 최대 5MB까지 업로드할 수 있습니다.');
    }

    // Get presigned URL
    const presignedData = await getPresignedUrl(contentType, fileSize);

    // Upload to S3
    await uploadToS3(presignedData.uploadUrl, compressed.uri, contentType);

    return {
      publicUrl: presignedData.publicUrl,
      key: presignedData.key,
      fileSize,
      mimeType: contentType,
    };
  } catch (error) {
    // Re-throw user-friendly errors
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
  }
}
