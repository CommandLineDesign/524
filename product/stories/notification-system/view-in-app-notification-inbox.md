# View In-App Notification Inbox

**Epic**: [Notification System](../epics/notification-system.md)
**Role**: Customer
**Priority**: Medium
**Status**: ✅ Completed
**Dependencies**:

- [Setup Push Notifications](./setup-push-notifications.md)

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Customer
**I want** to view all my past notifications in one place within the app
**So that** I can review important updates I may have missed

## Detailed Description

Users often miss push notifications or dismiss them accidentally. The in-app notification inbox provides a persistent record of all notifications, allowing users to catch up on missed updates and revisit important information.

The inbox displays notifications chronologically with clear visual distinction between read and unread items. Each notification should be tappable to navigate to the relevant screen (e.g., booking details, chat thread). The inbox should show a badge count on the navigation icon indicating unread notifications.

## Acceptance Criteria

### Functional Requirements

- **Given** a user taps the notification bell icon - **When** the inbox opens - **Then** they see a chronological list of notifications (newest first)
- **Given** there are unread notifications - **When** the user views the app - **Then** a badge count appears on the notification icon
- **Given** a notification is tapped - **When** it has an associated action - **Then** the user is navigated to the relevant screen
- **Given** a notification is viewed - **When** the user opens the inbox - **Then** the notification is marked as read
- **Given** notifications older than 30 days - **When** the user views the inbox - **Then** old notifications are archived but still accessible
- **Given** no notifications exist - **When** the user opens the inbox - **Then** an empty state with helpful message is displayed
- **Given** many notifications exist - **When** scrolling the inbox - **Then** older notifications are loaded via infinite scroll

### Non-Functional Requirements

- **Performance**: Inbox loads within 500ms with first 20 notifications
- **Usability**: Clear visual distinction between read (gray) and unread (highlighted)
- **Reliability**: Notifications persist even if push notification was not received
- **Accessibility**: Screen reader compatible with proper labels

## User Experience Flow

1. User sees notification bell icon in app header/tab bar
2. Badge count shows number of unread notifications
3. User taps notification bell icon
4. System displays inbox with recent notifications
5. Unread notifications appear with visual highlight
6. User taps a notification about a new booking
7. System navigates to the booking details screen
8. System marks that notification as read
9. User returns to inbox - that notification now shows as read
10. Badge count decrements accordingly

## Technical Context

- **Epic Integration**: Provides persistent access to all notification history
- **System Components**:
  - Mobile app: Notification inbox screen
  - Mobile app: Badge count component on navigation
  - API: `GET /api/v1/notifications` with pagination
  - API: `PUT /api/v1/notifications/:id/read`
  - Database: in_app_notifications table
- **Data Requirements**:
  - in_app_notifications: id, user_id, title, body, type, data (JSON), is_read, created_at
  - Badge count calculated from unread notifications
  - Notification types: booking, message, marketing, system
- **Integration Points**:
  - Created alongside push notifications
  - Deep links to relevant screens
  - Real-time badge count updates via WebSocket or polling
  - Notification service creates in-app entry when sending

## Definition of Done

- [ ] Notification inbox screen implemented with list view
- [ ] Badge count displayed on notification icon
- [ ] API endpoints for listing and marking notifications as read
- [ ] Visual distinction between read and unread notifications
- [ ] Tap-to-navigate working for all notification types
- [ ] Infinite scroll pagination implemented
- [ ] Empty state design implemented
- [ ] In-app notifications created when push is sent
- [ ] 30-day retention with archive access
- [ ] Real-time badge count updates
- [ ] Pull-to-refresh functionality
- [ ] Unit and integration tests with 80%+ coverage

## Notes

- Consider adding "Mark All as Read" functionality
- Notification grouping (e.g., multiple messages from same thread) for future iteration
- In-app notifications should be created even if push delivery fails
- Consider notification categories/tabs in future (Bookings, Messages, All)
- Badge count should sync across app sessions and devices
- Long notification text should be truncated with "..." and full text shown on tap
