# Notification System

**Category**: Foundation

**Priority**: Medium

**Status**: ⏳ Not Started

**Dependencies**:

- [Foundation Setup](./foundation-setup.md)

**Estimated Effort**: Small (1-2 sprints)

## Description

This epic establishes the infrastructure for sending notifications across multiple channels. Notifications are crucial for engagement and transactional updates (e.g., "Booking Confirmed", "New Message"). The system must handle Push (FCM), SMS (SENS), and Email (SES) reliably.

## Key Components

- **Push Notifications**: Integration with Firebase Cloud Messaging (FCM) for mobile alerts.
- **SMS Gateway**: Integration with Naver Cloud SENS for high-reliability text messages (OTPs, urgent alerts).
- **Email Service**: Transactional emails for receipts and welcome messages.
- **Preference Center**: User settings to opt-in/out of specific notification types.
- **In-App Inbox**: A view within the app to see past notifications.

## Acceptance Criteria

- [ ] System can send push notifications to specific users or topics.
- [ ] System falls back to SMS if push fails (optional, or for specific critical alerts).
- [ ] Users can toggle "Marketing Notifications" on/off.
- [ ] Notification status (sent, delivered, failed) is tracked.
- [ ] Deep links work correctly (tapping notification opens correct screen).

## Technical Requirements

- **Queue**: Bull queue for asynchronous notification processing.
- **Templates**: Centralized management of notification content and translations.
- **Rate Limiting**: Prevent spamming users.

## User Stories

### Core Infrastructure
- [Setup Push Notifications](../stories/notification-system/setup-push-notifications.md): FCM integration for mobile alerts
- [Integrate SMS Gateway](../stories/notification-system/integrate-sms-gateway.md): Naver Cloud SENS for SMS delivery
- [Integrate Email Service](../stories/notification-system/integrate-email-service.md): Amazon SES for transactional emails
- [Implement Notification Queue](../stories/notification-system/implement-notification-queue.md): Bull queue for async processing

### User-Facing Features
- [Manage Notification Preferences](../stories/notification-system/manage-notification-preferences.md): User preference center
- [View In-App Notification Inbox](../stories/notification-system/view-in-app-notification-inbox.md): Notification history view
- [Handle Notification Deep Links](../stories/notification-system/handle-notification-deep-links.md): Tap-to-navigate functionality

### Observability
- [Track Notification Status](../stories/notification-system/track-notification-status.md): Delivery status tracking and monitoring

## Risks and Assumptions

- **Risk**: Users disabling push permissions reduces engagement.
- **Assumption**: We have valid credentials for FCM and APNS.

## Notes

- Marketing notifications require strict opt-in compliance in Korea (Information and Communications Network Act).
