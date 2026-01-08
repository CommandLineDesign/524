# Track Notification Status

**Epic**: [Notification System](../epics/notification-system.md)
**Role**: Developer
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- [Implement Notification Queue](./implement-notification-queue.md)

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** Developer
**I want** to track the delivery status of all notifications
**So that** I can monitor delivery rates, debug failures, and ensure notification reliability

## Detailed Description

Notification delivery status tracking provides visibility into the health of the notification system. This includes tracking whether notifications were sent, delivered, failed, or bounced across all channels.

Status tracking enables:
- Debugging why specific users aren't receiving notifications
- Monitoring overall delivery rates and identifying degradation
- Identifying invalid tokens/emails/phone numbers for cleanup
- Compliance reporting for marketing opt-outs
- Analytics on notification engagement

## Acceptance Criteria

### Functional Requirements

- **Given** a notification is sent via push - **When** FCM acknowledges receipt - **Then** status is updated to "sent"
- **Given** a notification is sent via SMS - **When** SENS delivery callback is received - **Then** status is updated to "delivered"
- **Given** an email bounces - **When** SES reports the bounce - **Then** status is updated to "bounced" and email marked invalid
- **Given** a notification fails after retries - **When** moved to dead letter queue - **Then** status is updated to "failed" with error details
- **Given** an admin needs debugging info - **When** they query notification logs - **Then** they can filter by user, channel, status, and date range
- **Given** the system is running - **When** metrics are collected - **Then** delivery rates per channel are available for monitoring

### Non-Functional Requirements

- **Performance**: Status updates complete within 100ms
- **Retention**: Notification logs retained for 90 days
- **Observability**: Real-time metrics for delivery rate, failure rate, latency
- **Queryability**: Logs searchable by user_id, notification_type, channel, status

## User Experience Flow

1. Notification is triggered by system event
2. Job is added to queue with "pending" status
3. Worker processes job, status updated to "processing"
4. Channel service sends notification
5. Success: status updated to "sent"
6. Delivery callback received: status updated to "delivered"
7. Or: failure detected: status updated to "failed" with error
8. Metrics aggregated for monitoring dashboards
9. Support team can query logs for specific user issues

## Technical Context

- **Epic Integration**: Observability layer for notification infrastructure
- **System Components**:
  - Database: notification_logs table with comprehensive status tracking
  - API: Admin endpoints for querying notification logs
  - Webhooks: Handlers for FCM, SENS, SES callbacks
  - Metrics: Prometheus/CloudWatch metrics for dashboards
- **Data Requirements**:
  - notification_logs: id, user_id, notification_type, channel, status, error_message, payload, created_at, sent_at, delivered_at, failed_at
  - Status enum: pending, processing, sent, delivered, failed, bounced
  - Indexes on user_id, status, created_at for query performance
- **Integration Points**:
  - Queue worker status updates
  - FCM delivery receipts
  - SENS delivery callbacks
  - SES SNS notifications
  - Monitoring/alerting system

## Definition of Done

- [ ] notification_logs table created with proper schema and indexes
- [ ] Status enum implemented: pending, processing, sent, delivered, failed, bounced
- [ ] Queue worker updates status at each stage
- [ ] FCM delivery receipt handling (if using data messages)
- [ ] SENS webhook updates SMS status
- [ ] SES SNS webhook updates email status (delivered/bounced/complained)
- [ ] Admin API for querying logs with filters
- [ ] Prometheus metrics: notification_sent_total, notification_failed_total by channel
- [ ] Grafana dashboard for notification health monitoring
- [ ] Alerting rules for delivery rate degradation
- [ ] 90-day log retention policy configured
- [ ] Unit tests for status transitions

## Notes

- FCM doesn't provide delivery confirmation by default - only sent confirmation
- Consider separate tables if log volume becomes too large (partition by date)
- Implement log sampling for very high volume if needed
- Bounce/complaint handling is critical for email sender reputation
- Consider integrating with existing observability stack (DataDog, etc.)
- Status tracking enables future features like notification retry dashboard
