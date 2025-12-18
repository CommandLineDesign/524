# Moderate Reviews

**Epic**: [Review System](../epics/review-system.md)
**Role**: Admin
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- [Display Reviews on Artist Profile](./display-reviews-on-profile.md)

**Estimated Effort**: M (3-5 days)

## Story Statement

**As an** Admin  
**I want** to moderate inappropriate reviews  
**So that** I can maintain platform quality and protect users from offensive or fake content

## Detailed Description

Admins need comprehensive tools to moderate reviews across the platform to maintain content quality, remove offensive material, and handle disputes between customers and artists. The moderation system should allow admins to view all reviews, flag suspicious content, hide inappropriate reviews from public display, and permanently delete reviews that violate platform policies.

All moderation actions must be logged with admin ID and timestamp for accountability and audit purposes. When reviews are moderated, both the customer who wrote the review and the artist who received it should be notified of the action. A dedicated flagged reviews queue helps admins prioritize reviews that need attention.

## Acceptance Criteria

### Functional Requirements

- **Given** an admin opens the admin dashboard - **When** they navigate to "Reviews" - **Then** they see a list of all reviews across the platform
- **Given** the review list is displayed - **When** shown - **Then** admins can search and filter by artist, customer, date range, and status
- **Given** an admin views a review - **When** they click on it - **Then** a detail modal shows full context (booking details, users, photos, artist response)
- **Given** an admin is viewing a review - **When** they click "Flag" - **Then** the review is marked as flagged and added to the flagged queue
- **Given** an admin is viewing a review - **When** they click "Hide" - **Then** the review is hidden from public display (is_visible = false)
- **Given** an admin is viewing a review - **When** they click "Delete" with confirmation - **Then** the review is permanently deleted
- **Given** a review is moderated - **When** the action completes - **Then** both customer and artist receive notifications
- **Given** an admin opens the flagged queue - **When** they view it - **Then** they see all flagged reviews sorted by flag date
- **Given** a review is deleted - **When** removed - **Then** aggregate ratings are recalculated without the deleted review

### Non-Functional Requirements

- **Performance**: Review list loads within 2 seconds for up to 10,000 reviews
- **Security**: Only authenticated admins can access moderation tools
- **Audit**: All moderation actions logged with admin ID, action type, reason, and timestamp
- **Validation**: Delete action requires confirmation dialog to prevent accidents

## User Experience Flow

1. Admin logs into the web admin dashboard
2. Admin navigates to "Reviews" section from main menu
3. System displays review moderation dashboard with:
   - Search and filter controls
   - Flagged reviews count badge
   - List of all reviews with preview
4. Admin can filter reviews by:
   - Artist name
   - Customer name
   - Date range
   - Status (all, flagged, hidden, visible)
5. Admin clicks on a review to view full details
6. System displays modal with:
   - Full review content (ratings, text, photos)
   - Booking details (service type, date, amount)
   - Customer and artist information
   - Artist response (if present)
   - Moderation action buttons
7. Admin selects appropriate action:
   - **Flag**: Mark for investigation without hiding
   - **Hide**: Remove from public display
   - **Delete**: Permanently remove (requires confirmation)
8. For hide/delete actions, admin enters reason in required field
9. Admin confirms action
10. System executes moderation action and logs it
11. System sends notifications to affected users
12. System updates aggregate ratings if review was deleted
13. Admin sees confirmation message

## Technical Context

- **Epic Integration**: Ensures review system maintains quality and trust
- **System Components**: 
  - Web admin: Reviews moderation dashboard at `/admin/reviews`
  - API: `POST /api/v1/admin/reviews/:id/flag` endpoint
  - API: `POST /api/v1/admin/reviews/:id/hide` endpoint
  - API: `DELETE /api/v1/admin/reviews/:id` endpoint
  - API: `GET /api/v1/admin/reviews/flagged` endpoint
  - Database: Update reviews table (is_visible, is_flagged)
  - Database: Insert into moderation_log table
  - Notifications: Send to customer and artist
- **Data Requirements**: 
  - Write access to reviews table
  - Write access to moderation_log table
  - Recalculate artist aggregate ratings on delete
  - Track moderation actions with admin_id, action, reason, timestamp
- **Integration Points**: 
  - Hidden reviews excluded from public display
  - Deleted reviews removed from aggregate calculations
  - Notifications sent to affected users
  - Audit log for compliance and accountability

## Definition of Done

- [ ] Reviews moderation dashboard accessible at `/admin/reviews`
- [ ] Review list displays all reviews with search and filter controls
- [ ] Search by artist name, customer name works correctly
- [ ] Filter by date range and status works correctly
- [ ] Review detail modal shows full context and moderation actions
- [ ] "Flag" action marks review and adds to flagged queue
- [ ] "Hide" action sets is_visible = false and requires reason
- [ ] "Delete" action shows confirmation dialog and requires reason
- [ ] All moderation actions logged in moderation_log table
- [ ] Notifications sent to customer and artist when review moderated
- [ ] Flagged reviews queue accessible and shows flagged reviews
- [ ] Aggregate ratings recalculated when review deleted
- [ ] Audit log view shows moderation history
- [ ] Only authenticated admins can access moderation tools
- [ ] API endpoints validate admin authorization
- [ ] Error handling for network failures and validation errors

## Notes

- Moderation should be used sparingly to maintain trust in the review system
- Common reasons for moderation: offensive language, fake reviews, spam, off-topic content
- Consider implementing automated profanity filters in future to reduce manual moderation
- Flagged queue helps prioritize reviews that need attention
- Audit log is critical for accountability and dispute resolution
- Future enhancement: Allow artists to request review moderation with justification
- Future enhancement: Implement appeal process for moderated reviews

