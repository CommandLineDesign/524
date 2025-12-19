# Submit Customer Review

**Epic**: [Review System](../epics/review-system.md)
**Role**: Customer
**Priority**: Critical
**Status**: 📝 In Progress
**Dependencies**:

- [Mark Booking Complete](./mark-booking-complete.md)

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Customer  
**I want** to leave a review after my service is completed  
**So that** I can share my experience and help other customers make informed decisions

## Detailed Description

After a beauty service is completed, customers need a way to provide feedback about their experience with the artist. This review system allows customers to rate the service across multiple dimensions (overall quality, professionalism, and timeliness), write optional text feedback, and upload photos of the results. Reviews are the primary trust signal in the marketplace, helping future customers choose the right artist for their needs.

The review interface should be accessible from the completed booking card and must only be available after the artist has marked the booking as "Completed". Customers have 30 days from the service completion date to submit their review, after which the option expires. Reviews can be edited within 24 hours of submission to allow for corrections or additions.

## Acceptance Criteria

### Functional Requirements

- **Given** a booking is in "completed" status - **When** the customer views the booking - **Then** they see a "Leave Review" button
- **Given** a customer clicks "Leave Review" - **When** the review form opens - **Then** they see rating inputs for overall, quality, professionalism, and timeliness (1-5 stars each)
- **Given** a customer is filling out the review - **When** they select star ratings - **Then** the ratings are visually highlighted and saved
- **Given** a customer has selected ratings - **When** they enter optional review text - **Then** they can write up to 1000 characters
- **Given** a customer submits a review - **When** all required fields are complete - **Then** the review is saved and the artist is notified
- **Given** a booking was completed more than 30 days ago - **When** the customer views it - **Then** the review option is no longer available
- **Given** a customer submitted a review less than 24 hours ago - **When** they view it - **Then** they can edit the review
- **Given** a customer already left a review - **When** they view the booking - **Then** they see their existing review instead of the submission form

### Non-Functional Requirements

- **Performance**: Review submission completes within 1 second
- **Usability**: Star rating interface is large and touch-friendly on mobile
- **Validation**: Review text limited to 1000 characters with counter displayed
- **Security**: Only the customer who booked the service can leave a review

## User Experience Flow

1. Customer receives notification that their service is complete
2. Customer opens the completed booking in their app
3. System displays booking details with prominent "Leave Review" button
4. Customer taps "Leave Review"
5. System displays review form with four star rating sections
6. Customer rates overall experience (1-5 stars, required)
7. Customer rates quality, professionalism, and timeliness (1-5 stars each, required)
8. Customer optionally writes text review (up to 1000 characters)
9. Customer optionally adds photos (handled by separate photo upload story)
10. Customer taps "Submit Review"
11. System validates all required ratings are provided
12. System saves review and displays confirmation message
13. System sends notification to artist about new review
14. Customer sees their submitted review displayed on the booking

## Technical Context

- **Epic Integration**: Core review submission capability that enables the reputation system
- **System Components**: 
  - Mobile app: Review submission form in booking detail screen
  - API: `POST /api/v1/bookings/:id/review` endpoint
  - Database: Insert into reviews table with all rating dimensions
  - Notifications: Trigger notification to artist
- **Data Requirements**: 
  - Write access to reviews table
  - Link review to booking_id, customer_id, and artist_id
  - Store overall_rating, quality_rating, professionalism_rating, timeliness_rating
  - Store optional review_text (max 1000 chars)
  - Record created_at timestamp for 30-day window enforcement
- **Integration Points**: 
  - Depends on booking completion status
  - Integrates with photo upload for review images
  - Triggers artist notification
  - Updates artist aggregate ratings

## Definition of Done

- [x] "Leave Review" button appears on completed bookings within 30 days
- [x] Review form displays four star rating inputs (overall, quality, professionalism, timeliness)
- [x] All four ratings are required before submission
- [x] Optional text field with 1000 character limit and counter
- [x] Form validation prevents submission without required ratings
- [x] Review submission saves to database with all fields
- [x] Artist receives notification when review is submitted
- [x] Customer can view their submitted review on the booking
- [ ] Customer can edit review within 24 hours of submission
- [x] Review option disappears after 30 days from completion
- [x] Only one review per booking is allowed
- [x] API endpoint validates booking is completed and customer is authorized
- [x] Error handling for network failures and validation errors

## Notes

- Multi-dimensional ratings (quality, professionalism, timeliness) provide more detailed feedback than a single overall rating
- The 30-day window encourages timely reviews while memories are fresh
- 24-hour edit window allows for corrections without allowing indefinite changes
- Photo upload functionality is handled by a separate story for modularity
- Consider adding review templates or prompts in future iterations to encourage detailed feedback

