import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: SaveFormat;
}

export interface CompressedImageResult {
  uri: string;
  width: number;
  height: number;
  fileName?: string;
  fileSize?: number;
}

/**
 * Compress and resize an image for messaging
 */
export async function compressImageForMessaging(
  imageUri: string,
  options: ImageCompressionOptions = {}
): Promise<CompressedImageResult> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.8, format = SaveFormat.JPEG } = options;

  try {
    const manipResult = await manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format,
      }
    );

    return {
      uri: manipResult.uri,
      width: manipResult.width,
      height: manipResult.height,
      fileName: generateFileName(),
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original image if compression fails
    return {
      uri: imageUri,
      width: 0, // Unknown
      height: 0, // Unknown
      fileName: generateFileName(),
    };
  }
}

/**
 * Generate a unique filename for the compressed image
 */
function generateFileName(): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  return `chat_image_${timestamp}_${randomId}.jpg`;
}

/**
 * Validate image dimensions and file size
 */
export function validateImageConstraints(
  width: number,
  height: number,
  fileSize?: number
): { valid: boolean; error?: string } {
  const maxDimension = 4096; // 4K resolution max
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  if (width > maxDimension || height > maxDimension) {
    return {
      valid: false,
      error: `Image dimensions too large. Maximum allowed: ${maxDimension}x${maxDimension}px`,
    };
  }

  if (fileSize && fileSize > maxFileSize) {
    return {
      valid: false,
      error: 'Image file size too large. Maximum allowed: 10MB',
    };
  }

  return { valid: true };
}
