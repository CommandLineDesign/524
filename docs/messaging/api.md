# Messaging API Reference

## Overview

The messaging system provides both REST API endpoints for data operations and WebSocket events for real-time communication. All endpoints require authentication via JWT tokens.

## Base URL
```
https://api.524beauty.com/messaging
```

## Authentication

All requests require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

WebSocket connections require authentication in the handshake:
```javascript
const socket = io(WS_URL, {
  auth: {
    token: jwtToken
  }
});
```

## REST API Endpoints

### Conversations

#### GET /conversations
List user's conversations with pagination.

**Parameters:**
- `limit` (optional): Number of conversations to return (default: 20, max: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv-uuid",
      "bookingId": "booking-uuid",
      "customerId": "user-uuid",
      "artistId": "artist-uuid",
      "status": "active",
      "lastMessageAt": "2024-01-01T10:00:00Z",
      "unreadCountCustomer": 0,
      "unreadCountArtist": 2,
      "archivedAt": null,
      "createdAt": "2024-01-01T09:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z",
      "lastMessage": {
        "content": "Thank you for your service!",
        "messageType": "text",
        "sentAt": "2024-01-01T10:00:00Z"
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": false,
    "total": 1
  }
}
```

#### GET /conversations/:id
Get details of a specific conversation.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv-uuid",
    "bookingId": "booking-uuid",
    "customerId": "user-uuid",
    "artistId": "artist-uuid",
    "status": "active",
    "lastMessageAt": "2024-01-01T10:00:00Z",
    "unreadCountCustomer": 0,
    "unreadCountArtist": 2,
    "archivedAt": null,
    "createdAt": "2024-01-01T09:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

#### POST /conversations
Create or get existing conversation between user and artist.

**Request Body:**
```json
{
  "artistId": "artist-uuid",
  "bookingId": "booking-uuid" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv-uuid",
    "bookingId": "booking-uuid",
    "customerId": "user-uuid",
    "artistId": "artist-uuid",
    "status": "active",
    "lastMessageAt": "2024-01-01T09:00:00Z",
    "unreadCountCustomer": 0,
    "unreadCountArtist": 0,
    "archivedAt": null,
    "createdAt": "2024-01-01T09:00:00Z",
    "updatedAt": "2024-01-01T09:00:00Z"
  }
}
```

#### PUT /conversations/:id/read
Mark all messages in conversation as read.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv-uuid",
    "unreadCountCustomer": 0,
    "unreadCountArtist": 2
  }
}
```

#### POST /conversations/:id/archive
Archive a conversation (soft delete).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv-uuid",
    "archivedAt": "2024-01-01T11:00:00Z"
  }
}
```

### Messages

#### GET /conversations/:id/messages
Get messages for a conversation with pagination.

**Parameters:**
- `limit` (optional): Number of messages to return (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg-uuid",
      "conversationId": "conv-uuid",
      "senderId": "user-uuid",
      "senderRole": "customer",
      "messageType": "text",
      "content": "Hello! Looking forward to the service.",
      "images": null,
      "bookingId": null,
      "sentAt": "2024-01-01T10:00:00Z",
      "readAt": "2024-01-01T10:05:00Z",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

#### POST /conversations/:id/messages
Send a message to a conversation.

**Request Body:**
```json
{
  "messageType": "text",
  "content": "Thank you for the great service!",
  "images": null,
  "bookingId": null
}
```

**Supported Message Types:**
- `text`: Plain text message
- `image`: Message with attached images
- `system`: System-generated message

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "msg-uuid",
    "conversationId": "conv-uuid",
    "senderId": "user-uuid",
    "senderRole": "customer",
    "messageType": "text",
    "content": "Thank you for the great service!",
    "images": null,
    "bookingId": null,
    "sentAt": "2024-01-01T10:00:00Z",
    "readAt": null,
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

#### PUT /messages/:id/read
Mark a specific message as read.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "msg-uuid",
    "readAt": "2024-01-01T10:05:00Z"
  }
}
```

#### GET /messages/unread-count
Get total unread message count for current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 3
  }
}
```

### Image Upload

#### POST /upload-image
Generate signed URL for image upload to S3.

**Request Body:**
```json
{
  "fileName": "chat_image.jpg",
  "fileType": "image/jpeg",
  "conversationId": "conv-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/...",
    "key": "chat/conv-uuid/1234567890_abc123.jpg",
    "publicUrl": "https://cdn.524beauty.com/chat/conv-uuid/1234567890_abc123.jpg"
  }
}
```

### Admin Endpoints

#### GET /admin/conversations
List all conversations (admin only).

**Parameters:**
- `limit` (optional): Number of conversations (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150,
    "hasMore": true
  }
}
```

