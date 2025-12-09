Date: 2025-12-09
Base: b41a884f6545dadacf4e95b6e0dc412c923ec0a5 (origin/main parent)
Feature: jl/artist-onboarding @ 6ecbe7378026f01439b4ae2975f82ccc7cc08e52

## High-Level Summary
The PR adds an artist-facing onboarding flow on mobile, including profile photo upload via presigned S3 URLs, and new `/artists/me` plus upload endpoints on the API. It also expands env loading to find .env files from multiple working directories and hardens the mobile API client so custom headers don’t drop auth.

## Prioritized Issues
### Critical
- [status:done] File: packages/api/src/controllers/artistController.ts:40-47, packages/api/src/repositories/artistRepository.ts:153-185
  - Issue: The new `updateMyProfile` path forwards the entire request body straight into the repository update, which can set `verificationStatus`, `businessVerified`, `averageRating`, `totalReviews`, etc.; an artist can self-approve or inflate ratings by PATCHing arbitrary fields, bypassing any moderation.
  - Fix: Whitelist the fields artists are allowed to edit (e.g., stageName, bio, specialties, location, profile image) via server-side validation (zod/DTO) and ignore/reject privileged fields; keep verification/rating fields writeable only by reviewers/admins.
  - Verification: `artistProfileUpdateSchema` now strictly validates allowed fields and `ArtistRepository.update` only persists whitelisted properties; privileged fields remain immutable for artists.
### Major
- [status:done] File: packages/api/src/controllers/artistController.ts:23-47
  - Issue: Both `/artists/me/profile` handlers pass `req.user.id` into `getArtistProfile`/`updateArtistProfile`, but the repository queries by `artistProfiles.id`, not `userId`, so authenticated artists will hit 404s (or update the wrong row if ids ever coincide), blocking the new onboarding flow.
  - Fix: Look up the artist row by `userId` (add a repository method or join to `users`), or first resolve the artist id for the current user before calling the repository update/fetch.
  - Verification: `/artists/me/profile` now resolves via `getArtistProfileByUserId`/`updateMyArtistProfile`, which look up the artist by `userId` before fetching/updating.
- [status:done] File: packages/api/src/utils/s3.ts:41-62; packages/api/src/controllers/uploadController.ts:14-23
  - Issue: Presigned uploads accept any client-supplied `contentType` and store objects with `ACL: public-read`; an authenticated artist can upload arbitrary public files (not just images) with no type/size limits, which is a security and abuse risk.
  - Fix: Enforce an allowlist of image MIME types and max size in the presign policy (conditions), drop the public ACL (keep private and serve via signed GET/CloudFront), and reject requests with disallowed content types.
  - Verification: Upload presign now enforces an image allowlist (`jpeg/png/webp`), requires an explicit content length <= 5 MB, signs the request with that length, and drops the `public-read` ACL so uploads remain private.
### Minor
- [status:done] No additional issues identified.
### Enhancement
- [status:done] No enhancement suggestions beyond the above fixes.

## Highlights
- Header merging in the mobile API client now preserves Authorization when custom headers are supplied (`packages/mobile/src/api/client.ts`).
- Added presigned S3 upload utility and routes to support artist profile photo uploads.
- Mobile navigation gains artist onboarding and pending-review flows gated by profile completeness.
