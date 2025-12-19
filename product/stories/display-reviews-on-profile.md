# Display Reviews on Artist Profile

**Epic**: [Review System](../epics/review-system.md)
**Role**: Customer
**Priority**: Critical
**Status**: 📝 In Progress
**Dependencies**:

- [Submit Customer Review](./submit-customer-review.md)
- [Upload Review Photos](./upload-review-photos.md)
- [Respond to Review](./respond-to-review.md)

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Customer  
**I want** to see reviews and ratings on artist profiles  
**So that** I can make informed decisions when choosing an artist for my beauty service

## Detailed Description

Reviews are the primary trust signal in the marketplace, and customers need to see comprehensive review information on artist profiles before making booking decisions. The artist profile should prominently display aggregate rating statistics (average rating, total review count) and show individual reviews with all their details including ratings, text, photos, and artist responses.

This review display is critical for the marketplace's success, as it enables customers to evaluate artists based on real experiences from other customers. The display should be visually appealing, easy to scan, and provide enough detail for customers to understand the artist's strengths and any potential concerns.

## Acceptance Criteria

### Functional Requirements

- **Given** a customer views an artist profile - **When** the profile loads - **Then** they see aggregate rating statistics at the top (average rating, total count)
- **Given** aggregate statistics are displayed - **When** shown - **Then** they include overall average rating and breakdown by dimension (quality, professionalism, timeliness)
- **Given** a customer scrolls down the profile - **When** they reach the reviews section - **Then** they see individual review cards sorted by date (newest first)
- **Given** a review card is displayed - **When** shown - **Then** it includes customer name, date, star ratings, review text, and photos
- **Given** a review has photos - **When** displayed - **Then** photos appear in a gallery format with tap-to-expand functionality
- **Given** an artist has responded to a review - **When** the review is displayed - **Then** the artist response appears below the customer review
- **Given** a review has a verified booking badge - **When** displayed - **Then** the badge is shown to indicate authenticity
- **Given** an artist has no reviews - **When** their profile is viewed - **Then** an appropriate empty state message is displayed (not placeholder data)

### Non-Functional Requirements

- **Performance**: Review section loads within 1 second, photos lazy-loaded as user scrolls
- **Usability**: Reviews are easy to scan with clear visual hierarchy
- **Pagination**: Load 10 reviews initially, with "Load More" button for additional reviews
- **Accessibility**: Star ratings have text equivalents for screen readers

## User Experience Flow

1. Customer searches for artists and opens an artist profile
2. Profile displays aggregate rating statistics prominently near the top:
   - Large star rating display (e.g., 4.8 ★)
   - Total review count (e.g., "127 reviews")
   - Rating breakdown by dimension with visual bars
3. Customer scrolls down to "Reviews" section
4. System displays first 10 reviews sorted by date (newest first)
5. Each review card shows:
   - Customer name and profile photo (or "Anonymous")
   - Booking date and service type
   - Star ratings (overall, quality, professionalism, timeliness)
   - Full review text
   - Review photos in gallery format (if any)
   - "Verified Booking" badge
   - Artist response (if present)
6. Customer can tap review photos to view full-size gallery
7. Customer can tap "Load More" to see additional reviews
8. Customer uses review information to decide whether to book the artist

## Technical Context

- **Epic Integration**: Provides the primary trust signal for customer booking decisions
- **System Components**: 
  - Mobile app: Artist profile screen with reviews section
  - API: `GET /api/v1/artists/:id/reviews` endpoint
  - API: `GET /api/v1/artists/:id/reviews/stats` for aggregate statistics
  - Database: Query reviews table with joins to customers and review_images
  - CloudFront: Serve review photos via CDN
- **Data Requirements**: 
  - Read access to reviews table
  - Join with customers, bookings, and review_images tables
  - Calculate aggregate statistics (average ratings by dimension, total count)
  - Pagination support (10 reviews per page)
  - Filter out hidden/moderated reviews (is_visible = true)
- **Integration Points**: 
  - Displays data from review submission flow
  - Shows photos from S3/CloudFront
  - Displays artist responses
  - Filters out moderated reviews

## Definition of Done

- [ ] Aggregate rating statistics displayed prominently on artist profile
- [ ] Overall average rating shown with star visualization
- [ ] Total review count displayed
- [ ] Rating breakdown by dimension (quality, professionalism, timeliness) shown
- [ ] Individual review cards display all review details
- [ ] Review photos displayed in gallery format with tap-to-expand
- [ ] Artist responses displayed below customer reviews when present
- [ ] "Verified Booking" badge shown on all reviews
- [ ] Reviews sorted by date (newest first)
- [ ] Pagination implemented (10 reviews per page with "Load More")
- [ ] Empty state displayed for artists with no reviews (no placeholder data)
- [ ] Loading state displayed while fetching reviews
- [ ] Error handling for network failures
- [ ] Photos lazy-loaded as user scrolls
- [ ] Only visible reviews displayed (is_visible = true)
- [ ] API endpoints return review data with proper filtering and aggregation

## Notes

- Aggregate statistics should update in real-time as new reviews are added
- Empty state should be encouraging and explain that the artist is new to the platform
- Consider adding filter/sort options in future (by rating, by service type, by date)
- Review photos are a key differentiator and should be prominently displayed
- "Verified Booking" badge builds trust by showing reviews are from real customers
- Future enhancement: Allow customers to mark reviews as "helpful"
- Future enhancement: Add photo gallery view showing all review photos for an artist

