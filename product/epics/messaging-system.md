# Messaging System

**Category**: Backend Services

**Priority**: High

**Status**: ⏳ Not Started

**Dependencies**:

- [Booking System](./booking-system.md)
- [Notification System](./notification-system.md)

**Estimated Effort**: Medium (3-5 sprints)

## Description

This epic implements the real-time communication layer between customers and artists. Direct messaging is essential for clarifying service details, sharing reference images, and coordinating logistics (e.g., exact location, arrival time). It keeps the communication within the platform, enhancing safety and trust.

## Key Components

- **Real-time Chat**: Socket.io based messaging for instant delivery.
- **Media Sharing**: Ability to send photos (e.g., "I want this hair style").
- **Context Awareness**: Chats linked to specific bookings for easy reference.
- **Offline Support**: Message persistence and retrieval when back online.
- **Safety Tools**: Keyword filtering and ability to report abusive messages.

## Acceptance Criteria

- [ ] Users can send and receive text messages in real-time.
- [ ] Users can upload and send images within the chat.
- [ ] Users receive push notifications for new messages when the app is backgrounded.
- [ ] Chat history is preserved and loaded correctly on new devices.
- [ ] System messages (e.g., "Booking Confirmed") appear in the chat stream.
- [ ] Users can block other users.

## Technical Requirements

- **WebSocket**: Socket.io for event-based communication.
- **Database**: MongoDB or PostgreSQL (with partitioning) for storing message history.
- **Scalability**: Redis adapter for scaling WebSocket servers horizontally.
- **Privacy**: End-to-end encryption is NOT required for MVP, but transport layer security (TLS) is mandatory.

## User Stories (Examples)

- As a customer, I want to send a photo of my dress so the makeup artist can match the look.
- As an artist, I want to tell the customer I'm 5 minutes late due to traffic.
- As a customer, I want to ask if the artist has a specific brand of foundation.

## Risks and Assumptions

- **Risk**: High volume of messages can strain the database.
- **Assumption**: Users will prefer in-app chat over exchanging personal phone numbers.

## Notes

- Consider implementing "read receipts" (optional for MVP).
- Need a policy for data retention (e.g., keep messages for 1 year).
