# Implement Refresh Token Absolute Expiry

**Epic**: [Auth System](../epics/auth-system.md)
**Role**: Developer
**Priority**: Medium
**Status**: 📋 Backlog
**Dependencies**:

- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Developer  
**I want** to implement refresh token absolute expiry  
**So that** high-security scenarios can enforce periodic re-authentication regardless of token rotation

## Detailed Description

Currently, the authentication system implements refresh token rotation where tokens are refreshed indefinitely as long as they're used within their lifetime window. For high-security scenarios, we need the ability to enforce an absolute maximum session lifetime (e.g., 30 days) regardless of how recently the tokens were rotated. This prevents long-lived sessions that could be a security risk if compromised.

This enhancement would add an `absoluteExpiresAt` column to track when a token family was originally created and enforce a maximum session lifetime policy.

## Acceptance Criteria

### Functional Requirements

- **Given** a refresh token family created 31 days ago - **When** user attempts to refresh tokens - **Then** refresh fails with appropriate error code
- **Given** a refresh token within its normal expiry window - **When** absolute expiry time has passed - **Then** refresh is denied
- **Given** admin configuration for maximum session lifetime - **When** tokens are created - **Then** absolute expiry is calculated and stored

### Non-Functional Requirements

- **Security**: Absolute expiry prevents indefinite session extension
- **Performance**: Minimal overhead added to token validation (< 5ms)
- **Reliability**: Existing token rotation logic continues to work unchanged

## User Experience Flow

1. Developer configures maximum session lifetime in auth service
2. User logs in and receives tokens with absolute expiry timestamp
3. User continues using app normally with token refresh working as before
4. After maximum session lifetime expires, token refresh fails
5. System prompts user to re-authenticate with full login flow

## Technical Context

- **Epic Integration**: Enhances the auth system's security capabilities within the existing token rotation framework
- **System Components**: Auth service, refresh tokens database table, token validation middleware
- **Data Requirements**: New `absoluteExpiresAt` column in refresh_tokens table
- **Integration Points**: Token creation, refresh, and validation logic

## Definition of Done

- [ ] Absolute expiry column added to refresh_tokens schema
- [ ] Token creation logic includes absolute expiry calculation
- [ ] Token validation checks both normal expiry and absolute expiry
- [ ] Error codes distinguish between expired and absolutely expired tokens
- [ ] Unit tests cover absolute expiry scenarios
- [ ] Integration tests validate end-to-end behavior
- [ ] Documentation updated with security enhancement details
- [ ] Code reviewed and approved

## Notes

This enhancement builds on the existing refresh token rotation system without breaking changes. The absolute expiry provides an additional security layer for scenarios requiring strict session lifetime controls.
