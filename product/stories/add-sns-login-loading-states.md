# Add SNS Login Loading States

**Epic**: [Auth System](../epics/auth-system.md)
**Role**: Developer
**Priority**: Low
**Status**: 📋 Backlog
**Dependencies**:

- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** User  
**I want** to see loading indicators when using SNS login  
**So that** I understand when my login attempt is being processed

## Detailed Description

Currently, SNS login buttons are disabled during email login loading states, but there's no visual feedback when SNS authentication itself is in progress. Users may be confused about whether their SNS login tap was registered or if the authentication is processing. Adding proper loading states will improve the user experience and provide clear feedback during the authentication process.

## Acceptance Criteria

### Functional Requirements

- **Given** user taps Naver login button - **When** Naver authentication is in progress - **Then** Naver button shows loading spinner and is disabled
- **Given** user taps Kakao login button - **When** Kakao authentication is in progress - **Then** Kakao button shows loading spinner and is disabled
- **Given** SNS authentication fails - **When** error occurs - **Then** loading state is cleared and error message is shown
- **Given** SNS authentication succeeds - **When** login completes - **Then** loading state is cleared and user is navigated

### Non-Functional Requirements

- **Performance**: Loading indicators appear within 100ms of authentication start
- **Usability**: Loading states are visually distinct from disabled states
- **Reliability**: Loading states are properly cleared on both success and failure

## User Experience Flow

1. User taps SNS login button (Naver or Kakao)
2. Button immediately shows loading spinner and becomes disabled
3. Authentication process begins in background
4. If authentication succeeds, loading clears and user proceeds to app
5. If authentication fails, loading clears and error message appears

## Technical Context

- **Epic Integration**: Enhances the social login experience in the auth system
- **System Components**: Login screen SNS buttons, auth store, SNS auth service
- **Data Requirements**: Authentication loading states for each SNS provider
- **Integration Points**: Auth store loading state management, SNS auth error handling

## Definition of Done

- [ ] Naver login button shows loading state during authentication
- [ ] Kakao login button shows loading state during authentication
- [ ] Loading states are cleared on authentication completion
- [ ] Loading states are cleared on authentication failure
- [ ] Error handling maintains proper loading state cleanup
- [ ] Unit tests added for loading state behavior
- [ ] Integration tests verify loading states with auth store

## Notes

Current implementation disables SNS buttons during email login loading but doesn't provide feedback during SNS authentication itself. This enhancement requires updating the auth store to support SNS-specific loading states or implementing local loading state management in the login screen.
