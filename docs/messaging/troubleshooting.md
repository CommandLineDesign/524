# Troubleshooting Guide

## Overview

This guide provides solutions to common issues encountered with the messaging system, organized by component and symptom.

## WebSocket Issues

### Connection Failures

**Symptom**: WebSocket connection fails to establish

**Possible Causes**:

1. **Invalid JWT Token**
   ```bash
   # Check token validity
   curl -H "Authorization: Bearer <token>" https://api.524beauty.com/auth/verify

   # Decode JWT to check expiration
   node -e "const jwt = require('jsonwebtoken'); console.log(jwt.decode('<token>'))"
   ```

2. **CORS Configuration**
   ```bash
   # Test CORS headers
   curl -H "Origin: https://app.524beauty.com" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        https://api.524beauty.com/messaging/conversations
   ```

3. **Network Issues**
   ```bash
   # Check if WebSocket port is accessible
   telnet api.524beauty.com 5240

   # Test WebSocket handshake
   wscat -c wss://api.524beauty.com
   ```

**Solutions**:

```typescript
// Client-side reconnection logic
const socket = io(WS_URL, {
  auth: { token: getValidToken() },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Handle connection errors
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);

  switch (error.message) {
    case 'Authentication token required':
      refreshToken();
      break;
    case 'Invalid token':
      logoutUser();
      break;
    default:
      showNetworkError();
  }
});
```

### Message Delivery Issues

**Symptom**: Messages are sent but not received

**Debug Steps**:

1. **Check Conversation Access**
   ```sql
   -- Verify user has access to conversation
   SELECT c.id, c.customer_id, c.artist_id
   FROM conversations c
   WHERE c.id = 'conversation-id'
   AND (c.customer_id = 'user-id' OR c.artist_id = 'user-id');
   ```

2. **Verify WebSocket Room Membership**
   ```bash
   # Check server logs for room joining
   grep "Joined conversation room" /var/log/messaging.log
   ```

3. **Test Message Broadcasting**
   ```javascript
   // Test from browser console
   socket.emit('join:conversation', 'conversation-id');
   socket.emit('message:send', {
     conversationId: 'conversation-id',
     messageType: 'text',
     content: 'Test message'
   });
   ```

**Solutions**:

```typescript
// Ensure room joining before sending messages
useEffect(() => {
  if (socket && conversationId) {
    socket.emit('join:conversation', conversationId);

    socket.on('conversation:joined', () => {
      console.log('Successfully joined conversation');
    });

    socket.on('error', (error) => {
      console.error('Conversation join failed:', error);
    });
  }
}, [socket, conversationId]);
```

## Database Issues

### Connection Problems

**Symptom**: Database connection errors

**Debug Steps**:

```bash
# Test database connectivity
psql "$DATABASE_URL" -c "SELECT 1"

# Check connection pool status
curl http://localhost:5240/health

# Monitor active connections
psql "$DATABASE_URL" -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'your_db'"
```

**Solutions**:

```typescript
// Connection pool configuration
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  retry: {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000,
  },
});

// Handle connection errors
pool.on('error', (err) => {
  logger.error('Unexpected database error:', err);
  process.exit(1);
});
```

### Slow Queries

**Symptom**: Message loading is slow

**Debug Steps**:

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT m.*, c.customer_id, c.artist_id
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE m.conversation_id = 'conversation-id'
ORDER BY m.sent_at DESC
LIMIT 50;

-- Check index usage
SELECT * FROM pg_stat_user_indexes
WHERE relname IN ('messages', 'conversations');
```

**Solutions**:

```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_messages_conversation_sent_at
ON messages(conversation_id, sent_at DESC);

-- Optimize query
SELECT m.id, m.content, m.sent_at, m.sender_id, m.sender_role
FROM messages m
WHERE m.conversation_id = $1
ORDER BY m.sent_at DESC
LIMIT $2
OFFSET $3;
```

### Data Consistency Issues

**Symptom**: Unread counts don't match actual messages

**Debug Steps**:

```sql
-- Check unread count calculation
SELECT
  c.unread_count_customer,
  c.unread_count_artist,
  COUNT(m.id) as actual_unread_customer,
  COUNT(m2.id) as actual_unread_artist
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
  AND m.sender_id != c.customer_id
  AND m.read_at IS NULL
LEFT JOIN messages m2 ON c.id = m2.conversation_id
  AND m2.sender_id != c.artist_id
  AND m2.read_at IS NULL
