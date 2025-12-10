import { randomUUID } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { env } from '../config/env.js';
import { logger } from './logger.js';

export function getS3Client() {
  if (!env.S3_REGION || !env.S3_BUCKET || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY) {
    throw new Error(
      'S3 configuration missing. Set S3_REGION, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY.'
    );
  }

  return new S3Client({
    region: env.S3_REGION as string,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY as string,
      secretAccessKey: env.S3_SECRET_KEY as string,
    },
  });
}

const DEFAULT_ALLOWED_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB cap for profile photos

export interface PresignedUpload {
  uploadUrl: string;
  key: string;
  bucket: string;
  publicUrl: string;
  contentType: string;
  maxBytes: number;
}

export async function createPresignedUploadUrl(params: {
  userId: string;
  folder: string;
  contentType: string;
  contentLength: number;
  expiresInSeconds?: number;
  allowedContentTypes?: string[];
  maxBytes?: number;
}): Promise<PresignedUpload> {
  const allowedTypes = params.allowedContentTypes ?? DEFAULT_ALLOWED_UPLOAD_TYPES;
  const maxBytes = params.maxBytes ?? DEFAULT_MAX_UPLOAD_BYTES;

  if (!allowedTypes.includes(params.contentType)) {
    throw Object.assign(new Error('Unsupported content type'), { status: 400 });
  }

  if (!Number.isFinite(params.contentLength) || params.contentLength <= 0) {
    throw Object.assign(new Error('Missing or invalid content length'), { status: 400 });
  }

  if (params.contentLength > maxBytes) {
    throw Object.assign(new Error('File too large'), { status: 400, maxBytes });
  }

  const client = getS3Client();
  const expiresIn = params.expiresInSeconds ?? 300;
  const key = `${params.folder}/${params.userId}/${randomUUID()}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET as string,
    Key: key,
    ContentType: params.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  const presignUrl = new URL(uploadUrl);
  const signedHeaders = presignUrl.searchParams.get('X-Amz-SignedHeaders');
  const signedCredential = presignUrl.searchParams.get('X-Amz-Credential');
  const signedDate = presignUrl.searchParams.get('X-Amz-Date');
  const publicUrlBase =
    env.S3_PUBLIC_BASE_URL ??
    (env.S3_REGION && env.S3_BUCKET
      ? `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com`
      : undefined);

  logger.debug(
    {
      key,
      bucket: env.S3_BUCKET,
      contentType: params.contentType,
      contentLength: params.contentLength,
      expiresIn,
      signedHeaders,
      signedCredential,
      signedDate,
    },
    'Generated presigned upload URL'
  );

  return {
    uploadUrl,
    key,
    bucket: env.S3_BUCKET as string,
    publicUrl: publicUrlBase ? `${publicUrlBase}/${key}` : key,
    contentType: params.contentType,
    maxBytes,
  };
}
