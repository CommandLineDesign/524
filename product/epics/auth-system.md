# Auth System

**Category**: Security & Compliance

**Priority**: Critical

**Status**: 📝 In Progress

**Dependencies**:

- [Foundation Setup](./foundation-setup.md)

**Estimated Effort**: Medium (3-5 sprints)

## Description

This epic covers the authentication and authorization system. Both **Customers and Artists can self-signup** using Phone OTP or Social Login. The key difference: new Artist signups start in a "Pending" state and require Admin activation before they can fully operate.

## Key Components

- **Unified Signup**: OAuth (Kakao, Naver, Apple) and Phone Verification for all users.
- **Role Selection**: Users can indicate if they are an Artist during signup.
- **Admin Login**: Secure login for operations staff.
- **Role-Based Access Control (RBAC)**: Pending artists have limited permissions.

## Acceptance Criteria

- [ ] Users can sign up/login using Kakao Talk.
- [ ] Users can sign up/login using Naver.
- [ ] iOS users can sign up/login using Apple Sign-In.
- [ ] Users must verify their phone number to complete registration (if not provided by OAuth).
- [ ] Access tokens are short-lived (e.g., 1h) and refresh tokens are long-lived (e.g., 30d).
- [ ] Protected API endpoints reject requests without valid tokens.
- [ ] Admin endpoints are inaccessible to regular users and artists.

## Technical Requirements

- **Security**: Passwords (if any) must be hashed using Argon2 or bcrypt.
- **Tokens**: JWT signed with secure algorithms (RS256 or HS256).
- **Compliance**: PIPA compliance for handling personal information (phone numbers, names).
- **Performance**: Auth middleware overhead < 10ms.

## User Stories (Examples)

- As a customer, I want to log in with my Kakao account so that I don't have to remember another password.
- As an artist, I want to verify my phone number so that the platform trusts my identity.
- As an admin, I want to ban abusive users so that the community remains safe.

## Risks and Assumptions

- **Risk**: Third-party OAuth providers may change their APIs.
- **Risk**: SMS delivery costs can scale with user growth.
- **Assumption**: We have valid developer accounts for Kakao, Naver, and Apple.

## Notes

- Basic auth structure exists in `packages/api/src/auth`.
- Need to ensure `passport` or similar strategies are fully configured for all providers.
