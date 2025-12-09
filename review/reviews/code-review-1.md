Date: 2025-12-09
Base ref: origin/main
Feature ref: HEAD (jl/artist-onboarding)

## High-Level Summary
This change adds an artist self-serve onboarding flow with profile photo uploads, linking mobile screens to new API endpoints for authenticated artists. It introduces S3 presigned uploads, expanded env loading, and improved client header handling to support the new experience.

## Prioritized Issues
### Critical
- [status:done] File: packages/api/src/controllers/artistController.ts:23-47
  - Issue: The “my profile” endpoints use the authenticated user id as the artist id, but artist profiles are keyed by their own UUIDs, so GET/PATCH /artists/me/profile always return 404 and block the onboarding flow.
  - Fix: Resolve the artist profile by userId (e.g., repository method that joins on userId) and use that artist id for fetch/update; still return 404 if the user has no artist profile.
  - Resolution: Confirmed controller uses userId-backed lookups and 404s when no artist profile exists; no code change required.

### Major
- [status:done] File: packages/mobile/src/screens/ArtistOnboardingFlowScreen.tsx:66-88
  - Issue: handleSubmit awaits mutateAsync without any error handling; if the API rejects (network error or the 404 above), the promise throws and the user sees no feedback or recovery path.
  - Fix: Wrap the save in try/catch, surface an alert/toast on failure, and only reset navigation after a successful save.
  - Resolution: Wrapped save in try/catch, show alert on failure, and only reset navigation after successful save.
- [status:done] File: packages/mobile/src/screens/ArtistOnboardingFlowScreen.tsx:113-132
  - Issue: The upload flow treats the presigned PUT as success without checking response.ok and sends a generic MIME (asset.type is often just "image"), so failed uploads still mark the photo as saved and store a dead URL.
  - Fix: Derive a real MIME type (asset.mimeType or from the file extension), check the PUT response status, and only set profileImageUrl after a confirmed 2xx upload.
  - Resolution: Infer MIME from mimeType/extension and require presigned PUT response.ok before storing the uploaded photo URL.

### Minor
- [status:done] File: packages/mobile/src/query/artist.ts:6-24
  - Issue: The artist profile query key is static, so after a logout/login the next user can reuse the previous artist profile cache and the navigator may skip onboarding or show the wrong pending state.
  - Fix: Include the authenticated user id in the query key (and clear it on logout) so the cache is scoped per user.
  - Resolution: Query key now includes userId and mutation updates the user-scoped cache to avoid cross-user reuse.

### Enhancement
- None.

## Highlights
- Env loader now considers multiple .env locations and maps AWS-style S3 vars, reducing setup friction.
- Added presigned S3 upload helper plus upload routes with role gating for artist profile photos.
- Mobile client now preserves Authorization headers when adding custom headers, avoiding accidental auth drops during uploads.
