# Setup Push Notifications

**Epic**: [Notification System](../epics/notification-system.md)
**Role**: System
**Priority**: Critical
**Status**: ✅ Completed
**Dependencies**:

- [Foundation Setup](../epics/foundation-setup.md)

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** System
**I want** to integrate with Firebase Cloud Messaging (FCM)
**So that** users receive real-time push notifications on their mobile devices

## Detailed Description

Push notifications are the primary channel for real-time communication with users in the 524 Beauty Marketplace. This story establishes the foundational infrastructure for sending push notifications through Firebase Cloud Messaging (FCM), which supports both iOS (via APNs) and Android devices.

The integration must handle device token registration when users log in, token refresh when tokens expire, and graceful handling of invalid tokens. The system should support both targeted notifications to specific users and topic-based notifications for broadcast messages (e.g., marketing campaigns).

This is a critical foundation story that enables all subsequent notification features in the platform.

## Acceptance Criteria

### Functional Requirements

- **Given** a user logs into the mobile app - **When** the app initializes - **Then** the device token is registered and stored in the database
- **Given** a device token expires or refreshes - **When** FCM triggers a token refresh - **Then** the new token is automatically updated in the database
- **Given** a notification needs to be sent - **When** the notification service is called with user ID and payload - **Then** the notification is delivered via FCM within 5 seconds
- **Given** a device token becomes invalid - **When** FCM returns an error - **Then** the token is marked as inactive and removed from future sends
- **Given** a user has multiple devices - **When** a notification is sent - **Then** all registered devices receive the notification
- **Given** a topic notification is triggered - **When** users are subscribed to that topic - **Then** all subscribed users receive the notification

### Non-Functional Requirements

- **Performance**: Notification delivery latency under 5 seconds for 95th percentile
- **Reliability**: 99.5% delivery success rate for valid tokens
- **Security**: FCM credentials stored securely in environment variables, not in code
- **Scalability**: Support sending to 10,000+ devices concurrently

## User Experience Flow

1. User installs the app and grants notification permissions
2. System requests device token from FCM
3. System sends token to backend API on login
4. Backend stores token associated with user account
5. When an event occurs (e.g., booking confirmed)
6. Backend retrieves user's device tokens
7. Backend sends notification payload to FCM
8. FCM delivers notification to user's device(s)
9. User sees notification in device notification center

## Technical Context

- **Epic Integration**: Core infrastructure enabling all push notification features
- **System Components**:
  - Mobile app: FCM SDK integration, token management
  - API: `POST /api/v1/devices/register` endpoint for token registration
  - API: Notification service for sending via FCM
  - Database: device_tokens table with user_id, token, platform, active status
- **Data Requirements**:
  - device_tokens table: id, user_id, token, platform (ios/android), is_active, created_at, updated_at
  - Support multiple tokens per user for multi-device scenarios
- **Integration Points**:
  - FCM Admin SDK for server-side sending
  - APNs via FCM for iOS devices
  - Mobile app FCM SDK for token management

## Definition of Done

- [ ] FCM project configured with iOS and Android credentials
- [ ] Mobile app integrates FCM SDK and requests notification permissions
- [ ] Device token registration endpoint implemented and tested
- [ ] Token refresh handling implemented on mobile and backend
- [ ] Notification service can send to individual users by user_id
- [ ] Notification service can send to topics
- [ ] Invalid token cleanup mechanism implemented
- [ ] Multi-device support verified
- [ ] Error handling and retry logic implemented
- [ ] Logging and monitoring for notification delivery
- [ ] Unit and integration tests with 80%+ coverage

## Notes

- FCM handles both Android (native) and iOS (via APNs) so we only need one integration
- Consider implementing a notification abstraction layer to support future channels
- Token storage should support quick lookup by user_id with proper indexing
- Marketing notifications require compliance with Korean Information and Communications Network Act - this is handled in the Preference Center story
- Rate limiting for FCM is 1000 messages/second per project - should be sufficient for initial launch
