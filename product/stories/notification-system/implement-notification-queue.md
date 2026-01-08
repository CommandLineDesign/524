# Implement Notification Queue

**Epic**: [Notification System](../epics/notification-system.md)
**Role**: Developer
**Priority**: Critical
**Status**: ⏳ Not Started
**Dependencies**:

- [Setup Push Notifications](./setup-push-notifications.md)
- [Integrate SMS Gateway](./integrate-sms-gateway.md)
- [Integrate Email Service](./integrate-email-service.md)

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Developer
**I want** a reliable queue-based notification processing system
**So that** notifications are processed asynchronously with proper retry logic and failure handling

## Detailed Description

Notifications must be processed asynchronously to avoid blocking user-facing API requests. This story implements a Bull queue-based system for reliable notification processing across all channels (push, SMS, email).

The queue system must handle high throughput during peak times (e.g., many bookings being confirmed simultaneously), implement exponential backoff for failed deliveries, and provide visibility into queue health and processing status.

This is foundational infrastructure that enables scalable, reliable notification delivery across the platform.

## Acceptance Criteria

### Functional Requirements

- **Given** an event triggers a notification - **When** the notification service is called - **Then** a job is added to the queue and returns immediately
- **Given** a notification job is queued - **When** the worker processes it - **Then** the appropriate channel service is called based on type
- **Given** a notification fails to send - **When** the error is retryable - **Then** the job is retried with exponential backoff (max 3 attempts)
- **Given** a notification fails after all retries - **When** the job is moved to failed queue - **Then** an alert is triggered and the failure is logged
- **Given** multiple notifications are queued - **When** processed concurrently - **Then** rate limits for each channel are respected
- **Given** the queue worker crashes - **When** it restarts - **Then** incomplete jobs are automatically retried

### Non-Functional Requirements

- **Performance**: Queue throughput of 1000+ notifications per minute
- **Reliability**: No notification loss during system restarts
- **Observability**: Queue depth, processing time, and failure rate metrics
- **Scalability**: Horizontal scaling via multiple workers

## User Experience Flow

1. User action triggers notification (e.g., booking confirmed)
2. API adds notification job to Bull queue
3. API returns success immediately (non-blocking)
4. Queue worker picks up job
5. Worker determines channels based on notification type and preferences
6. Worker calls channel services (push, SMS, email) in parallel or sequence
7. Success: job marked complete, status logged
8. Failure: job retried with backoff or moved to dead letter queue
9. Metrics and logs captured for monitoring

## Technical Context

- **Epic Integration**: Core infrastructure for all notification delivery
- **System Components**:
  - API: Notification service that enqueues jobs
  - Worker: Bull queue processor for notifications
  - Redis: Queue storage backend
  - Database: notification_logs for status tracking
- **Data Requirements**:
  - Job payload: user_id, notification_type, channels[], data, created_at
  - notification_logs: job_id, channel, status, attempts, error, completed_at
  - Queue metrics: depth, latency, failure rate
- **Integration Points**:
  - Push notification service
  - SMS gateway service
  - Email service
  - Preference service for channel selection
  - Monitoring/alerting system

## Definition of Done

- [ ] Bull queue configured with Redis backend
- [ ] Notification job processor implemented
- [ ] Channel-specific handlers (push, SMS, email) integrated
- [ ] Retry logic with exponential backoff (3 attempts)
- [ ] Dead letter queue for failed notifications
- [ ] Rate limiting per channel implemented
- [ ] Concurrent worker processing with configurable concurrency
- [ ] Job priority support (urgent > normal)
- [ ] Queue health metrics exposed (Prometheus/CloudWatch)
- [ ] Graceful shutdown handling for workers
- [ ] Admin dashboard for queue monitoring (Bull Board)
- [ ] Alerting for queue depth and failure rate thresholds
- [ ] Unit and integration tests with 80%+ coverage

## Notes

- Use Bull over BullMQ for simplicity unless specific MQ features needed
- Consider separate queues for each channel to isolate failures
- FCM rate limit: 1000/sec, SENS rate limit: varies by plan, SES: 14/sec (default)
- Implement job deduplication to prevent duplicate notifications
- Consider adding notification scheduling for future dated notifications
- Dead letter queue should be reviewable for debugging
- Worker concurrency should be tunable via environment variable
