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

export interface PresignedUpload {
  uploadUrl: string;
  key: string;
  bucket: string;
  publicUrl: string;
}

export async function createPresignedUploadUrl(params: {
  userId: string;
  folder: string;
  contentType: string;
  expiresInSeconds?: number;
}): Promise<PresignedUpload> {
  const client = getS3Client();
  const expiresIn = params.expiresInSeconds ?? 300;
  const key = `${params.folder}/${params.userId}/${randomUUID()}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET as string,
    Key: key,
    ContentType: params.contentType,
    ACL: 'public-read', // Profile photos are safe to be public; public URL avoids expiring links
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  const publicUrlBase =
    env.S3_PUBLIC_BASE_URL ??
    (env.S3_REGION && env.S3_BUCKET
      ? `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com`
      : undefined);

  logger.debug({ key, bucket: env.S3_BUCKET, expiresIn }, 'Generated presigned upload URL');

  return {
    uploadUrl,
    key,
    bucket: env.S3_BUCKET as string,
    publicUrl: publicUrlBase ? `${publicUrlBase}/${key}` : key,
  };
}
