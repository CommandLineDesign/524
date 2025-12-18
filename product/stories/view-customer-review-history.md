# View Customer Review History

**Epic**: [Review System](../epics/review-system.md)
**Role**: Customer
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- [Submit Customer Review](./submit-customer-review.md)

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** Customer  
**I want** to view all the reviews I've written  
**So that** I can track my service history and see artist responses

## Detailed Description

Customers need a centralized location to view all the reviews they have written across different bookings and artists. This "My Reviews" section provides a comprehensive history of their feedback, allowing them to see which artists they've reviewed, what ratings they gave, and any responses from artists. This feature helps customers track their service history and maintain awareness of their contributions to the marketplace community.

The review history should be easily accessible from the customer's profile section and display reviews in reverse chronological order (newest first). Each review entry should show the artist details, service information, ratings, review text, photos, and any artist responses.

## Acceptance Criteria

### Functional Requirements

- **Given** a customer opens their profile - **When** they tap "My Reviews" - **Then** they see a list of all reviews they've written
- **Given** the review list is displayed - **When** there are multiple reviews - **Then** they are sorted by date with newest first
- **Given** a customer views a review entry - **When** they look at the details - **Then** they see artist name, service type, booking date, and their ratings
- **Given** a review entry is displayed - **When** the artist has responded - **Then** the artist response is shown below the customer review
- **Given** a customer taps a review entry - **When** they select it - **Then** they navigate to the full booking detail page
- **Given** a customer has no reviews - **When** they open "My Reviews" - **Then** they see an empty state message encouraging them to leave reviews

### Non-Functional Requirements

- **Performance**: Review list loads within 1 second for up to 100 reviews
- **Usability**: Reviews display in card format with clear visual hierarchy
- **Pagination**: Load 20 reviews per page with infinite scroll or "Load More" button
- **Offline**: Previously loaded reviews cached for offline viewing

## User Experience Flow

1. Customer opens their profile in the mobile app
2. Customer taps "My Reviews" tab or menu item
3. System loads and displays all reviews written by the customer
4. Customer sees list of review cards sorted by date (newest first)
5. Each card shows:
   - Artist profile photo and name
   - Service type and booking date
   - Star ratings (overall, quality, professionalism, timeliness)
   - Review text excerpt (first 2 lines)
   - Review photos (if any)
   - Artist response (if any)
6. Customer can tap a review card to view full booking details
7. Customer can scroll through all their reviews
8. System loads more reviews as customer scrolls (pagination)

## Technical Context

- **Epic Integration**: Provides customers visibility into their review contributions
- **System Components**: 
  - Mobile app: "My Reviews" section in customer profile
  - API: `GET /api/v1/reviews?customer_id={id}` endpoint
  - Database: Query reviews table filtered by customer_id
- **Data Requirements**: 
  - Read access to reviews table
  - Join with bookings, artists, and review_images tables
  - Pagination support (20 reviews per page)
- **Integration Points**: 
  - Links to booking detail pages
  - Displays artist profile information
  - Shows review photos from S3/CloudFront

## Definition of Done

- [ ] "My Reviews" section accessible from customer profile
- [ ] Review list displays all customer's reviews sorted by date (newest first)
- [ ] Each review card shows artist info, service details, ratings, and text
- [ ] Review photos displayed as thumbnails in review cards
- [ ] Artist responses displayed when present
- [ ] Tapping a review navigates to booking detail page
- [ ] Pagination implemented (20 reviews per page)
- [ ] Empty state message displayed when customer has no reviews
- [ ] Loading state displayed while fetching reviews
- [ ] Error handling for network failures
- [ ] Previously loaded reviews cached for offline viewing
- [ ] API endpoint returns paginated review data with proper filtering

## Notes

- Consider adding filter options in future (by rating, by artist, by date range)
- Future enhancement: Allow customers to delete their reviews from this screen
- Review cards should be visually consistent with review display on artist profiles
- Empty state could include a call-to-action to complete bookings and leave reviews

