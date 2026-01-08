# Integrate Email Service

**Epic**: [Notification System](../epics/notification-system.md)
**Role**: System
**Priority**: High
**Status**: ⏳ Not Started
**Dependencies**:

- [Setup Push Notifications](./setup-push-notifications.md)

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** System
**I want** to integrate with Amazon SES for transactional email delivery
**So that** users receive important communications like booking confirmations and receipts

## Detailed Description

Email serves as the formal communication channel for transactional messages that users may need to reference later. This includes booking confirmations, payment receipts, welcome emails, and account-related communications.

Amazon SES (Simple Email Service) provides reliable, cost-effective email delivery with high deliverability rates. The integration must support HTML templates for rich formatting, track delivery and engagement metrics, and handle bounces and complaints appropriately.

Unlike push and SMS which are immediate, email is suitable for non-urgent but important information that users should have a record of.

## Acceptance Criteria

### Functional Requirements

- **Given** a user completes registration - **When** their account is created - **Then** a welcome email is sent within 1 minute
- **Given** a booking is confirmed - **When** both parties accept - **Then** confirmation emails are sent to customer and artist
- **Given** a payment is processed - **When** the transaction completes - **Then** a receipt email is sent to the customer
- **Given** an email bounces - **When** SES reports the bounce - **Then** the user's email is marked as invalid
- **Given** a user reports spam - **When** SES receives the complaint - **Then** the user is automatically unsubscribed from marketing emails
- **Given** email templates are used - **When** sending notifications - **Then** the content is personalized with user and booking data

### Non-Functional Requirements

- **Performance**: Email delivery initiated within 1 minute of trigger event
- **Reliability**: 99% delivery rate for valid email addresses
- **Security**: SPF, DKIM, and DMARC configured for deliverability and security
- **Accessibility**: HTML emails include plain text alternative

## User Experience Flow

1. System event triggers email notification (registration, booking, payment)
2. System retrieves user's email address and relevant data
3. System selects appropriate email template
4. System populates template with personalized data
5. System sends email via SES API
6. SES delivers email to user's mail provider
7. User receives email in inbox
8. SES sends delivery/bounce/complaint webhook to our system
9. System updates email status and handles any issues

## Technical Context

- **Epic Integration**: Formal communication channel for transactional messages
- **System Components**:
  - API: Email service wrapping SES SDK
  - API: Webhook endpoint for SES notifications (SNS)
  - Templates: HTML email templates with Handlebars/MJML
  - Database: notification_logs with email-specific tracking
- **Data Requirements**:
  - Users must have verified email addresses
  - notification_logs: channel (email), status, opened_at, clicked_at
  - email_templates: id, name, subject, html_body, text_body, version
  - Email bounce/complaint tracking for sender reputation
- **Integration Points**:
  - Amazon SES API
  - Amazon SNS for delivery notifications
  - Email verification flow (existing)
  - Notification queue for async processing

## Definition of Done

- [ ] Amazon SES account configured and verified in production region
- [ ] Domain verified with SPF, DKIM, DMARC records
- [ ] SES SDK client implemented and tested
- [ ] Email service abstraction created
- [ ] Email templates created for: welcome, booking confirmation, receipt
- [ ] Template rendering with personalization working
- [ ] Bounce and complaint webhook handling implemented
- [ ] Plain text fallback for all HTML emails
- [ ] Email open/click tracking implemented (optional)
- [ ] Unsubscribe link included in all marketing emails
- [ ] Logging and deliverability monitoring implemented
- [ ] Unit and integration tests with 80%+ coverage

## Notes

- SES pricing: $0.10 per 1,000 emails - very cost effective
- Start in SES sandbox mode, request production access before launch
- Use MJML for responsive email templates that work across email clients
- Korean email providers (Naver, Daum) may have specific requirements - test thoroughly
- Consider using a template management service in the future for non-developer editing
- Marketing emails require explicit opt-in per Korean law
- Include physical address in footer per CAN-SPAM (for international users)
