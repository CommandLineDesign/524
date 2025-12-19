# Make Reviews Hook More Flexible for Different Roles

**Role**: Developer
**Priority**: Low
**Status**: 📋 Backlog
**Dependencies**:

- [View Customer Review History](./view-customer-review-history.md)
- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** Developer
**I want** to refactor the useReviews hook to support both customer and artist roles dynamically
**So that** I can reuse the same hook logic for different user types without code duplication

## Detailed Description

Currently, the `useCustomerReviews` hook hardcodes the role as 'customer' when calling the `getReviews` API function. This creates unnecessary coupling and would require duplicating the entire hook implementation if we later need to show artist reviews in the mobile app. By making the role configurable, we can create a more flexible and reusable hook that supports both customer and artist review fetching with the same infinite query logic, stale time configuration, and error handling patterns.

## Acceptance Criteria

### Functional Requirements

- **Given** the reviews hook needs to fetch customer reviews - **When** `useReviews('customer')` is called - **Then** it returns customer reviews using existing API behavior
- **Given** the reviews hook needs to fetch artist reviews - **When** `useReviews('artist')` is called - **Then** it returns artist reviews using the same query logic
- **Given** role parameter is not provided - **When** hook is called without role - **Then** it defaults to 'customer' role for backward compatibility
- **Given** additional parameters are passed - **When** hook receives limit or other params - **Then** they are properly forwarded to the API call

### Non-Functional Requirements

- **Performance**: No performance regression compared to current implementation
- **Maintainability**: Hook maintains same API surface for existing usage while adding flexibility

## User Experience Flow

This is a developer-facing change with no direct user experience impact:

1. Developer needs to implement artist reviews screen
2. Developer calls `useReviews('artist', { limit: 20 })` instead of creating new hook
3. Hook internally handles role parameter and query key differentiation
4. Existing `useCustomerReviews` hook remains available for backward compatibility or can be deprecated

## Technical Context

- **Epic Integration**: Improves the review system architecture for future extensibility
- **System Components**: React Query hook, API client functions, mobile app query layer
- **Data Requirements**: Same review data structure regardless of role
- **Integration Points**: Existing review API endpoints that already support role-based filtering

## Definition of Done

- [ ] Generic `useReviews` hook created with configurable role parameter
- [ ] Backward compatibility maintained with existing `useCustomerReviews` usage
- [ ] Hook properly handles query key differentiation for different roles
- [ ] TypeScript types updated to support role parameter
- [ ] Unit tests added for new hook functionality
- [ ] Existing tests pass without modification
- [ ] Code reviewed and approved by team

## Notes

Consider whether to keep `useCustomerReviews` as a convenience wrapper that calls `useReviews('customer')` or deprecate it entirely. The hook should maintain the same caching and error handling behavior while adding the role flexibility.
