import axios from 'axios';

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
  return new Promise((resolve, reject) => {
    // This is a simplified version - in a real app you'd use a proper image library
    // For now, we'll return placeholder values
    // You might want to use react-native-image-size or similar library

    // Simulate getting image dimensions
    // In practice, you'd need to:
    // 1. Use Image.getSize() from react-native
    // 2. Or use a library like react-native-image-size
    // 3. Get file size using RNFS.stat()

    resolve({
      width: 1920, // Placeholder
      height: 1080, // Placeholder
      fileSize: 1024 * 1024, // 1MB placeholder
    });
  });
}
