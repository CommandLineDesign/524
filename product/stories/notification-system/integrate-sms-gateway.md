# Integrate SMS Gateway

**Epic**: [Notification System](../epics/notification-system.md)
**Role**: System
**Priority**: High
**Status**: ⏳ Not Started
**Dependencies**:

- [Setup Push Notifications](./setup-push-notifications.md)

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** System
**I want** to integrate with Naver Cloud SENS for SMS delivery
**So that** users receive critical notifications even when push notifications fail or are disabled

## Detailed Description

SMS provides a reliable fallback channel for critical notifications such as OTP codes, urgent booking alerts, and time-sensitive messages. This story integrates Naver Cloud SENS (Simple & Easy Notification Service), which is optimized for the Korean market and provides high deliverability rates.

The SMS gateway should be used for:
- Authentication OTPs during login/registration
- Urgent booking requests that haven't been viewed within 10 minutes
- Critical system alerts (e.g., payment issues)
- Users who have disabled push notifications but opted into SMS

The integration must handle Korean phone number formatting, support both SMS and LMS (Long Message Service) for messages over 80 characters, and provide delivery status tracking.

## Acceptance Criteria

### Functional Requirements

- **Given** an OTP is requested - **When** the system generates the code - **Then** an SMS is sent within 3 seconds
- **Given** a message is under 80 characters - **When** sent via SENS - **Then** it is delivered as standard SMS
- **Given** a message exceeds 80 characters - **When** sent via SENS - **Then** it is automatically sent as LMS
- **Given** an artist hasn't viewed a new booking request - **When** 10 minutes have passed - **Then** an SMS reminder is sent (if opted in)
- **Given** a phone number is invalid - **When** the system attempts to send - **Then** the error is logged and the user is flagged for phone verification
- **Given** SMS delivery status is returned by SENS - **When** the callback is received - **Then** the notification status is updated in the database

### Non-Functional Requirements

- **Performance**: OTP delivery within 3 seconds, other SMS within 10 seconds
- **Reliability**: 99% delivery rate for valid Korean mobile numbers
- **Security**: API credentials secured, phone numbers encrypted at rest
- **Cost Efficiency**: LMS only used when message exceeds SMS character limit

## User Experience Flow

1. System determines SMS is needed (OTP, fallback, or user preference)
2. System retrieves user's verified phone number
3. System formats message with appropriate template
4. System calls SENS API with phone number and message
5. SENS delivers SMS to user's mobile carrier
6. User receives SMS on their phone
7. SENS sends delivery status callback to our webhook
8. System updates notification status in database

## Technical Context

- **Epic Integration**: Fallback channel for push notifications, primary channel for OTPs
- **System Components**:
  - API: SMS service wrapping SENS API
  - API: Webhook endpoint for delivery status callbacks
  - Database: notification_logs table with delivery status
  - Templates: Centralized SMS templates with i18n support
- **Data Requirements**:
  - Users must have verified phone numbers
  - notification_logs: id, user_id, channel (sms), status, sent_at, delivered_at, error
  - SMS templates stored with versioning
- **Integration Points**:
  - Naver Cloud SENS API
  - Phone number verification flow (existing)
  - Notification queue for async processing

## Definition of Done

- [ ] Naver Cloud SENS account configured with sender number
- [ ] SENS SDK/API client implemented and tested
- [ ] SMS service abstraction created for sending messages
- [ ] OTP sending implemented with 3-second SLA
- [ ] LMS auto-detection for long messages
- [ ] Delivery status webhook endpoint implemented
- [ ] Phone number validation and formatting
- [ ] Error handling for invalid numbers, rate limits, and API failures
- [ ] SMS templates for common notifications created
- [ ] Logging and cost monitoring implemented
- [ ] Unit and integration tests with 80%+ coverage

## Notes

- SENS pricing: SMS ~20 KRW, LMS ~50 KRW per message - monitor costs
- Korean phone numbers format: 010-XXXX-XXXX (store as 01012345678)
- SENS requires sender number registration and approval (can take 1-2 business days)
- Consider implementing a daily/monthly SMS cap per user to prevent abuse
- For OTPs, message format is regulated - must include sender identification
- Fallback to SMS after push failure should be configurable per notification type
