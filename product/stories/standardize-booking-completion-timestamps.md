# Standardize Booking Completion Timestamps

**Role**: Developer
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** developer
**I want** to standardize the booking completion timestamp usage across the review system
**So that** review window calculations are consistent and use the correct authoritative timestamp

## Detailed Description

The booking system currently has two separate timestamp fields that represent completion: `completedAt` (status-based completion) and `serviceCompletedAt` (actual service completion time). The review submission feature uses `completedAt || createdAt` as a fallback chain for the 30-day review window calculation, but the existence of `serviceCompletedAt` suggests potential confusion about which timestamp should be authoritative.

This ambiguity creates risks for review window validation logic and could lead to incorrect behavior where reviews are allowed or denied based on the wrong timestamp. We need to audit both fields, determine which should be the single source of truth for review window calculations, and update all related code to use the correct field consistently.

## Acceptance Criteria

### Functional Requirements

- **Given** the bookings schema has both `completedAt` and `serviceCompletedAt` fields - **When** conducting a code audit - **Then** document the intended purpose and use case for each field
- **Given** the review window calculation requires a completion timestamp - **When** determining which field to use - **Then** select either `completedAt` or `serviceCompletedAt` as the authoritative source based on business rules
- **Given** the authoritative timestamp is determined - **When** updating review service code - **Then** all review window validations use only the selected timestamp field with no fallbacks

### Non-Functional Requirements

- **Consistency**: All review-related code uses the same completion timestamp field
- **Reliability**: Review window calculations accurately reflect the intended business logic (service completion vs booking status completion)
- **Maintainability**: Clear documentation explains the purpose of each timestamp field and which should be used for different purposes

## User Experience Flow

1. Developer reviews the bookings schema and identifies both completion timestamp fields
2. Developer analyzes existing usage patterns across the codebase (API, mobile, database)
3. Developer determines which timestamp represents the authoritative completion date for review eligibility
4. Developer updates reviewService, bookingUtils, and BookingDetailScreen to use the selected field consistently
5. Developer documents the decision and updates code comments to clarify field usage

## Technical Context

- **Epic Integration**: Part of the review system feature set; ensures data integrity for review submission
- **System Components**: Review service (API), booking utilities (mobile), booking detail screen (mobile), database schema
- **Data Requirements**: Bookings table contains both `completedAt` and `serviceCompletedAt` fields; need to determine which is used for review window
- **Integration Points**: Affects reviewService.submitReview (API), bookingUtils.canLeaveReview (mobile), BookingDetailScreen review button logic (mobile)

## Definition of Done

- [ ] Code audit completed documenting current usage of both timestamp fields
- [ ] Business decision made on which field is authoritative for review windows
- [ ] reviewService.submitReview updated to use only the authoritative field
- [ ] bookingUtils.canLeaveReview updated to use only the authoritative field
- [ ] BookingDetailScreen updated to use only the authoritative field
- [ ] All fallback chains (|| createdAt, || scheduledEndTime) removed
- [ ] Code comments added explaining the purpose of each timestamp field
- [ ] Documentation updated with the timestamp standardization decision
- [ ] Existing tests updated to reflect the new validation logic
- [ ] Code reviewed and approved

## Notes

This issue was identified during bug analysis of the submit-customer-review feature branch. The current implementation uses `completedAt || createdAt || new Date()` which has multiple problematic fallbacks. The `serviceCompletedAt` field exists in the schema but is not currently used in the review window logic, suggesting a potential gap between intended and actual behavior.

**Related Bug Analysis**: [bug-analysis-3.md](../../review/reviews/bug-analysis-3.md) - Enhancement issue at packages/api/src/services/reviewService.ts:33-78
