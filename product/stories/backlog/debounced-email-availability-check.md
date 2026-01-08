# Debounced Email Availability Check

**Role**: Developer
**Priority**: Low
**Status**: ⏳ Not Started
**Dependencies**:

- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** Developer
**I want** to implement debounced real-time email availability validation
**So that** users get instant feedback on email availability without waiting for form submission

## Detailed Description

Currently, the ArtistSignupScreen only checks email availability when the user submits the form. This adds latency to the signup flow and can frustrate users who discover their email is taken only after completing all form fields.

Implementing debounced validation would:
- Check email availability as the user types (after 300-500ms of no typing)
- Show inline validation state (loading, available, unavailable)
- Reduce form submission failures due to duplicate emails
- Improve perceived responsiveness of the signup flow

## Acceptance Criteria

### Functional Requirements

- **Given** user is typing email - **When** 400ms passes without new input - **Then** checkAvailability API is called
- **Given** availability check is in progress - **When** user types again - **Then** previous request is cancelled/debounced
- **Given** email is unavailable - **When** check completes - **Then** inline error appears immediately
- **Given** email is available - **When** check completes - **Then** success indicator appears (e.g., checkmark)

### Non-Functional Requirements

- **Performance**: Debounce prevents excessive API calls (max 1 call per 400ms of idle time)
- **Usability**: Clear visual feedback during and after validation
- **Security**: No change to security posture
- **Reliability**: Graceful handling of network errors during validation

## User Experience Flow

1. User enters email in ArtistSignupScreen
2. System shows typing indicator after first character
3. User stops typing for 400ms
4. System shows loading indicator and calls checkAvailability
5. System displays result (green check for available, red error for taken)
6. User can proceed to fill other fields while seeing validation result

## Technical Context

- **Epic Integration**: Artist onboarding UX improvements
- **System Components**: `packages/mobile/src/screens/ArtistSignupScreen.tsx`, `packages/mobile/src/api/client.ts`
- **Data Requirements**: Uses existing checkAvailability API endpoint
- **Integration Points**: May reuse pattern for other availability checks (username, phone)

## Definition of Done

- [ ] Debounce utility or hook implemented (or existing library used)
- [ ] handleEmailChange updated to trigger debounced availability check
- [ ] Loading state shown during availability check
- [ ] Success/error state shown after check completes
- [ ] Form submission still validates if user submits before debounce fires
- [ ] Network errors handled gracefully with retry option
- [ ] Unit tests for debounce behavior
- [ ] Code reviewed and approved

## Notes

Originated from code review [code-review-1.md](../reviews/code-review-1.md). Low priority enhancement that improves UX but is not blocking for MVP.
