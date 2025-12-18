# S3 Upload Setup and Specifications

This document provides comprehensive specifications for the S3 upload system used throughout the 524 Beauty Marketplace application. It covers everything needed to implement and reuse S3 uploads for any feature requiring file storage.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Environment Configuration](#environment-configuration)
4. [Core Components](#core-components)
5. [Upload Patterns](#upload-patterns)
6. [API Endpoints](#api-endpoints)
7. [File Constraints](#file-constraints)
8. [Implementation Examples](#implementation-examples)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

## Overview

The S3 upload system provides secure, scalable file storage with presigned URLs for direct browser/mobile uploads. It supports multiple use cases including profile photos, message images, and can be extended for other file types.

### Key Features

- **Presigned URLs**: Secure, time-limited upload URLs
- **Multiple upload patterns**: Profile photos (presigned) and message images (service-based)
- **Client-side compression**: Automatic image optimization
- **Type validation**: Strict content-type and size validation
- **Folder organization**: Structured S3 key naming
- **Public/Private access**: Configurable access patterns

## Architecture

### Components Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐
│   Client App    │───▶│   API Gateway    │───▶│     S3      │
│                 │    │                  │    │             │
│ - Mobile App    │    │ - Controllers    │    │ - Storage   │
│ - Web Admin     │    │ - Services       │    │ - CDN       │
└─────────────────┘    └──────────────────┘    └─────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Utilities      │
                       │                  │
                       │ - S3 Client      │
                       │ - URL Signing    │
                       │ - Validation     │
                       └──────────────────┘
```

### Core Files

- **`packages/api/src/utils/s3.ts`**: Core S3 utilities and presigned URL generation
- **`packages/api/src/services/uploadService.ts`**: Message image upload service
- **`packages/api/src/controllers/uploadController.ts`**: Profile photo upload controller
- **`packages/mobile/src/services/imageUploadService.ts`**: Mobile client upload service

## Environment Configuration

### Required Environment Variables

```bash
# S3 Configuration
S3_REGION=us-east-1                    # AWS region for S3 bucket
S3_BUCKET=your-s3-bucket-name         # S3 bucket name
S3_ACCESS_KEY=your-access-key-id      # AWS access key ID
S3_SECRET_KEY=your-secret-access-key  # AWS secret access key
S3_PUBLIC_BASE_URL=                   # Optional: Custom CDN/CloudFront URL
```

### Alternative Variable Names (Supported)

The system supports multiple variable name formats for compatibility:

```bash
# AWS Standard Names (also supported)
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1

# CDN/CloudFront URLs (also supported)
CLOUDFRONT_BASE_URL=https://your-cdn.cloudfront.net
AWS_CLOUDFRONT_URL=https://your-cdn.cloudfront.net
CDN_PUBLIC_BASE_URL=https://your-cdn.cloudfront.net
```

### Environment Variable Resolution

The system uses fallback logic in `packages/api/src/config/env.ts`:

```typescript
const mergedEnv = {
  S3_REGION: process.env.S3_REGION ?? process.env.AWS_S3_REGION ?? process.env.AWS_REGION,
  S3_BUCKET: process.env.S3_BUCKET ?? process.env.AWS_S3_BUCKET ?? process.env.AWS_BUCKET,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY ?? process.env.AWS_S3_ACCESS_KEY ?? process.env.AWS_ACCESS_KEY_ID,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY ?? process.env.AWS_S3_SECRET_KEY ?? process.env.AWS_SECRET_ACCESS_KEY,
  S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL ?? process.env.AWS_S3_PUBLIC_BASE_URL ?? process.env.CLOUDFRONT_BASE_URL ?? ...,
};
```

## Core Components

### S3 Utility (`packages/api/src/utils/s3.ts`)

The core S3 utility provides presigned URL generation with validation.

#### Key Functions

**`getS3Client()`**
```typescript
function getS3Client(): S3Client
```
Creates and returns a configured S3 client. Throws error if required environment variables are missing.

**`createPresignedUploadUrl(params)`**
```typescript
interface PresignedUpload {
  uploadUrl: string;      // Presigned URL for upload
  key: string;            // S3 object key
  bucket: string;         // Bucket name
  publicUrl: string;      // Public access URL
  contentType: string;    // MIME type
  maxBytes: number;       // Maximum file size
}

async function createPresignedUploadUrl(params: {
  userId: string;
  folder: string;
  contentType: string;
  contentLength: number;
  expiresInSeconds?: number;        // Default: 300 (5 minutes)
  allowedContentTypes?: string[];   // Default: ['image/jpeg', 'image/png', 'image/webp']
  maxBytes?: number;                // Default: 5MB
}): Promise<PresignedUpload>
```

#### Key Naming Convention
```
{folder}/{userId}/{uuid}
```

Examples:
- `artist-profile-photos/artist-123/abc123-def456.jpg`
- `chat/conversation-456/xyz789-message.png`

### Upload Service (`packages/api/src/services/uploadService.ts`)

Handles message image uploads with ACL-based public access.

#### Key Function

**`uploadMessageImage(params)`**
```typescript
interface UploadImageResult {
  uploadUrl: string;  // Presigned upload URL
  key: string;        // S3 object key
  publicUrl: string;  // Public access URL
}

async function uploadMessageImage(params: {
  fileName: string;
  fileType: string;
  fileSize: number;
  conversationId: string;
  userId: string;
}): Promise<UploadImageResult>
```

#### Features
- Generates unique keys with timestamp + random ID
- Sets `ACL: 'public-read'` for immediate public access
- Adds metadata for tracking (uploadedBy, conversationId, originalFileName)

### Upload Controller (`packages/api/src/controllers/uploadController.ts`)

Express controller for profile photo uploads.

#### Key Function

**`presignProfilePhoto(req, res, next)`**
```typescript
// POST /api/v1/uploads/profile-photo/presign
// Requires artist authentication
// Body: { contentType: string, contentLength: number }
// Headers: x-upload-content-type, x-upload-content-length
```

## Upload Patterns

### Pattern 1: Presigned URLs (Profile Photos)

**Use Case**: Client uploads directly to S3 using presigned URLs
**Security**: Time-limited URLs (5 minutes default)
**Access**: Private during upload, public after

```typescript
// 1. Client requests presigned URL
const response = await apiClient.post('/uploads/profile-photo/presign', {
  contentType: 'image/jpeg',
  contentLength: 1024000
});

// 2. Client uploads directly to S3
const { uploadUrl, key, publicUrl } = response.data;
await fetch(uploadUrl, {
  method: 'PUT',
  body: imageBlob,
  headers: { 'Content-Type': 'image/jpeg' }
});

// 3. File is now available at publicUrl
```

### Pattern 2: Service-Based Uploads (Message Images)

**Use Case**: API handles upload coordination
**Security**: Server validates permissions and conversation access
**Access**: Immediately public via ACL

```typescript
// 1. Client requests upload URL from service
const response = await apiClient.post('/messaging/upload-image', {
  fileName: 'chat-image.jpg',
  fileType: 'image/jpeg',
  fileSize: 2048000,
  conversationId: 'conv-123'
});

// 2. Client uploads directly to S3
const { uploadUrl, publicUrl } = response.data;
await fetch(uploadUrl, {
  method: 'PUT',
  body: imageBlob,
  headers: { 'Content-Type': 'image/jpeg' }
});
```

## API Endpoints

### Profile Photo Upload

**Endpoint**: `POST /api/v1/uploads/profile-photo/presign`
**Auth**: Required (Artist role)
**Body**:
```json
{
  "contentType": "image/jpeg",
  "contentLength": 1024000
}
```
**Response**:
```json
{
  "uploadUrl": "https://presigned-s3-url...",
  "key": "artist-profile-photos/artist-123/uuid.jpg",
  "bucket": "your-bucket",
  "publicUrl": "https://your-cdn.com/artist-profile-photos/artist-123/uuid.jpg",
  "contentType": "image/jpeg",
  "maxBytes": 5242880
}
```

### Message Image Upload

**Endpoint**: `POST /api/v1/messaging/upload-image`
**Auth**: Required
**Body**:
```json
{
  "fileName": "chat-image.jpg",
  "fileType": "image/jpeg",
  "fileSize": 2048000,
  "conversationId": "conv-123"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://presigned-s3-url...",
    "key": "chat/conv-123/timestamp_random.jpg",
    "publicUrl": "https://your-bucket.s3.region.amazonaws.com/chat/conv-123/timestamp_random.jpg"
  }
}
```

## File Constraints

### Profile Photos
- **Max Size**: 5 MB
- **Allowed Types**: `image/jpeg`, `image/png`, `image/webp`
- **Folder**: `artist-profile-photos/{userId}/`

### Message Images
- **Max Size**: 10 MB
- **Allowed Types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- **Folder**: `chat/{conversationId}/`

### Validation Logic
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB for profile photos
const MAX_MESSAGE_SIZE = 10 * 1024 * 1024; // 10MB for messages

if (!ALLOWED_TYPES.includes(contentType)) {
  throw new Error('Unsupported content type');
}

if (contentLength > MAX_SIZE) {
  throw new Error('File too large');
}
```

## Implementation Examples

### Adding S3 Uploads to a New Feature

1. **Choose Upload Pattern**
   - Use presigned URLs for user-generated content
   - Use service-based for feature-specific logic

2. **Create Controller**
```typescript
// packages/api/src/controllers/newFeatureController.ts
export const NewFeatureController = {
  async presignUpload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const upload = await createPresignedUploadUrl({
        userId: req.user.id,
        folder: 'new-feature-uploads',
        contentType: req.body.contentType,
        contentLength: req.body.contentLength,
        maxBytes: 2 * 1024 * 1024, // 2MB limit
      });
      res.json(upload);
    } catch (error) {
      next(error);
    }
  },
};
```

3. **Add Route**
```typescript
// packages/api/src/routes/v1/newFeature.ts
router.post('/upload/presign', requireAuth(), NewFeatureController.presignUpload);
```

4. **Client Implementation**
```typescript
// Mobile client
const uploadToNewFeature = async (file: File) => {
  // Get presigned URL
  const { data: uploadData } = await apiClient.post('/new-feature/upload/presign', {
    contentType: file.type,
    contentLength: file.size,
  });

  // Upload file
  await fetch(uploadData.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  return uploadData.publicUrl;
};
```

### Extending File Types

```typescript
// Support additional file types
const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const upload = await createPresignedUploadUrl({
  userId: req.user.id,
  folder: 'documents',
  contentType: req.body.contentType,
  contentLength: req.body.contentLength,
  allowedContentTypes: DOCUMENT_TYPES,
  maxBytes: 20 * 1024 * 1024, // 20MB for documents
});
```

## Security Considerations

### Authentication & Authorization
- All upload endpoints require authentication
- Message image uploads validate conversation access
- Profile photo uploads require artist role

### URL Expiration
- Presigned URLs expire in 5 minutes by default
- Configurable via `expiresInSeconds` parameter
- Prevents unauthorized reuse of upload URLs

### Content Validation
- Strict MIME type validation
- File size limits prevent abuse
- Content length verification before upload

### S3 Bucket Security
- Use least-privilege IAM policies
- Enable bucket versioning for recovery
- Configure CORS for web uploads
- Set up proper bucket policies

### Example IAM Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name"
    }
  ]
}
```

## Troubleshooting

### Common Issues

**"S3 configuration missing" Error**
- Check all required environment variables are set
- Verify variable names (supports multiple formats)
- Ensure variables are loaded in the correct environment

**"Unsupported content type" Error**
- Verify the content type is in the allowed list
- Check client is sending correct MIME types
- Ensure file extensions match content types

**"File too large" Error**
- Check file size against the limits
- Compress images before upload
- Implement client-side validation

**Upload URL Expiration**
- Increase `expiresInSeconds` if needed
- Implement retry logic for expired URLs
- Handle expiration errors gracefully

**CORS Issues**
- Configure S3 bucket CORS policy
- Allow PUT method from your domains
- Include proper headers in CORS configuration

### S3 Bucket CORS Configuration
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:5241"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

### Debugging Tips

1. **Check Environment Variables**
```bash
# In API container
console.log('S3 Config:', {
  region: env.S3_REGION,
  bucket: env.S3_BUCKET,
  hasAccessKey: !!env.S3_ACCESS_KEY,
  hasSecretKey: !!env.S3_SECRET_KEY,
});
```

2. **Verify S3 Permissions**
```bash
# Test S3 access
aws s3 ls s3://your-bucket-name/
```

3. **Check Upload Logs**
- Enable debug logging for S3 operations
- Monitor CloudTrail for S3 API calls
- Check application logs for presigned URL generation

### Performance Considerations

- **CDN Integration**: Use CloudFront for global distribution
- **Compression**: Implement client-side image compression
- **Caching**: Set appropriate cache headers for public files
- **Monitoring**: Track upload success/failure rates

## Dependencies

```json
{
  "@aws-sdk/client-s3": "^3.947.0",
  "@aws-sdk/s3-request-presigner": "^3.947.0"
}
```

## Migration Guide

When adding S3 uploads to existing features:

1. Add required environment variables
2. Import S3 utilities in your service/controller
3. Create upload endpoints following the patterns above
4. Update client code to use new endpoints
5. Test with various file types and sizes
6. Implement proper error handling and user feedback

## Future Enhancements

- **Virus Scanning**: Integrate with AWS Lambda for file scanning
- **Image Processing**: Add automatic resizing/cropping
- **Private Files**: Support for private file access with signed URLs
- **Batch Uploads**: Support for multiple file uploads
- **Progress Tracking**: Upload progress indicators
- **Retry Logic**: Automatic retry for failed uploads