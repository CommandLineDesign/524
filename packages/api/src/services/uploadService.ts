import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { env } from '../config/env.js';

if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS credentials not configured');
}

const s3Client = new S3Client({
  region: env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export interface UploadImageResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

/**
 * Generate a signed URL for uploading an image to S3
 */
export async function uploadMessageImage(params: {
  fileName: string;
  fileType: string;
  conversationId: string;
  userId: string;
}): Promise<UploadImageResult> {
  const { fileName, fileType, conversationId, userId } = params;

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(fileType.toLowerCase())) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
  }

  // Generate unique key for the file
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const key = `chat/${conversationId}/${timestamp}_${randomId}.${extension}`;

  const bucketName = env.AWS_S3_BUCKET || '524-chat-media';

  // Create the PutObject command
  const putObjectCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
    // Set proper ACL for public read access
    ACL: 'public-read',
    // Add metadata for tracking
    Metadata: {
      uploadedBy: userId,
      conversationId,
      originalFileName: fileName,
    },
  });

  // Generate signed URL (expires in 5 minutes)
  const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
    expiresIn: 300, // 5 minutes
  });

  // Generate public URL for accessing the uploaded file
  const publicUrl = `https://${bucketName}.s3.${env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    key,
    publicUrl,
  };
}

/**
 * Delete an image from S3 (for cleanup or moderation)
 */
export async function deleteMessageImage(key: string): Promise<void> {
  const bucketName = env.AWS_S3_BUCKET || '524-chat-media';

  // Note: This would require delete permissions and proper error handling
  // For now, we'll just log the intent
  console.log(`Image deletion requested for key: ${key} in bucket: ${bucketName}`);

  // In production, implement actual S3 deletion:
  // const deleteCommand = new DeleteObjectCommand({
  //   Bucket: bucketName,
  //   Key: key,
  // });
  // await s3Client.send(deleteCommand);
}

/**
 * Get a signed URL for viewing a private image (if needed in future)
 */
export async function getImageViewUrl(key: string, expiresIn = 3600): Promise<string> {
  const bucketName = env.AWS_S3_BUCKET || '524-chat-media';

  const getObjectCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await getSignedUrl(s3Client, getObjectCommand, { expiresIn });
}
