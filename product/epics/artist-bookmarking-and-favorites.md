# Artist Bookmarking and Favorites

**Category**: Backend Services

**Priority**: Medium

**Status**: ⏳ Not Started

**Dependencies**:

- None

**Estimated Effort**: Small (1-2 sprints)

## Description

This epic provides customers with the ability to bookmark and favorite artists they discover during the booking process or while browsing artist profiles. This feature enables users to build a personalized collection of preferred artists for easy access and future bookings, enhancing user engagement and repeat bookings.

The bookmarking system will include state management for real-time UI updates, backend persistence for cross-device synchronization, and a dedicated view for managing bookmarked artists. The feature integrates seamlessly with existing artist detail pages, artist lists, and search results.

## Key Components

- **Bookmark State Management**: Client-side state management for bookmark status with optimistic updates
- **Bookmark API Endpoints**: Backend endpoints for creating, retrieving, and deleting artist bookmarks
- **Bookmark Persistence**: Database schema and repository layer for storing user bookmarks
- **UI Integration**: Bookmark button functionality across artist cards, detail pages, and search results
- **Bookmarked Artists View**: Dedicated screen for viewing and managing all bookmarked artists
- **Cross-Device Sync**: Automatic synchronization of bookmarks across user devices

## Acceptance Criteria

- [ ] Users can bookmark/unbookmark artists from artist detail pages
- [ ] Users can bookmark/unbookmark artists from artist list views
- [ ] Users can bookmark/unbookmark artists from search results
- [ ] Bookmark status persists across app sessions and devices
- [ ] Users can view all bookmarked artists in a dedicated screen
- [ ] Users can remove bookmarks from the bookmarked artists list
- [ ] Bookmark counts are displayed on artist profiles (optional)
- [ ] Bookmark changes reflect immediately in UI (optimistic updates)
- [ ] Bookmark data syncs with backend within 2 seconds
- [ ] Users receive appropriate error messages if bookmark operations fail

## Technical Requirements

- **Backend API**:
  - `POST /api/v1/bookmarks/artists/:artistId` - Create bookmark
  - `DELETE /api/v1/bookmarks/artists/:artistId` - Remove bookmark
  - `GET /api/v1/bookmarks/artists` - List user's bookmarked artists
  - All endpoints require authentication
  - Idempotent operations (duplicate bookmarks handled gracefully)
  
- **Database Schema**:
  - `artist_bookmarks` table with columns: `id`, `userId`, `artistId`, `createdAt`
  - Unique constraint on `(userId, artistId)` to prevent duplicates
  - Foreign key constraints to `users` and `artist_profiles` tables
  - Index on `userId` for efficient queries
  
- **State Management**:
  - Zustand store for bookmark state management
  - Optimistic updates for immediate UI feedback
  - React Query integration for server synchronization
  - Automatic cache invalidation on bookmark changes
  
- **Performance**:
  - Bookmark toggle response time < 100ms (optimistic)
  - Backend API response time < 200ms (p95)
  - Bookmarked artists list load time < 500ms for up to 100 bookmarks
  
- **Integration Points**:
  - Artist detail page bookmark button
  - Artist card bookmark icon in lists
  - Search results bookmark functionality
  - Bookmarked artists navigation entry

## User Stories (Examples)

- As a customer, I want to bookmark artists I like so that I can easily find them later for future bookings
- As a customer, I want to view all my bookmarked artists in one place so that I can compare and choose between my favorites
- As a customer, I want my bookmarks to sync across devices so that I can access them from my phone or tablet
- As a customer, I want to remove bookmarks I no longer need so that my favorites list stays organized
- As an artist, I want to see how many customers have bookmarked me so that I can gauge my popularity (optional future enhancement)

## Risks and Assumptions

**Technical Risks:**
- Optimistic updates may cause UI inconsistencies if backend operations fail
- High bookmark volume per user could impact list performance
- Race conditions possible with rapid bookmark/unbookmark actions

**Mitigation Strategies:**
- Implement rollback mechanism for failed optimistic updates
- Add pagination to bookmarked artists list for scalability
- Use debouncing or request queuing for rapid bookmark toggles

**Design Assumptions:**
- Users will bookmark a reasonable number of artists (< 100)
- Bookmark status is binary (no favorites vs. super-favorites)
- Bookmarks are private to the user (not shared publicly)
- No notification system needed for bookmark-related events

**Dependencies:**
- Existing authentication system for user identification
- Artist detail page and list components already implemented
- Database migration system for schema changes

## Notes

- This epic focuses on core bookmarking functionality; advanced features like bookmark folders, notes, or sharing can be added in future iterations
- The bookmark button UI has already been added to the artist detail page as a non-functional placeholder
- Consider adding analytics tracking for bookmark events to understand user engagement patterns
- Future enhancements could include bookmark-based recommendations or notifications when bookmarked artists have availability
- The bookmarked artists list should support the same sorting and filtering options as the main artist list for consistency