WHERE c.id = 'conversation-id'
GROUP BY c.id, c.unread_count_customer, c.unread_count_artist;
```

**Solutions**:

```typescript
// Recalculate unread counts
async function recalculateUnreadCounts(conversationId: string) {
  const conversation = await conversationRepo.getConversation(conversationId);

  const [customerUnread, artistUnread] = await Promise.all([
    messageRepo.getUnreadCount(conversationId, conversation.customerId, 'customer'),
    messageRepo.getUnreadCount(conversationId, conversation.artistId, 'artist'),
  ]);

  await conversationRepo.updateUnreadCounts(conversationId, customerUnread, artistUnread);
}
```

## Mobile App Issues

### Offline Queue Problems

**Symptom**: Messages not sending when back online

**Debug Steps**:

```typescript
// Check offline queue status
import { OfflineMessageQueue } from '../services/offlineMessageQueue';

const queue = OfflineMessageQueue.getInstance();
const stats = await queue.getQueueStats();
console.log('Queue stats:', stats);

// View queued messages
const messages = await queue.getQueue();
console.table(messages);
```

**Solutions**:

```typescript
// Enhanced offline queue processor
export function useOfflineQueueProcessor() {
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;

    const processQueue = async () => {
      try {
        await offlineQueue.processQueue(async (message) => {
          await sendMessageMutation.mutateAsync(message);
        });
      } catch (error) {
        console.error('Queue processing failed:', error);
        // Retry after delay
        retryTimeout = setTimeout(processQueue, 30000);
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        processQueue();
      }
    });

    return () => {
      unsubscribe();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);
}
```

### Image Upload Failures

**Symptom**: Images fail to upload

**Debug Steps**:

```typescript
// Test S3 upload URL generation
const response = await apiClient.post('/messaging/upload-image', {
  fileName: 'test.jpg',
  fileType: 'image/jpeg',
  conversationId: 'conv-1',
});

console.log('Upload URL:', response.data.uploadUrl);

// Test actual upload
const uploadResponse = await fetch(response.data.uploadUrl, {
  method: 'PUT',
  body: imageBlob,
  headers: { 'Content-Type': 'image/jpeg' },
});

