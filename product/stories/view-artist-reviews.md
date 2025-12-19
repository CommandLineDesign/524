# View Artist Reviews

**Epic**: [Review System](../epics/review-system.md)
**Role**: Artist
**Priority**: High
**Status**: ✅ Completed
**Dependencies**:

- [Submit Customer Review](./submit-customer-review.md)

**Estimated Effort**: M (3-5 days)

## Story Statement

**As an** Artist  
**I want** to view all reviews I've received  
**So that** I can monitor my reputation and understand customer feedback

## Detailed Description

Artists need a comprehensive view of all reviews they have received from customers to monitor their reputation, identify areas for improvement, and respond to feedback. The "My Reviews" section in the artist dashboard provides a centralized location to see all reviews, including ratings, text feedback, photos, and the ability to respond to each review.

Artists should be able to access reviews both from individual completed booking cards and from a dedicated "My Reviews" section that aggregates all reviews. This dual access pattern ensures artists can quickly respond to new reviews from booking context while also having a holistic view of their reputation over time.

## Acceptance Criteria

### Functional Requirements

- **Given** an artist views a completed booking card - **When** a review exists - **Then** they see the review summary with a "View Full Review" link
- **Given** an artist taps "View Full Review" - **When** the review opens - **Then** they see all rating dimensions, text, photos, and response option
- **Given** an artist opens their dashboard - **When** they tap "My Reviews" - **Then** they see all reviews they've received sorted by date (newest first)
- **Given** the review list is displayed - **When** there are multiple reviews - **Then** each shows customer name, rating, date, and text preview
- **Given** a review entry is displayed - **When** the artist has responded - **Then** their response is shown below the customer review
- **Given** an artist has no reviews - **When** they open "My Reviews" - **Then** they see an encouraging empty state message
- **Given** an artist receives a new review - **When** it's submitted - **Then** they receive a push notification

### Non-Functional Requirements

- **Performance**: Review list loads within 1 second for up to 500 reviews
- **Usability**: Reviews display aggregate statistics at the top (average rating, total count)
- **Pagination**: Load 20 reviews per page with infinite scroll
- **Real-time**: New reviews appear immediately via push notification

## User Experience Flow

1. Artist opens their dashboard in the mobile app
2. Artist sees aggregate review statistics at the top:
   - Average overall rating (e.g., 4.8 stars)
   - Total review count (e.g., 127 reviews)
   - Breakdown by rating dimension
3. Artist taps "My Reviews" section
4. System displays list of all reviews sorted by date (newest first)
5. Each review card shows:
   - Customer name (or "Anonymous" if preferred)
   - Booking date and service type
   - Star ratings (overall, quality, professionalism, timeliness)
   - Review text (first 3 lines with "Read more")
   - Review photos (if any)
   - Artist's response (if already responded)
   - "Respond" button (if not yet responded)
6. Artist can tap a review to view full details
7. Artist can tap "Respond" to write a public response
8. System loads more reviews as artist scrolls (pagination)

## Technical Context

- **Epic Integration**: Provides artists visibility into their reputation and feedback
- **System Components**: 
  - Mobile app: "My Reviews" section in artist dashboard
  - Mobile app: Review summary on completed booking cards
  - API: `GET /api/v1/reviews?artist_id={id}` endpoint
  - API: `GET /api/v1/artists/:id/reviews/stats` for aggregate statistics
  - Database: Query reviews table filtered by artist_id
  - Notifications: Push notification when new review received
- **Data Requirements**: 
  - Read access to reviews table
  - Join with bookings, customers, and review_images tables
  - Calculate aggregate statistics (average ratings, total count)
  - Pagination support (20 reviews per page)
- **Integration Points**: 
  - Links to booking detail pages
  - Integrates with artist response functionality
  - Shows review photos from S3/CloudFront
  - Displays customer information

## Definition of Done

- [ ] Review summary visible on completed booking cards
- [ ] "View Full Review" link opens full review details
- [ ] "My Reviews" section accessible from artist dashboard
- [ ] Aggregate statistics displayed at top (average rating, total count)
- [ ] Review list displays all artist's reviews sorted by date (newest first)
- [ ] Each review card shows customer info, ratings, text preview, and photos
- [ ] Artist responses displayed when present
- [ ] "Respond" button visible on reviews without responses
- [ ] Tapping a review shows full review details
- [ ] Pagination implemented (20 reviews per page)
- [ ] Empty state message displayed when artist has no reviews
- [ ] Loading state displayed while fetching reviews
- [ ] Error handling for network failures
- [ ] Push notification sent when new review received
- [ ] API endpoints return review data with proper filtering and aggregation

## Notes

- Aggregate statistics help artists understand their overall performance at a glance
- Consider adding filter options in future (by rating, by date range, by service type)
- Empty state should be encouraging and explain how to get first reviews
- Review photos provide valuable context for understanding customer feedback
- Future enhancement: Analytics dashboard showing rating trends over time


