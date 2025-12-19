# Respond to Review

**Epic**: [Review System](../epics/review-system.md)
**Role**: Artist
**Priority**: High
**Status**: 📋 Backlog
**Dependencies**:

- [View Artist Reviews](./view-artist-reviews.md)

**Estimated Effort**: S (1-2 days)

## Story Statement

**As an** Artist  
**I want** to respond publicly to customer reviews  
**So that** I can address feedback, show professionalism, and provide context to potential customers

## Detailed Description

Artists need the ability to respond publicly to customer reviews to demonstrate professionalism, address concerns, thank customers for positive feedback, and provide context for future customers reading reviews. Public responses show that the artist is engaged with customer feedback and cares about their reputation.

Artists should be able to write one response per review, which will be displayed directly below the customer's review on their public profile and in review listings. Responses can be edited within 24 hours of posting to allow for corrections, but after that they become permanent to maintain authenticity. Artists should be able to respond from both the review detail view and from their "My Reviews" section.

## Acceptance Criteria

### Functional Requirements

- **Given** an artist views a review without a response - **When** they tap "Respond" - **Then** a response form appears
- **Given** the response form is open - **When** the artist types their response - **Then** they can write up to 500 characters
- **Given** an artist has written a response - **When** they tap "Submit Response" - **Then** the response is saved and displayed below the review
- **Given** an artist submitted a response less than 24 hours ago - **When** they view it - **Then** they can edit the response
- **Given** an artist submitted a response more than 24 hours ago - **When** they view it - **Then** the edit option is no longer available
- **Given** an artist has already responded to a review - **When** they view it - **Then** they see their response instead of the "Respond" button
- **Given** an artist submits a response - **When** it's saved - **Then** the customer receives a notification

### Non-Functional Requirements

- **Performance**: Response submission completes within 1 second
- **Usability**: Character counter displays remaining characters (500 max)
- **Validation**: Response text is required and cannot be empty
- **Security**: Only the artist who received the review can respond

## User Experience Flow

1. Artist views a customer review in their "My Reviews" section
2. Artist sees "Respond" button below the review
3. Artist taps "Respond"
4. System displays response text field with character counter (500 max)
5. Artist types their response
6. Character counter updates as artist types
7. Artist reviews their response
8. Artist taps "Submit Response"
9. System validates response is not empty
10. System saves response and displays confirmation message
11. System sends notification to customer
12. Response appears below the customer review
13. Artist sees "Edit Response" option (available for 24 hours)

## Technical Context

- **Epic Integration**: Enables two-way communication in the review system
- **System Components**: 
  - Mobile app: Response form in review detail view
  - API: `POST /api/v1/reviews/:id/response` endpoint
  - API: `PUT /api/v1/reviews/:id/response` endpoint for editing
  - Database: Update reviews table with artist_response and response_created_at
  - Notifications: Trigger notification to customer
- **Data Requirements**: 
  - Write access to reviews table
  - Store artist_response (max 500 chars)
  - Store response_created_at timestamp for 24-hour edit window
  - Update response_updated_at when edited
- **Integration Points**: 
  - Integrates with review display on artist profiles
  - Triggers customer notification
  - Displayed in customer review history

## Definition of Done

- [ ] "Respond" button visible on reviews without artist responses
- [ ] Response form displays with text field and character counter
- [ ] Character limit of 500 enforced with counter display
- [ ] Form validation prevents empty responses
- [ ] Response submission saves to database
- [ ] Response displays below customer review after submission
- [ ] Customer receives notification when artist responds
- [ ] "Edit Response" option available within 24 hours of posting
- [ ] Edit option disappears after 24 hours
- [ ] Edited responses show "Edited" indicator
- [ ] API endpoints validate artist authorization
- [ ] Error handling for network failures and validation errors
- [ ] Loading state displayed during submission

## Notes

- 500 character limit encourages concise, professional responses
- 24-hour edit window allows for corrections while maintaining authenticity
- Responses are permanent after 24 hours to prevent manipulation
- Consider adding response templates in future (e.g., "Thank you for your feedback")
- Future enhancement: Allow artists to report inappropriate reviews while responding
- Responses should be professional and constructive, consider adding guidelines


