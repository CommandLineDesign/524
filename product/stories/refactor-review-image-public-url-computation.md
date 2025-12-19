# Refactor Review Image Public URL Computation

**Epic**: [Review System](../epics/review-system.md)
**Role**: Developer
**Priority**: Medium
**Status**: ✅ Completed
**Dependencies**:

- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Developer
**I want** to refactor review image publicUrl to be computed at query time instead of stored in the database
**So that** URLs remain current if S3 bucket or CloudFront distribution changes

## Detailed Description

Currently, review image public URLs are computed once during image creation and stored in the database. This creates tech debt because if the S3_PUBLIC_BASE_URL environment variable changes (e.g., switching to a different CloudFront distribution), all existing review images will have stale URLs.

The current implementation stores publicUrl in the review_images table, but the code comments indicate this should be computed dynamically at query time from the s3Key + S3_PUBLIC_BASE_URL.

## Acceptance Criteria

### Functional Requirements

- **Given** S3_PUBLIC_BASE_URL environment variable is configured - **When** review images are queried - **Then** publicUrl is computed from s3Key + S3_PUBLIC_BASE_URL
- **Given** S3_PUBLIC_BASE_URL changes (e.g., new CloudFront distribution) - **When** existing review images are queried - **Then** they return updated URLs automatically
- **Given** S3_PUBLIC_BASE_URL is missing - **When** review images are queried - **Then** publicUrl is null or omitted gracefully
- **Given** review images exist with pre-computed URLs - **When** migration runs - **Then** existing URLs are preserved for backward compatibility

### Non-Functional Requirements

- **Performance**: URL computation adds minimal overhead to queries
- **Reliability**: No data loss during migration, existing functionality preserved
- **Maintainability**: Clear separation between stored data (s3Key) and computed data (publicUrl)

## User Experience Flow

This is an internal technical refactoring with no direct user impact:

1. Developer deploys code changes
2. Database migration runs (if needed)
3. System continues to serve review images with correct URLs
4. Future S3_PUBLIC_BASE_URL changes automatically reflect in all image URLs

## Technical Context

- **Epic Integration**: Part of review system photo upload functionality
- **System Components**: Database schema, API repositories, review queries
- **Data Requirements**: review_images table (s3Key, publicUrl fields)
- **Integration Points**: Review display, photo upload, image serving

## Definition of Done

- [x] publicUrl computed dynamically in review repository queries
- [x] Database migration preserves existing URLs during transition (publicUrl column remains nullable for backward compatibility)
- [x] S3_PUBLIC_BASE_URL changes immediately reflected in API responses
- [x] Backward compatibility maintained for existing data
- [x] Unit tests updated for new URL computation logic
- [x] Integration tests verify URL generation works correctly

## Notes

This addresses the tech debt comment in `packages/api/src/repositories/reviewRepository.ts` lines 234-236. The implementation should follow the pattern established in the codebase for computed fields.

Consider using database views or application-level computation rather than stored computed columns to maintain flexibility.