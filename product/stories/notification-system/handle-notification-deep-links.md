# Handle Notification Deep Links

**Epic**: [Notification System](../epics/notification-system.md)
**Role**: Customer
**Priority**: High
**Status**: ⏳ Not Started
**Dependencies**:

- [Setup Push Notifications](./setup-push-notifications.md)
- [View In-App Notification Inbox](./view-in-app-notification-inbox.md)

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** Customer
**I want** to tap on a notification and be taken directly to the relevant screen
**So that** I can quickly take action without navigating through the app

## Detailed Description

Deep links transform notifications from passive alerts into actionable entry points. When a user taps a push notification about a new booking request, they should land directly on that booking's detail screen, not the home page.

This story implements deep link handling for all notification types, including proper navigation when the app is in the foreground, background, or terminated. The system must also handle edge cases like invalid links, expired content, and permission requirements.

## Acceptance Criteria

### Functional Requirements

- **Given** a user taps a booking notification - **When** the app opens - **Then** they are navigated to the booking detail screen
- **Given** a user taps a message notification - **When** the app opens - **Then** they are navigated to the chat thread
- **Given** the app is already open - **When** a notification is tapped - **Then** the current screen is replaced/pushed with the target screen
- **Given** the app is terminated - **When** a notification is tapped - **Then** the app launches and navigates to the target screen
- **Given** a deep link points to deleted content - **When** tapped - **Then** an appropriate error message is shown
- **Given** a deep link requires authentication - **When** the user is logged out - **Then** they are prompted to login first, then redirected

### Non-Functional Requirements

- **Performance**: Deep link navigation completes within 500ms after app is ready
- **Usability**: Back navigation returns to appropriate parent screen
- **Reliability**: 100% of valid deep links resolve correctly
- **Security**: Deep links validate user has permission to view target content

## User Experience Flow

1. User receives push notification about new booking request
2. Notification displays: "New booking request from [Customer]"
3. User taps notification
4. App opens (or comes to foreground)
5. App parses deep link: `524://bookings/abc123`
6. App navigates to BookingDetailScreen with ID abc123
7. User views booking and can accept/decline
8. User taps back - navigates to booking list (logical parent)

## Technical Context

- **Epic Integration**: Enhances notification utility through direct navigation
- **System Components**:
  - Mobile app: Deep link handler and router
  - Mobile app: FCM notification tap handler
  - API: Include deep link data in notification payloads
- **Data Requirements**:
  - Notification payload includes `deep_link` field
  - Deep link format: `524://{screen}/{id}` or `https://524.app/{screen}/{id}`
  - Supported screens: bookings, chats, profile, settings, notifications
- **Integration Points**:
  - Push notification payloads
  - In-app notification inbox taps
  - App navigation/routing system
  - Authentication state management

## Definition of Done

- [ ] Deep link URL scheme registered for app (524://)
- [ ] Universal links configured (https://524.app/*)
- [ ] FCM notification tap handler extracts deep link
- [ ] Deep link parser maps URLs to screens/params
- [ ] Navigation handles app in foreground, background, and terminated states
- [ ] Back navigation configured for deep-linked screens
- [ ] Invalid/expired link error handling
- [ ] Authentication requirement handling for protected screens
- [ ] All notification types include appropriate deep links
- [ ] In-app inbox notifications use same deep link handling
- [ ] Unit tests for deep link parsing
- [ ] E2E tests for key deep link flows

## Notes

- Use React Navigation deep linking for React Native
- Consider deferred deep links for notifications received when logged out
- Universal links (https) preferred over custom schemes for better UX
- Test deep links on both iOS and Android - behavior differs slightly
- Include analytics event when deep link is followed
- Consider deep link fallback to web for users without app installed
- Deep links must not expose sensitive data in URL (use IDs, not full data)
