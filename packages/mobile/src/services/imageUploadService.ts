import { Image } from 'react-native';

import { apiClient } from '../api/client';

export interface UploadImageParams {
  imageUri: string;
  conversationId: string;
  fileName: string;
  fileType: string;
}

export interface UploadImageResult {
  publicUrl: string;
  key: string;
}

/**
 * Upload an image to S3 for messaging
 */
export async function uploadMessageImage(params: UploadImageParams): Promise<UploadImageResult> {
  const { imageUri, conversationId, fileName, fileType } = params;

  try {
    // Step 1: Get signed upload URL from our API
    const response = await apiClient.post<{
      success: boolean;
      data: { uploadUrl: string; key: string; publicUrl: string };
    }>('/messaging/upload-image', {
      fileName,
      fileType,
      conversationId,
    });

    const { uploadUrl, key, publicUrl } = response.data;

    // Step 2: Upload the image to S3 using the signed URL
    await uploadToS3(uploadUrl, imageUri, fileType);

    return {
      publicUrl,
      key,
    };
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}

/**
 * Upload file to S3 using signed URL
 */
async function uploadToS3(signedUrl: string, fileUri: string, contentType: string): Promise<void> {
  try {
    // Convert file URI to blob/data for upload
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
 * Process and upload an image with compression
 */
export async function processAndUploadImage(
  imageUri: string,
  conversationId: string
): Promise<UploadImageResult> {
  const { compressImageForMessaging, validateImageConstraints } = await import(
    '../utils/imageCompression'
  );

  try {
    // Get image info first
    const imageInfo = await getImageInfo(imageUri);

    // Validate constraints
    const validation = validateImageConstraints(
      imageInfo.width,
      imageInfo.height,
      imageInfo.fileSize
    );

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Compress the image
    const compressedImage = await compressImageForMessaging(imageUri);

    // Upload the compressed image
    return await uploadMessageImage({
      imageUri: compressedImage.uri,
      conversationId,
      fileName: compressedImage.fileName || 'chat_image.jpg',
      fileType: 'image/jpeg',
    });
  } catch (error) {
    console.error('Image processing/upload failed:', error);
    throw error;
  }
}

/**
 * Get basic image information
 */
async function getImageInfo(uri: string): Promise<{
  width: number;
  height: number;
  fileSize?: number;
}> {
  // Get image dimensions using React Native's Image API
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(new Error(`Failed to get image dimensions: ${error}`))
    );
  });

  // Get file size by fetching the blob
  let fileSize: number | undefined;
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    fileSize = blob.size;
  } catch (error) {
    console.warn('Could not determine file size:', error);
  }

  return {
    width: dimensions.width,
    height: dimensions.height,
    fileSize,
  };
}
