# Implement SNS Authentication

**Role**: Developer
**Priority**: High
**Status**: ⏳ Not Started
**Dependencies**:

- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** Developer  
**I want** to implement actual Naver and Kakao OAuth flows using their respective SDKs  
**So that** users can authenticate using their preferred social login providers

## Detailed Description

Currently, the SNS authentication functions (`loginWithNaver` and `loginWithKakao`) in `packages/mobile/src/services/snsAuth.ts` are placeholder stubs that only display "coming soon" alerts. These functions need to be implemented with actual OAuth flows using the official Naver and Kakao SDKs to enable social login functionality for Korean users.

This implementation is critical for the Korean market where Naver and Kakao are the dominant social platforms. Users expect seamless social login experiences, and the current placeholder implementation prevents users from using these authentication methods.

## Acceptance Criteria

### Functional Requirements

- **Given** a user taps the Naver login button - **When** the authentication flow completes successfully - **Then** the user is logged in and redirected to the appropriate screen
- **Given** a user taps the Kakao login button - **When** the authentication flow completes successfully - **Then** the user is logged in and redirected to the appropriate screen
- **Given** a user initiates SNS login - **When** the OAuth flow is cancelled or fails - **Then** an appropriate error message is displayed and the user remains on the login screen
- **Given** a user successfully authenticates via SNS - **When** the user data is received - **Then** the user account is created or linked appropriately in the backend

### Non-Functional Requirements

- **Performance**: OAuth flow should complete within 5 seconds under normal network conditions
- **Usability**: OAuth flow should follow platform-native patterns (e.g., in-app browser for iOS/Android)
- **Security**: OAuth tokens must be securely stored and transmitted, following OAuth 2.0 best practices
- **Reliability**: Handle network failures, SDK errors, and user cancellations gracefully

## User Experience Flow

1. User taps the Naver or Kakao login button on the login screen
2. System opens the OAuth provider's authentication interface (in-app browser or native SDK flow)
3. User authenticates with their Naver/Kakao credentials
4. Provider redirects back to the app with an authorization code or token
5. System exchanges the code/token with the backend API to create or authenticate the user
6. System updates the auth store with user session information
7. User is redirected to the appropriate screen (home, onboarding, etc.)

## Technical Context

- **Epic Integration**: This story is part of the [Auth System](../product/epics/auth-system.md) epic, which covers authentication and authorization for the platform
- **System Components**: 
  - Mobile app (`packages/mobile/src/services/snsAuth.ts`)
  - Auth store (`packages/mobile/src/store/authStore.ts`)
  - Backend API authentication endpoints
  - Naver SDK and Kakao SDK
- **Data Requirements**: User profile data from OAuth providers (email, name, profile image), OAuth tokens for backend validation
- **Integration Points**: 
  - Backend API must support OAuth token validation and user account creation/linking
  - Auth store must handle SNS authentication state management
  - Login screen must display loading states during OAuth flow

## Definition of Done

- [ ] Functional requirements implemented and tested
- [ ] Naver SDK integrated and configured
- [ ] Kakao SDK integrated and configured
- [ ] OAuth flows tested on both iOS and Android
- [ ] Error handling implemented for all failure scenarios
- [ ] Loading states displayed during authentication
- [ ] Backend API integration verified
- [ ] User account creation/linking logic implemented
- [ ] Code reviewed and approved
- [ ] Documentation updated with SDK setup instructions

## Notes

- Current placeholder implementation shows alerts in Korean: "네이버 로그인 기능은 곧 제공될 예정입니다" and "카카오 로그인 기능은 곧 제공될 예정입니다"
- Need to obtain developer credentials and configure OAuth apps with Naver and Kakao
- Consider implementing Apple Sign-In for iOS users as well (mentioned in epic but not in current review)
- Ensure compliance with PIPA (Personal Information Protection Act) for handling user data from OAuth providers