#### GET /admin/conversations/:id
Get conversation details (admin only).

#### GET /admin/conversations/:id/messages
Get messages for a conversation (admin only).

**Parameters:**
- `limit` (optional): Number of messages (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

## WebSocket Events

### Connection
```javascript
import io from 'socket.io-client';

const socket = io(WS_URL, {
  auth: { token: jwtToken }
});
```

### Client → Server Events

#### join:conversation
Join a conversation room for real-time updates.

```javascript
socket.emit('join:conversation', 'conversation-uuid');
```

**Response:**
```javascript
socket.on('conversation:joined', (data) => {
  console.log('Joined conversation:', data.conversationId);
});
```

#### leave:conversation
Leave a conversation room.

```javascript
socket.emit('leave:conversation', 'conversation-uuid');
```

#### message:send
Send a real-time message.

```javascript
socket.emit('message:send', {
  conversationId: 'conv-uuid',
  messageType: 'text',
  content: 'Hello via WebSocket!',
  bookingId: null
});
```

**Response:**
```javascript
socket.on('message:delivered', (data) => {
  console.log('Message delivered:', data.messageId);
});
```

#### typing:start / typing:stop
Send typing indicators.

```javascript
socket.emit('typing:start', 'conversation-uuid');
socket.emit('typing:stop', 'conversation-uuid');
```

#### message:read
Mark message as read.

```javascript
socket.emit('message:read', {
  messageId: 'msg-uuid',
  conversationId: 'conv-uuid'
});
```

### Server → Client Events

#### message:new
New message received in conversation.

```javascript
socket.on('message:new', (message) => {
  console.log('New message:', message);
  // Message object matches the API response format
});
```

#### message:read
Message marked as read by another user.

```javascript
socket.on('message:read', (data) => {
  console.log('Message read:', data.messageId, 'by', data.readBy);
});
```

#### user:typing
Other user is typing.

```javascript
socket.on('user:typing', (data) => {
  console.log('User typing:', data.userId, data.isTyping);
});
```

## Error Handling

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (access denied)
- `404`: Not Found (conversation/message not found)
- `409`: Conflict (invalid status transition)
- `500`: Internal Server Error

### WebSocket Errors

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
  // Handle authentication, network, or server errors
});
```

### Common Error Messages

- `"Authentication token required"`
- `"Invalid authentication token"`
- `"Access denied to conversation"`
- `"Conversation not found or access denied"`
- `"Invalid messageType. Must be text, image, or system"`
- `"Content is required for text messages"`

## Rate Limiting

- **Conversation listing**: 30 requests per minute
- **Message sending**: 60 requests per minute
- **Image uploads**: 10 requests per minute
- **Admin endpoints**: 120 requests per minute

## Pagination

All list endpoints support pagination with the following parameters:

- `limit`: Number of items per page (varies by endpoint)
- `offset`: Number of items to skip

Response includes pagination metadata:
```json
{
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": true,
    "total": 150
  }
}
```

## Rate Limiting Headers

API responses include rate limiting headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

## SDK Examples

### JavaScript/React Native

```javascript
import io from 'socket.io-client';

// Connect to WebSocket
const socket = io(API_BASE_URL.replace('http', 'ws'), {
  auth: { token: userToken }
});

// Join conversation
socket.emit('join:conversation', conversationId);

// Send message
socket.emit('message:send', {
  conversationId,
  messageType: 'text',
  content: 'Hello!'
});

// Listen for new messages
socket.on('message:new', (message) => {
  updateMessages(message);
});
```

### React Query Hooks

```typescript
import { useConversations, useSendMessage } from '../query/messaging';

// Get conversations
const { data: conversations, isLoading } = useConversations('customer');

// Send message
const sendMessage = useSendMessage();
const handleSend = async (content: string) => {
  await sendMessage.mutateAsync({
    conversationId: 'conv-123',
    messageType: 'text',
    content
  });
};
```

## Testing

### API Testing

```bash
# Get conversations
curl -H "Authorization: Bearer <token>" \
  http://localhost:5240/messaging/conversations

# Send message
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"messageType":"text","content":"Test"}' \
  http://localhost:5240/messaging/conversations/conv-123/messages
```

### WebSocket Testing

```javascript
// In browser console or test file
const socket = io('ws://localhost:5240', {
  auth: { token: 'test-token' }
});

socket.on('connect', () => {
  console.log('Connected!');
});

socket.on('message:new', (msg) => {
  console.log('Received:', msg);
});
```

This API provides a complete messaging solution with real-time capabilities, offline support, and comprehensive admin oversight.
