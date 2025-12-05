# Review System

**Category**: Foundation

**Priority**: Medium

**Status**: ⏳ Not Started

**Dependencies**:

- [Booking System](./booking-system.md)

**Estimated Effort**: Small (1-2 sprints)

## Description

This epic covers the reputation system for the marketplace. Reviews and ratings are the primary trust signal for future customers. The system allows customers to rate their experience after a completed service and artists to respond. It also includes the calculation of aggregate scores and the display of reviews on profiles.

## Key Components

- **Rating Interface**: Star rating (1-5) for multiple dimensions (Quality, Professionalism, Punctuality).
- **Review Submission**: Text and photo feedback.
- **Artist Response**: Ability for artists to reply to reviews publicly.
- **Aggregation Logic**: Calculating average ratings and review counts.
- **Moderation**: Tools for flagging and removing inappropriate content.

## Acceptance Criteria

- [ ] Customers can only leave a review after a "Completed" booking.
- [ ] Reviews must be submitted within X days of service completion.
- [ ] Artists are notified when a new review is posted.
- [ ] Average ratings are updated immediately or eventually consistent.
- [ ] Reviews can include up to 5 photos.

## Technical Requirements

- **Database**: Relational model linking reviews to bookings and users.
- **Images**: Image optimization for review photos.
- **Anti-abuse**: Rate limiting and validation to prevent fake reviews.

## User Stories (Examples)

- As a customer, I want to read reviews from other brides to choose a wedding makeup artist.
- As an artist, I want to reply to a negative review to explain my side of the story.
- As a platform, I want to highlight top-rated artists to reward good service.

## Risks and Assumptions

- **Risk**: Review bombing or malicious reviews.
- **Assumption**: Customers are willing to leave reviews.

## Notes

- Consider "Double-blind" reviews (neither side sees the other's review until both submit) to encourage honesty, though standard flow is fine for MVP.
