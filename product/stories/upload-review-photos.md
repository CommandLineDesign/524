# Upload Review Photos

**Epic**: [Review System](../epics/review-system.md)
**Role**: Customer
**Priority**: High
**Status**: ⏳ Not Started
**Dependencies**:

- [Submit Customer Review](./submit-customer-review.md)

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Customer  
**I want** to upload photos with my review  
**So that** other customers can see the actual results of the artist's work

## Detailed Description

Photos are a critical component of reviews in the beauty services marketplace, as they provide visual proof of the artist's work quality. Customers should be able to upload up to 5 photos when submitting or editing their review. These photos showcase the final makeup or hair styling results and help future customers make informed decisions.

The photo upload system uses S3 presigned URLs for direct browser/mobile uploads, following the established patterns in the S3_UPLOAD_SETUP.md documentation. Photos should be compressed on the client side before upload to reduce bandwidth and storage costs, with a maximum file size of 5MB per image. Supported formats include JPEG, PNG, and WebP.

## Acceptance Criteria

### Functional Requirements

- **Given** a customer is writing a review - **When** they tap "Add Photos" - **Then** the device photo picker opens with multi-select enabled
- **Given** a customer selects photos - **When** they choose up to 5 images - **Then** the photos are displayed as thumbnails in the review form
- **Given** a customer has selected photos - **When** they tap a thumbnail - **Then** they can preview the full-size image
- **Given** a customer has selected photos - **When** they tap the remove icon on a thumbnail - **Then** that photo is removed from the selection
- **Given** a customer tries to add more than 5 photos - **When** they select a 6th photo - **Then** the system displays an error message
- **Given** a customer submits the review - **When** photos are attached - **Then** the photos are uploaded to S3 and linked to the review
- **Given** a photo upload fails - **When** the error occurs - **Then** the customer sees a retry option

### Non-Functional Requirements

- **Performance**: Photos compressed to reduce file size before upload, each upload completes within 10 seconds on average connection
- **Storage**: Photos stored in S3 at `review-photos/{booking_id}/{uuid}.jpg` path structure
- **Security**: Presigned URLs used for direct upload, public read access via CloudFront CDN
- **Validation**: Maximum 5 photos per review, 5MB per photo, supported formats: JPEG, PNG, WebP

## User Experience Flow

1. Customer is filling out review form
2. Customer taps "Add Photos" button below the review text field
3. System opens device photo picker with multi-select enabled
4. Customer selects 1-5 photos from their gallery or camera
5. System displays selected photos as thumbnails in the review form
6. Customer can remove individual photos by tapping the X icon on thumbnails
7. Customer can add more photos (up to 5 total) by tapping "Add Photos" again
8. When customer submits review, system begins photo upload process
9. System compresses each photo on the client side
10. System requests presigned URLs from API for each photo
11. System uploads photos directly to S3 using presigned URLs
12. System displays upload progress indicator
13. Once all photos are uploaded, system completes review submission
14. Photos are displayed in gallery format on the review

## Technical Context

- **Epic Integration**: Enhances review quality by adding visual evidence of artist work
- **System Components**: 
  - Mobile app: Photo picker integration, image compression, upload progress UI
  - API: `POST /api/v1/reviews/:id/photos/presign` endpoint for presigned URLs
  - S3: Direct upload using presigned URLs
  - Database: Store S3 keys in review_images table
  - CloudFront: CDN for public photo access
- **Data Requirements**: 
  - S3 bucket: `review-photos/{booking_id}/{uuid}.{ext}`
  - Database: review_images table with review_id, s3_key, file_size, mime_type
  - Maximum 5 photos per review
  - Maximum 5MB per photo
- **Integration Points**: 
  - Follows S3_UPLOAD_SETUP.md patterns for presigned URLs
  - Integrates with review submission flow
  - Photos displayed on artist profiles and review listings

## Definition of Done

- [ ] "Add Photos" button visible in review form
- [ ] Photo picker opens with multi-select capability
- [ ] Selected photos display as thumbnails in review form
- [ ] Thumbnail tap opens full-size preview
- [ ] Remove button on each thumbnail works correctly
- [ ] Maximum 5 photos enforced with error message
- [ ] Client-side image compression implemented (react-native-image-resizer)
- [ ] API endpoint returns presigned URLs for S3 upload
- [ ] Photos upload directly to S3 using presigned URLs
- [ ] Upload progress indicator displays during upload
- [ ] Failed uploads show retry option
- [ ] File size validation (5MB max) on client and server
- [ ] File type validation (JPEG, PNG, WebP) on client and server
- [ ] S3 folder structure follows `review-photos/{booking_id}/` pattern
- [ ] Photos publicly accessible via CloudFront after upload
- [ ] Review submission waits for all photos to upload before completing
- [ ] Uploaded photos display in gallery format on submitted review

## Notes

- Follow patterns from `docs/setup/S3_UPLOAD_SETUP.md` for presigned URL implementation
- Use react-native-image-resizer for client-side compression before upload
- Consider implementing parallel uploads for multiple photos to improve speed
- Photos are immutable after review submission (no editing photos after 24-hour window)
- Future enhancement: Allow customers to reorder photos before submission
- Future enhancement: Add photo editing capabilities (crop, rotate, filters)

