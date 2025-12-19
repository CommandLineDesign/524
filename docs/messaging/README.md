# Messaging System Documentation

## Overview

The 524 Beauty Marketplace messaging system enables real-time communication between customers and artists, following an Airbnb-style UX pattern where conversations persist across multiple bookings. The system provides instant messaging, image sharing, offline support, and admin oversight capabilities.

## Architecture

### Key Components

- **Real-time Communication**: Socket.io-based WebSocket connections
- **Persistent Conversations**: One conversation per artist-customer pair
- **Offline Resilience**: AsyncStorage-based message queue
- **Media Support**: S3-backed image sharing with compression
- **Admin Oversight**: Read-only chat viewer with audit logging
- **System Integration**: Automatic booking status notifications

### Technology Stack

- **Frontend**: React Native with react-native-gifted-chat
- **Backend**: Node.js/Express with Socket.io
- **Database**: PostgreSQL with Drizzle ORM
- **File Storage**: AWS S3 with signed URLs
- **Caching**: Redis (for future scaling)
- **Authentication**: JWT with role-based access

## Quick Start

### Prerequisites

1. PostgreSQL database with messaging tables
2. Redis instance (optional, for scaling)
3. AWS S3 bucket configured
4. JWT secret configured

### Installation

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm --filter @524/database db:migrate

# Start development servers
pnpm --filter @524/api dev
pnpm --filter @524/mobile start
```

### Basic Usage

```typescript
// Send a message
import { useSendMessage } from '../query/messaging';

const sendMessage = useSendMessage();
await sendMessage.mutateAsync({
  conversationId: 'conv-123',
  messageType: 'text',
  content: 'Hello!',
});
```

## Documentation Index

- **[Architecture](./architecture.md)** - System design and data flow
- **[API Reference](./api.md)** - REST and WebSocket API documentation
- **[Mobile Implementation](./mobile.md)** - React Native integration guide
- **[Admin Features](./admin.md)** - Admin dashboard and oversight
- **[Offline Support](./offline.md)** - Offline messaging capabilities
- **[Media Handling](./media.md)** - Image upload and storage
- **[Security](./security.md)** - Authentication and authorization
- **[Testing](./testing.md)** - Test coverage and strategies
- **[Deployment](./deployment.md)** - Production deployment guide
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

## Features

### ✅ Implemented

- Real-time messaging with Socket.io
- Airbnb-style persistent conversations
- Image sharing with S3 storage
- Offline message queuing
- Admin read-only chat viewer
- System messages for booking updates
- Comprehensive test coverage
- Audit logging for admin access

### 🚧 Future Enhancements

- Push notifications (Notification System epic)
- End-to-end encryption
- Message reactions and threads
- Voice/video messaging
- Advanced moderation tools

## Integration Points

### Booking System
- Automatic conversation creation from booking screens
- **Conversation reuse**: One persistent conversation per artist-customer pair (Airbnb-style)
- Clicking "Message" from any booking navigates to the existing conversation if one exists
- System messages for booking status changes
- Booking context in chat messages

### User Authentication
- JWT-based WebSocket authentication
- Role-based conversation access
- Session management and invalidation

### Admin Dashboard
- Complete chat visibility for dispute resolution
- Audit trails for compliance
- Search and filtering capabilities

## Performance Considerations

- Message pagination (50 messages per page)
- WebSocket connection pooling
- S3 CDN for media delivery
- Database indexing for fast queries
- Offline queue management

## Monitoring

- WebSocket connection metrics
- Message delivery success rates
- Image upload performance
- Admin access logging
- Error tracking and alerting

## Support

For technical support or questions about the messaging system:

1. Check the [troubleshooting guide](./troubleshooting.md)
2. Review the [API documentation](./api.md)
3. Check existing issues in the project repository
4. Contact the development team

---

*This documentation covers the messaging system implementation completed in Sprint 1-5 of the messaging epic.*

