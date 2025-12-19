# Implement Sliding Window Rate Limiting for WebSocket

**Role**: Developer | System
**Priority**: Low
**Status**: 📋 Backlog
**Dependencies**:

- None

**Estimated Effort**: M (3-5 days)

## Story Statement

**As a** System
**I want** to implement sophisticated sliding window rate limiting with Redis backing for WebSocket message handling
**So that** rate limiting is more accurate and can scale across distributed server instances

## Detailed Description

The current WebSocket rate limiting implementation uses a simple token bucket or fixed window algorithm that operates in-memory on a single server instance. While this provides basic protection against message spam, it has limitations: fixed windows can allow burst traffic at window boundaries, in-memory state is lost on server restart, and rate limits cannot be enforced consistently across multiple server instances in a distributed deployment. Implementing a sliding window algorithm with Redis backing will provide more accurate rate limiting, persistence across restarts, and the ability to enforce limits consistently in a distributed environment.

## Acceptance Criteria

### Functional Requirements

- **Given** a user sends messages via WebSocket - **When** messages are sent within rate limits - **Then** all messages are processed successfully
- **Given** a user exceeds the rate limit - **When** additional messages are sent - **Then** messages are rejected with appropriate error codes
- **Given** multiple server instances are running - **When** a user connects to different instances - **Then** rate limits are enforced consistently across instances
- **Given** a server restarts - **When** users reconnect - **Then** their previous rate limit state is preserved from Redis
- **Given** rate limit windows are sliding - **When** time progresses - **Then** old message counts expire gradually rather than resetting at fixed intervals

### Non-Functional Requirements

- **Performance**: Rate limit checks should complete within 10ms including Redis lookup
- **Scalability**: Solution must support horizontal scaling with multiple server instances
- **Reliability**: Redis connection failures should fall back to in-memory rate limiting
- **Maintainability**: Rate limit configuration should be easily adjustable via environment variables

## User Experience Flow

1. User sends a message through WebSocket connection
2. System checks Redis for user's message count in the sliding window
3. If within limits, system increments counter in Redis and processes message
4. If exceeded, system rejects message and returns rate limit error
5. System automatically removes expired entries from sliding window
6. User experiences consistent rate limiting regardless of which server handles their connection

## Technical Context

- **Epic Integration**: Part of the messaging system scalability and security epic, enabling reliable multi-instance deployment
- **System Components**: WebSocket server (Socket.IO), Redis cluster, rate limiting middleware, chatSocket connection handlers
- **Data Requirements**: Per-user message timestamps stored in Redis sorted sets, rate limit configuration (messages per window, window duration)
- **Integration Points**: Integrates with existing chatSocket.ts rate limiting logic, requires Redis connection management, impacts WebSocket message handling pipeline

## Definition of Done

- [ ] Sliding window rate limiting algorithm implemented using Redis sorted sets
- [ ] Rate limit configuration externalized to environment variables
- [ ] Fallback to in-memory rate limiting on Redis connection failure
- [ ] Consistent rate limiting verified across multiple server instances
- [ ] Performance benchmarks meet <10ms per check requirement
- [ ] Redis connection pooling and error handling implemented
- [ ] Monitoring and alerting added for rate limit metrics
- [ ] Documentation updated with new rate limiting behavior
- [ ] Load testing completed with distributed setup
- [ ] Code reviewed and approved

## Technical Implementation

### Sliding Window Algorithm with Redis

Use Redis sorted sets to store message timestamps:
- Key: `ratelimit:user:{userId}`
- Score: Unix timestamp of message
- Member: Unique message identifier

Algorithm:
1. Remove entries older than window duration using ZREMRANGEBYSCORE
2. Count remaining entries using ZCARD
3. If count < limit, add new entry using ZADD with current timestamp
4. Set TTL on key to window duration + buffer

### Configuration

```typescript
interface RateLimitConfig {
  messagesPerWindow: number; // e.g., 10
  windowDurationMs: number;   // e.g., 60000 (1 minute)
  redisKeyPrefix: string;     // e.g., 'ratelimit:user:'
  fallbackToMemory: boolean;  // true
}
```

### Redis Commands

Use Redis pipeline for atomic operations:
```
MULTI
ZREMRANGEBYSCORE key 0 (now - window)
ZCARD key
ZADD key now messageId
EXPIRE key (window + buffer)
EXEC
```

## Notes

Consider using Redis Lua scripts to make the rate limit check atomic and reduce round trips. The implementation should gracefully handle Redis unavailability by falling back to the current in-memory implementation. Monitor Redis memory usage as sorted sets can grow large with high traffic. Consider implementing different rate limit tiers for different user types or subscription levels.
