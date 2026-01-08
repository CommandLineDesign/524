# Manage Notification Preferences

**Epic**: [Notification System](../epics/notification-system.md)
**Role**: Customer
**Priority**: High
**Status**: ⏳ Not Started
**Dependencies**:

- [Setup Push Notifications](./setup-push-notifications.md)

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Customer
**I want** to control which notifications I receive and through which channels
**So that** I only get messages that are relevant to me without being overwhelmed

## Detailed Description

Users need granular control over their notification preferences to maintain engagement without causing notification fatigue. The preference center allows users to opt in or out of different notification categories (booking updates, marketing, messages) and choose their preferred channels (push, SMS, email).

Korean law (Information and Communications Network Act) requires explicit opt-in for marketing communications, making this feature legally required. Users must be able to easily toggle marketing notifications off while keeping essential transactional notifications enabled.

The preference center should be accessible from the app settings and provide clear descriptions of each notification type.

## Acceptance Criteria

### Functional Requirements

- **Given** a user navigates to settings - **When** they tap "Notification Preferences" - **Then** they see all notification categories with toggle switches
- **Given** a user toggles off "Marketing Notifications" - **When** they save preferences - **Then** they stop receiving promotional content across all channels
- **Given** a user disables push notifications - **When** a booking notification is sent - **Then** the system falls back to SMS (if enabled)
- **Given** a new user registers - **When** their account is created - **Then** default preferences are set with marketing OFF and transactional ON
- **Given** a user changes preferences - **When** they save - **Then** the changes take effect immediately for new notifications
- **Given** marketing opt-in is required - **When** the user enables marketing - **Then** explicit consent is recorded with timestamp

### Non-Functional Requirements

- **Performance**: Preference changes save within 500ms
- **Usability**: Clear descriptions for each notification category
- **Compliance**: Marketing opt-in/out records retained for 3 years per Korean law
- **Reliability**: Preferences cached for quick lookup during notification sending

## User Experience Flow

1. User opens app settings
2. User taps "Notification Preferences"
3. System displays notification categories:
   - Booking Updates (new requests, confirmations, reminders)
   - Messages (new chat messages)
   - Marketing (promotions, offers, news)
4. Each category shows channel toggles: Push, SMS, Email
5. User adjusts toggles based on preferences
6. User taps "Save" or changes auto-save
7. System stores preferences and displays confirmation
8. Future notifications respect the new preferences

## Technical Context

- **Epic Integration**: Central preference management for all notification types
- **System Components**:
  - Mobile app: Preference center screen in settings
  - API: `GET/PUT /api/v1/users/me/notification-preferences`
  - Database: notification_preferences table
  - Cache: Redis cache for quick preference lookup
- **Data Requirements**:
  - notification_preferences table: user_id, category, push_enabled, sms_enabled, email_enabled
  - marketing_consent_log: user_id, consented, consent_timestamp, ip_address
  - Categories: booking, messages, marketing
- **Integration Points**:
  - Notification service checks preferences before sending
  - FCM topic subscriptions updated based on preferences
  - Analytics for preference changes

## Definition of Done

- [ ] Preference center UI implemented in mobile app
- [ ] API endpoints for reading and updating preferences
- [ ] Database schema for preferences and consent logging
- [ ] Default preferences set for new users (marketing OFF)
- [ ] Marketing consent recorded with timestamp and IP
- [ ] Notification service checks preferences before sending
- [ ] FCM topic subscriptions sync with preferences
- [ ] Channel fallback logic implemented (push -> SMS)
- [ ] Preferences cached in Redis for performance
- [ ] Clear category descriptions in UI
- [ ] Unit and integration tests with 80%+ coverage

## Notes

- Korean law requires marketing opt-in records to be retained and auditable
- Consider adding "Quiet Hours" feature in future iteration
- "Booking Updates" should not be fully disableable - critical updates always sent
- SMS preferences should only be shown to users with verified phone numbers
- Test preference sync across multiple devices for same user
- Consider a single "Mute All" toggle for temporary notification pause
