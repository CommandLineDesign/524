# Artist Onboarding

**Category**: UX & Design

**Priority**: High

**Status**: ⏳ Not Started

**Dependencies**:

- [Auth System](./auth-system.md)

**Estimated Effort**: Medium (3-5 sprints)

## Description

For the Pilot MVP, artists can **self-signup** using the same Phone OTP flow as customers, but their account will start in a "Pending" state. An Admin must review and **activate** the artist before they can accept bookings. The Admin also populates their profile, portfolio, and services during this initial setup phase. This approach reuses the standard auth flow and sets a foundation for a fully self-service onboarding in the future.

## Key Components

- **Artist Self-Signup**: Artists sign up via Phone OTP (same as customers) and indicate they are an artist.
- **Pending Queue**: New artist signups appear in an Admin queue for review.
- **Admin Activation**: Admins activate the artist, enabling them to accept bookings.
- **Profile Population (Admin)**: Admins upload portfolio images and configure services on behalf of artists.

## Acceptance Criteria

- [ ] Artists can sign up via Phone OTP and mark themselves as "Artist".
- [ ] Newly registered artists are flagged as "Pending Activation".
- [ ] Pending artists cannot accept bookings.
- [ ] Admins can view a list of pending artist signups.
- [ ] Admins can populate the artist's profile (bio, specialties, portfolio).
- [ ] Admins can click "Activate" to enable the artist.
- [ ] Activated artists can log in and manage their availability.

## Technical Requirements

- **Storage**: S3 for portfolio images.
- **User Status**: `artist_status` field (e.g., `pending`, `active`, `suspended`).

## User Stories (Examples)

- As an artist, I want to sign up with my phone number so I can join the platform.
- As an admin, I want to see a queue of new artist signups so I can vet them.
- As an admin, I want to upload Sarah's best wedding photos before activating her profile.

## Risks and Assumptions

- **Assumption**: Operations team has the bandwidth to review and activate 50 artists.
- **Risk**: Artists may abandon signup if activation takes too long.

## Notes

- Future: Self-service profile editing and instant activation can be added post-MVP.

