# Artist ID System Architecture

## Two ID Types

1. **User ID** (`users.id`)
   - Universal account identifier
   - Used in JWT tokens, auth checks
   - Primary key in users table

2. **Artist Profile ID** (`artistProfiles.id`)
   - Artist-specific profile identifier
   - Has FK `userId` → `users.id`
   - Primary key in artist_profiles table

## When to Use Each ID

### Use Artist Profile ID For:
- Public browsing (carousels, lists, search results)
- Navigating to artist detail pages
- Public API calls: `GET /api/v1/artists/:artistId`
- Displaying artist information to customers

### Use User ID For:
- Authenticated artist operations
- API calls: `GET /api/v1/artists/me/profile`
- Creating bookings: `bookings.artistId` references `users.id`
- Internal user management

### API Endpoints Reference

| Endpoint | ID Type | Purpose |
|----------|---------|---------|
| `GET /api/v1/artists/:artistId` | Artist Profile ID | Get public profile |
| `GET /api/v1/artists/me/profile` | User ID (from JWT) | Get own profile |
| `PATCH /api/v1/artists/me/profile` | User ID (from JWT) | Update own profile |
| `POST /api/v1/bookings` | User ID | Create booking with artistId |

## Common Patterns

### Frontend Navigation
```typescript
// From carousel/list to detail page
navigation.navigate('ArtistDetail', {
  artistId: artist.id // This is artist profile ID
});
```

### Authenticated Artist Operations
```typescript
// Artist viewing/editing own profile
const { data: myProfile } = useArtistProfile(
  user?.id, // User ID
  isArtist
);
```

### Backend Service Layer
```typescript
// Public lookup
artistService.getArtistProfile(artistProfileId)

// Authenticated lookup
artistService.getArtistProfileByUserId(userId)
```

## Database Schema

```
users
├── id (UUID) ← User ID
├── email
├── name
└── role (customer, artist, admin, support)

artist_profiles
├── id (UUID) ← Artist Profile ID
├── userId (FK → users.id) ← References user account
├── stageName
├── bio
├── verificationStatus
└── ...

bookings
├── id (UUID)
├── artistId (FK → users.id) ← Uses User ID, not Artist Profile ID!
├── customerId (FK → users.id)
└── ...
```

## Common Pitfalls

### ❌ WRONG: Using User ID for public browsing
```typescript
// Search results incorrectly returning user ID
return { id: row.userId }; // BAD!

// Then navigation fails
navigation.navigate('ArtistDetail', { artistId: userId }); // 404 error!
```

### ✅ CORRECT: Using Artist Profile ID for public browsing
```typescript
// Search results correctly returning artist profile ID
return { id: row.id }; // GOOD!

// Navigation works
navigation.navigate('ArtistDetail', { artistId: artistProfileId }); // Success!
```

## Recent Bug Fixes

### Bug Fix #1: Search Results ID Mismatch (2026-02-17)

**Issue**: The `searchArtistsFiltered` API was returning `userId` instead of `artistProfileId` in search results, causing "artist not found" errors when customers tried to view artist detail pages.

**Files Changed**:
- [`packages/api/src/services/searchService.ts`](api/src/services/searchService.ts) - Fixed `mapRowToResult` to return `row.id` instead of `row.userId`
- [`packages/mobile/src/components/ArtistNavigationMenu.tsx`](mobile/src/components/ArtistNavigationMenu.tsx) - Added artist role check before fetching profile
- [`packages/shared/src/artists.ts`](shared/src/artists.ts) - Added JSDoc comments to clarify ID types
- [`packages/api/src/controllers/artistController.ts`](api/src/controllers/artistController.ts) - Added validation logging

**Prevention**:
- Type documentation added to interfaces
- Validation logging added to detect ID mismatches
- This documentation file created for future reference

### Bug Fix #2: Reviews Not Showing on Artist Detail Pages (2026-02-17)

**Issue**: Reviews and ratings were not displaying on artist detail pages. The review endpoints (`GET /api/v1/artists/:artistId/reviews` and `GET /api/v1/artists/:artistId/reviews/stats`) were receiving `artistProfileId` but querying directly against `reviews.artistId` which is a foreign key to `users.id` (User ID), not Artist Profile ID.

**Root Cause**:
- Reviews are stored with `reviews.artistId → users.id` (User ID)
- Public API endpoints use `artistProfileId` in the URL
- The controller was not translating between these two ID types

**Solution**: Modified both review endpoints to:
1. First fetch the artist profile using `artistProfileId`
2. Extract the `userId` from the profile
3. Query reviews using the `userId`

**Files Changed**:
- [`packages/api/src/controllers/artistController.ts`](api/src/controllers/artistController.ts) - Added artist profile lookup in `getArtistReviews` and `getArtistReviewStats` to translate artistProfileId → userId before querying reviews

**Key Lesson**: When a public API endpoint receives `artistProfileId` but needs to query a table with `userId` foreign keys (like `reviews`, `bookings`), always translate the ID first by fetching the artist profile.