console.log('Upload status:', uploadResponse.status);
```

**Solutions**:

```typescript
// Enhanced image upload with retry logic
async function uploadImageWithRetry(imageUri: string, conversationId: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await processAndUploadImage(imageUri, conversationId);
      return result;
    } catch (error) {
      console.warn(`Upload attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw new Error(`Image upload failed after ${maxRetries} attempts`);
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
```

## API Issues

### Rate Limiting

**Symptom**: Getting 429 Too Many Requests errors

**Debug Steps**:

```bash
# Check current rate limit status
curl -H "Authorization: Bearer <token>" \
     -v http://localhost:5240/messaging/conversations

# Headers to check:
# X-RateLimit-Limit: 60
# X-RateLimit-Remaining: 59
# X-RateLimit-Reset: 1640995200
```

**Solutions**:

```typescript
// Implement client-side rate limiting
class RateLimiter {
  private requests = new Map<string, number[]>();

  canMakeRequest(endpoint: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    const requestTimes = this.requests.get(endpoint) || [];
    const recentRequests = requestTimes.filter(time => time > windowStart);

    if (recentRequests.length >= limit) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(endpoint, recentRequests);

    return true;
  }
}
```

### Authentication Failures

**Symptom**: 401 Unauthorized errors

**Debug Steps**:

```typescript
// Check token validity
const token = await getStoredToken();
console.log('Token:', token);

try {
  const decoded = jwt.decode(token);
  console.log('Decoded:', decoded);

  if (decoded.exp < Date.now() / 1000) {
    console.log('Token expired');
  }
} catch (error) {
  console.error('Invalid token format');
}

// Test API with token
curl -H "Authorization: Bearer ${token}" \
     http://localhost:5240/messaging/conversations
```

**Solutions**:

```typescript
// Enhanced token management
class TokenManager {
  async getValidToken(): Promise<string> {
    const stored = await getStoredToken();

    if (!stored) {
      throw new Error('No token available');
    }

    try {
      const decoded = jwt.decode(stored) as any;

      // Refresh if expiring soon (5 minutes)
      if (decoded.exp < (Date.now() / 1000) + 300) {
        const newToken = await refreshToken(stored);
        await storeToken(newToken);
        return newToken;
      }

      return stored;
    } catch (error) {
      await clearStoredToken();
      throw new Error('Invalid token');
    }
  }
}
```

## Performance Issues

### High Latency

**Symptom**: Slow message loading or sending

**Debug Steps**:

```bash
# Measure API response time
curl -o /dev/null -s -w "%{time_total}\n" \
     -H "Authorization: Bearer <token>" \
     http://localhost:5240/messaging/conversations

# Check database query performance
psql "$DATABASE_URL" -c "SELECT * FROM pg_stat_activity WHERE state = 'active'"

# Monitor Redis performance
redis-cli ping
redis-cli info stats
```

**Solutions**:

```typescript
// Implement response caching
const conversationCache = new Map();

async function getConversationsCached(userId: string, role: string) {
  const cacheKey = `${userId}-${role}`;
  const cached = conversationCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp) < 30000) { // 30 seconds
    return cached.data;
  }

  const data = await conversationService.getUserConversations(userId, role);
  conversationCache.set(cacheKey, { data, timestamp: Date.now() });

  return data;
}
```

### Memory Leaks

**Symptom**: App memory usage grows over time

**Debug Steps**:

```typescript
// Monitor React Query cache
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
console.log('Cache size:', queryClient.getQueryCache().getAll().length);

// Check for component memory leaks
import { whyDidYouRender } from '@welldone-software/why-did-you-render';
```

**Solutions**:

```typescript
// Clean up queries on navigation
useEffect(() => {
  return () => {
    queryClient.removeQueries(['messages', conversationId]);
    queryClient.removeQueries(['conversation', conversationId]);
  };
}, [conversationId]);

// Limit cache size
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 5, // 5 minutes
      staleTime: 1000 * 60, // 1 minute
    },
  },
});
```

## S3 Upload Issues

### Upload Failures

**Symptom**: Images fail to upload to S3

**Debug Steps**:

```bash
# Test S3 credentials
aws sts get-caller-identity

# Check bucket permissions
aws s3api get-bucket-policy --bucket 524-chat-media

# Test upload manually
curl -X PUT \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg \
  "https://524-chat-media.s3.amazonaws.com/test.jpg"
```

**Solutions**:

```typescript
// Enhanced S3 upload with better error handling
async function uploadToS3WithRetry(signedUrl: string, fileUri: string, contentType: string) {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(signedUrl, {
        method: 'PUT',
        body: await getFileBlob(fileUri),
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'max-age=31536000', // 1 year
        },
      });

      if (!response.ok) {
        throw new Error(`S3 upload failed: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.warn(`S3 upload attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
}
```

## Monitoring and Logs

### Log Analysis

```bash
# Search for specific errors
grep "ERROR.*messaging" /var/log/app.log

# WebSocket connection analysis
grep "Client connected\|Client disconnected" /var/log/app.log | \
  awk '{print $1, $2}' | sort | uniq -c

# Message throughput
grep "Message sent" /var/log/app.log | \
  awk '{print strftime("%Y-%m-%d %H:00", $timestamp)}' | sort | uniq -c
```

### Performance Monitoring

```typescript
// Add performance monitoring
const performanceMonitor = {
  apiCalls: new Map(),

  trackApiCall(endpoint: string, startTime: number, success: boolean) {
    const duration = Date.now() - startTime;
    const key = `${endpoint}-${success ? 'success' : 'error'}`;

    const existing = this.apiCalls.get(key) || { count: 0, totalTime: 0 };
    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;

    this.apiCalls.set(key, existing);
  },

  getMetrics() {
    return Object.fromEntries(this.apiCalls);
  }
};
```

### Health Checks

```bash
# API health check
curl http://localhost:5240/health

# Database health
psql "$DATABASE_URL" -c "SELECT 1"

# Redis health
redis-cli ping

# S3 health
aws s3 ls s3://524-chat-media/ --max-items 1
```

## Emergency Procedures

### Service Outage

1. **Assess Impact**
   ```bash
   # Check service status
   curl -f http://localhost:5240/health || echo "Service down"
   ```

2. **Check Logs**
   ```bash
   # Recent errors
   tail -100 /var/log/messaging.log | grep ERROR
   ```

3. **Restart Services**
   ```bash
   # Restart application
   docker-compose restart api

   # Check if restart fixed the issue
   curl http://localhost:5240/health
   ```

### Data Recovery

1. **Database Issues**
   ```sql
   -- Check database integrity
   SELECT * FROM pg_stat_database WHERE datname = 'your_db';

   -- Restore from backup if needed
   pg_restore -d your_db /path/to/backup.sql
   ```

2. **Message Recovery**
   ```typescript
   // Reprocess failed messages
   const failedMessages = await queue.getQueue();
   for (const message of failedMessages) {
     if (message.retryCount >= MAX_RETRY_ATTEMPTS) {
       // Reset retry count to allow reprocessing
       await queue.updateQueuedMessage(message.id, { retryCount: 0 });
     }
   }
   ```

### Security Incident Response

1. **Isolate Affected Systems**
2. **Audit Access Logs**
   ```sql
   SELECT * FROM audit_logs
   WHERE created_at >= 'incident_start_time'
   ORDER BY created_at DESC;
   ```
3. **Revoke Compromised Tokens**
4. **Notify Affected Users**
5. **Implement Security Fixes**

This troubleshooting guide should help resolve most issues encountered with the messaging system. For persistent problems, check the application logs and consider reaching out to the development team.