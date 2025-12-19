# Add Review Detail Screen with Edit/Delete Actions

**Role**: Shopper
**Priority**: Medium
**Status**: 📋 Backlog
**Dependencies**:

- [View Customer Review History](./view-customer-review-history.md)
- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Shopper
**I want** to view detailed review information with edit and delete options
**So that** I can manage my submitted reviews and access artist responses

## Detailed Description

Currently, when customers tap on a review card in the "My Reviews" screen, they navigate directly to the booking detail screen. This creates a confusing user experience where users expect to see review-specific actions (edit, delete, report) but instead see booking information. We need a dedicated review detail screen that shows the complete review content, artist responses, and provides appropriate action buttons for managing the review within the allowed timeframe (24 hours for edits).

## Acceptance Criteria

### Functional Requirements

- **Given** a review card is tapped in My Reviews screen - **When** user taps on review - **Then** review detail screen opens showing full review content
- **Given** review detail screen is open - **When** review was submitted within 24 hours - **Then** edit and delete buttons are visible and enabled
- **Given** review detail screen is open - **When** review was submitted more than 24 hours ago - **Then** edit and delete buttons are hidden or disabled
- **Given** edit button is tapped - **When** user modifies review content - **Then** changes are saved and review list is refreshed
- **Given** delete button is tapped - **When** user confirms deletion - **Then** review is removed and user returns to review list
- **Given** review has artist response - **When** review detail screen loads - **Then** artist response is displayed below review content

### Non-Functional Requirements

- **Performance**: Screen loads within 500ms with cached data, 2 seconds with network fetch
- **Usability**: Clear visual hierarchy separating review content from artist responses and actions
- **Security**: Delete operations require confirmation to prevent accidental data loss

## User Experience Flow

1. Shopper opens My Reviews screen and sees list of submitted reviews
2. Shopper taps on a specific review card
3. System navigates to dedicated Review Detail screen
4. System displays full review content, rating, date, and associated booking reference
5. If artist has responded, system displays artist response below review content
6. If review is within 24-hour edit window, system shows Edit and Delete action buttons
7. Shopper can tap "View Booking" link to navigate to booking details if needed
8. Shopper can edit review content, save changes, and return to review list
9. Shopper can delete review after confirmation, then returns to updated review list

## Technical Context

- **Epic Integration**: Part of the customer review history feature, enhancing the review management capabilities
- **System Components**: Mobile React Native screen, existing ReviewCard component reuse, navigation system
- **Data Requirements**: Full review object with content, rating, timestamps, artist responses
- **Integration Points**: Connects My Reviews screen to booking detail screen via secondary navigation

## Definition of Done

- [ ] Review detail screen displays complete review information and artist responses
- [ ] Edit functionality available for reviews within 24-hour window
- [ ] Delete functionality with confirmation dialog
- [ ] Proper navigation flow between review list, detail, and booking screens
- [ ] UI components follow existing design system and accessibility guidelines
- [ ] Error handling for network failures and edge cases
- [ ] Unit tests for screen logic and user interactions
- [ ] Integration tests for navigation and data flow
- [ ] Code reviewed and approved by team
- [ ] Documentation updated to reflect new screen in navigation flow

## Notes

The screen should maintain consistency with existing review display patterns while providing a dedicated space for review management actions. Consider reusing existing components like ReviewCard for the review display portion, but add specific action buttons and artist response sections.