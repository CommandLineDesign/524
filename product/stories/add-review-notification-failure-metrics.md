# Add Review Notification Failure Metrics

**Epic**: [Review System](../epics/review-system.md)
**Role**: Developer
**Priority**: Low
**Status**: ⏳ Not Started
**Dependencies**:

- [Submit Customer Review](./submit-customer-review.md)

**Estimated Effort**: XS (1-2 hours)

## Story Statement

**As a** Developer
**I want** to track metrics for review notification failures
**So that** I can detect and respond to systemic notification infrastructure problems

## Detailed Description

The review submission service currently logs notification failures when sending notifications to artists about new reviews, but these failures are only recorded in application logs. Without aggregated metrics, it's difficult to detect patterns indicating broader infrastructure problems, such as notification service outages, rate limiting, or misconfiguration.

By adding metrics tracking for notification failures, the development and operations teams can set up alerts for elevated failure rates, identify trends over time, and proactively address notification infrastructure issues before they affect a large number of users. This improves system observability and enables faster incident response.

## Acceptance Criteria

### Functional Requirements

- **Given** a notification fails to send after review submission - **When** the error is caught - **Then** a metric is incremented with tags for artist ID and error type
- **Given** notification metrics are being collected - **When** viewing the metrics dashboard - **Then** metrics show failure count, failure rate, and failures by error type
- **Given** notification failure rate exceeds threshold - **When** the monitoring system checks metrics - **Then** an alert is triggered for the on-call team
- **Given** metrics are collected - **When** analyzing historical data - **Then** trends in notification reliability are visible over time

### Non-Functional Requirements

- **Observability**: Metrics include relevant dimensions (artist ID, error type, timestamp)
- **Performance**: Metrics collection adds < 1ms overhead per request
- **Reliability**: Metrics are sent asynchronously and don't block review submission
- **Scalability**: Metrics system can handle high-volume review submission scenarios

## User Experience Flow

This is an infrastructure improvement with no direct user-facing changes:

1. Customer submits review successfully
2. System attempts to send notification to artist
3. Notification service fails due to infrastructure issue
4. Error is logged to application logs (existing behavior)
5. Metrics counter is incremented with contextual tags (new behavior)
6. Metrics are sent to monitoring system (e.g., DataDog, CloudWatch)
7. Monitoring dashboard shows notification failure spike
8. Alert triggers if failure rate exceeds threshold
9. On-call engineer investigates notification service
10. Issue is resolved before affecting more users

## Technical Context

- **Epic Integration**: Improves operational reliability of the review system
- **System Components**:
  - API: ReviewService notification error handling ([packages/api/src/services/reviewService.ts:97-120](packages/api/src/services/reviewService.ts#L97-L120))
  - Metrics: Metrics collection library (e.g., prom-client, StatsD, DataDog)
  - Monitoring: Dashboard and alerting system
- **Data Requirements**:
  - Metrics storage with timestamp, counter, and tags
  - Historical metrics retention for trend analysis
- **Integration Points**:
  - Integrates with existing notification service
  - Connects to monitoring/metrics platform
  - Supports alerting infrastructure

## Definition of Done

- [ ] Metrics library installed and configured (if not already present)
- [ ] Notification failure increments metrics counter
- [ ] Metrics include tags: artistId, errorType/errorCode
- [ ] Metrics are sent asynchronously (non-blocking)
- [ ] Dashboard widget shows notification failure rate
- [ ] Alert configured for notification failure rate > 5% over 10 minutes
- [ ] Metrics include both failure count and success count (for rate calculation)
- [ ] Documentation updated with metrics schema and alert thresholds
- [ ] Runbook created for notification failure alert response
- [ ] Testing verifies metrics are collected on actual failures

## Notes

- Use existing metrics infrastructure if already in place for other features
- Consider metrics format: `review.notification.failure` with tags vs separate metric names
- Include success metrics too (`review.notification.success`) to calculate failure rate
- Notification failures don't prevent review submission (graceful degradation already implemented)
- Suggested metric tags: `artistId`, `errorType` (timeout, server_error, invalid_config, etc.)
- Alert threshold of 5% failure rate is suggested starting point - tune based on baseline
- Consider adding metrics for notification latency as future enhancement
- This pattern can be applied to other notification scenarios throughout the app
