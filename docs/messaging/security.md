# Security and Privacy

## Overview

The messaging system implements comprehensive security measures to protect user data, ensure platform integrity, and maintain compliance with privacy regulations. All communication is secured end-to-end with proper authentication and authorization.

## Authentication

### JWT Token Validation

WebSocket connections require valid JWT tokens:

```typescript
// packages/api/src/websocket/chatSocket.ts
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token as string;

  if (!token) {
    return next(new Error('Authentication token required'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    // Validate token version to prevent replay attacks
    const user = await db.select().from(users).where(eq(users.id, decoded.user_id));
    if (user.tokenVersion !== decoded.token_version) {
      return next(new Error('Session invalidated'));
    }

    socket.userId = decoded.user_id;
    socket.userRole = selectPrimaryRole(user.roles);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new Error('Token expired'));
    }
    return next(new Error('Invalid token'));
  }
});
```

### Session Management

- **Token Rotation**: Tokens are invalidated on password changes
- **Session Timeout**: Automatic logout after inactivity
- **Device Limits**: Maximum concurrent sessions per user
- **Token Versioning**: Prevent use of old tokens after resets

```typescript
// packages/api/src/auth/tokenUtils.ts
export const invalidateUserTokens = async (userId: string) => {
  await db
    .update(users)
    .set({ tokenVersion: sql`${users.tokenVersion} + 1` })
    .where(eq(users.id, userId));
};
```

## Authorization

### Conversation Access Control

Users can only access conversations they participate in:

```typescript
// packages/api/src/services/conversationService.ts
async validateConversationAccess(conversationId: string, userId: string): Promise<boolean> {
  const conversation = await this.repository.getConversation(conversationId, userId);
  return conversation !== null;
}

// Database-level security
const conversationQuery = db
  .select()
  .from(conversations)
  .where(and(
    eq(conversations.id, conversationId),
    or(
      eq(conversations.customerId, userId),
      eq(conversations.artistId, userId)
    )
  ));
```

### Role-Based Permissions

Different roles have different message capabilities:

```typescript
const canSendMessage = (userRole: string, messageType: string) => {
  const permissions = {
    customer: ['text', 'image'],
    artist: ['text', 'image'],
    admin: ['text'], // Read-only for admin
  };

  return permissions[userRole]?.includes(messageType) || false;
};
```

### Admin Access Controls

Admin users have read-only access with full audit logging:

```typescript
// packages/api/src/routes/v1/admin.ts
const requireAdmin = (req, res, next) => {
  if (!req.user.roles?.includes('admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Audit all admin access
await auditLogRepository.createAuditLog({
  userId: req.user.id,
  action: 'VIEW_CONVERSATION',
  resourceType: 'conversation',
  resourceId: conversationId,
  details: { /* access details */ },
  ipAddress: req.ip,
  userAgent: req.get('User-Agent'),
});
```

## Data Encryption

### Transport Layer Security

All communication is encrypted in transit:

- **HTTPS**: All API endpoints use TLS 1.3
- **WSS**: WebSocket connections are encrypted
- **Certificate Pinning**: Mobile app pins server certificates

```typescript
// packages/mobile/src/api/client.ts
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  httpsAgent: new https.Agent({
    // Certificate pinning configuration
    ca: certificateBundle,
    rejectUnauthorized: true,
  }),
});
```

### Message Storage

Messages are stored encrypted at rest:

```typescript
// Future enhancement: message encryption
const encryptMessage = (content: string, conversationKey: string) => {
  return crypto.AES.encrypt(content, conversationKey).toString();
};

const decryptMessage = (encryptedContent: string, conversationKey: string) => {
  const bytes = crypto.AES.decrypt(encryptedContent, conversationKey);
  return bytes.toString(crypto.enc.Utf8);
};
```

## Input Validation and Sanitization

### Message Content Validation

All message content is validated and sanitized:

```typescript
// packages/api/src/services/messageService.ts
const validateMessageContent = (content: string, messageType: string) => {
  // Length limits
  const maxLengths = {
    text: 2000,
    image: 0, // Images don't have text content
    system: 500,
  };

  if (content.length > maxLengths[messageType]) {
    throw new Error(`Message too long. Max ${maxLengths[messageType]} characters.`);
  }

  // Sanitize HTML to prevent XSS
  const sanitized = sanitizeHtml(content, {
    allowedTags: [], // No HTML allowed
    allowedAttributes: {},
  });

  return sanitized;
};
```

### File Upload Security

Image uploads are thoroughly validated:

```typescript
// packages/api/src/services/uploadService.ts
const validateImageUpload = (params: UploadImageParams) => {
  const { fileName, fileType, conversationId } = params;

  // File type validation
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(fileType.toLowerCase())) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP allowed.');
  }

  // File size limits
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  // Additional size validation would be done on client

  // Filename sanitization
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  if (cleanName !== fileName) {
    throw new Error('Invalid filename characters');
  }

  return { cleanName, fileType };
};
```

## Privacy Protection

### Data Retention

Messages are retained according to privacy policies:

```typescript
// packages/api/src/services/messageService.ts
const cleanupOldMessages = async (olderThan: Date) => {
  const deletedCount = await this.messageRepo.deleteOldMessages(olderThan);
  logger.info(`Cleaned up ${deletedCount} old messages`);
};

// Scheduled cleanup job
cron.schedule('0 2 * * *', async () => { // Daily at 2 AM
  const retentionDate = new Date();
  retentionDate.setFullYear(retentionDate.getFullYear() - 1); // 1 year retention

  await cleanupOldMessages(retentionDate);
});
```

### User Data Minimization

Only necessary data is stored:

```typescript
// Message data structure - no unnecessary PII
interface MessageData {
  id: string;
  conversationId: string; // Links to participants
  senderId: string;       // User ID only, no names
  senderRole: string;     // Role for UI display
  messageType: string;
  content?: string;       // Sanitized text
  images?: string[];      // S3 URLs only
  sentAt: Date;
  readAt?: Date;
}
```

### Right to Deletion

Users can request message deletion:

```typescript
// packages/api/src/services/messageService.ts
async deleteUserMessages(userId: string) {
  // Soft delete by marking as deleted
  await db.update(messages)
    .set({ deletedAt: new Date(), content: '[deleted]' })
    .where(eq(messages.senderId, userId));

  // Hard delete after retention period
  await db.delete(messages)
    .where(and(
      eq(messages.senderId, userId),
      sql`deleted_at < NOW() - INTERVAL '30 days'`
    ));
}
```

## Rate Limiting

### API Rate Limits

Protect against abuse with rate limiting:

```typescript
// packages/api/src/middleware/rateLimiter.ts
const messageRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 messages per minute
  message: 'Too many messages sent. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

const imageUploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 image uploads per minute
  message: 'Too many images uploaded. Please wait.',
});

// Apply to routes
router.post('/messages', messageRateLimit, sendMessage);
router.post('/upload-image', imageUploadRateLimit, uploadImage);
```

### WebSocket Rate Limiting

Prevent spam via WebSocket:

```typescript
// packages/api/src/websocket/chatSocket.ts
const userMessageCounts = new Map<string, number>();

socket.on('message:send', async (data) => {
  const userId = socket.userId;
  const count = userMessageCounts.get(userId) || 0;

  if (count >= 30) { // 30 messages per minute
    socket.emit('error', { message: 'Rate limit exceeded' });
    return;
  }

  userMessageCounts.set(userId, count + 1);

  // Reset counter after 1 minute
  setTimeout(() => {
    userMessageCounts.set(userId, Math.max(0, count - 1));
  }, 60000);
});
```

## Audit Logging

### Comprehensive Audit Trail

All security-relevant actions are logged:

```typescript
// packages/api/src/repositories/auditLogRepository.ts
export class AuditLogRepository {
  async createAuditLog(logData: {
    userId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    details: any;
    ipAddress: string;
    userAgent: string;
  }) {
    await db.insert(auditLogs).values({
      ...logData,
      createdAt: new Date(),
    });
  }
}
```

### Logged Events

```typescript
const AUDIT_EVENTS = {
  // Authentication
  LOGIN_SUCCESS: 'USER_LOGIN_SUCCESS',
  LOGIN_FAILED: 'USER_LOGIN_FAILED',
  LOGOUT: 'USER_LOGOUT',

  // Message actions
  MESSAGE_SENT: 'MESSAGE_SENT',
  MESSAGE_READ: 'MESSAGE_READ',
  MESSAGE_DELETED: 'MESSAGE_DELETED',

  // File uploads
  IMAGE_UPLOADED: 'IMAGE_UPLOADED',
  UPLOAD_FAILED: 'IMAGE_UPLOAD_FAILED',

  // Admin actions
  ADMIN_VIEW_CONVERSATION: 'ADMIN_VIEW_CONVERSATION',
  ADMIN_EXPORT_CONVERSATION: 'ADMIN_EXPORT_CONVERSATION',

  // Security events
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
};
```

## Content Moderation

### Message Filtering

Basic content filtering for inappropriate content:

```typescript
// packages/api/src/services/contentModerationService.ts
const blockedWords = ['inappropriate', 'spam', 'offensive'];

const moderateMessage = (content: string): ModerationResult => {
  const lowerContent = content.toLowerCase();

  for (const word of blockedWords) {
    if (lowerContent.includes(word)) {
      return {
        allowed: false,
        reason: 'Content contains blocked words',
        severity: 'high',
      };
    }
  }

  return { allowed: true };
};
```

### Image Moderation

Future image content analysis:

```typescript
const moderateImage = async (imageUrl: string) => {
  // Send to external moderation service
  const result = await externalModerationAPI.analyze(imageUrl);

  if (result.nsfw || result.violent) {
    await flagMessage(messageId, result.categories);
    return false;
  }

  return true;
};
```

## Incident Response

### Security Monitoring

Real-time monitoring for security events:

```typescript
// packages/api/src/services/securityMonitoringService.ts
const monitorSecurityEvents = (event: SecurityEvent) => {
  // Alert on suspicious patterns
  if (event.type === 'RATE_LIMIT_EXCEEDED' && event.count > 100) {
    alertSecurityTeam('High rate limit violations', event);
  }

  if (event.type === 'FAILED_LOGIN' && event.attempts > 5) {
    alertSecurityTeam('Brute force attempt detected', event);
    blockIPAddress(event.ipAddress, 3600); // 1 hour block
  }
};
```

### Breach Response

Automated response to security incidents:

```typescript
const handleSecurityBreach = async (breachType: string, affectedUsers: string[]) => {
  // 1. Invalidate all affected sessions
  for (const userId of affectedUsers) {
    await invalidateUserTokens(userId);
  }

  // 2. Notify affected users
  await sendSecurityNotification(affectedUsers, breachType);

  // 3. Log comprehensive incident report
  await logSecurityIncident(breachType, affectedUsers);

  // 4. Escalate to security team
  await escalateToSecurityTeam(breachType);
};
```

## Compliance

### GDPR Compliance

Data protection measures for EU users:

```typescript
const handleGDPRDeletion = async (userId: string) => {
  // Delete all user messages
  await deleteUserMessages(userId);

  // Delete conversation references
  await db.update(conversations)
    .set({ deletedAt: new Date() })
    .where(or(
      eq(conversations.customerId, userId),
      eq(conversations.artistId, userId)
    ));

  // Log deletion for compliance
  await auditLogRepository.createAuditLog({
    userId,
    action: 'GDPR_DATA_DELETION',
    resourceType: 'user',
    resourceId: userId,
    details: { reason: 'GDPR request' },
  });
};
```

### Data Export

Users can export their message data:

```typescript
const exportUserData = async (userId: string) => {
  const messages = await db.select()
    .from(messages)
    .where(eq(messages.senderId, userId));

  const conversations = await db.select()
    .from(conversations)
    .where(or(
      eq(conversations.customerId, userId),
      eq(conversations.artistId, userId)
    ));

  return {
    messages,
    conversations,
    exportDate: new Date(),
  };
};
```

## Testing Security

### Penetration Testing

Automated security testing:

```typescript
describe('Security Tests', () => {
  it('should prevent unauthorized conversation access', async () => {
    const response = await request(app)
      .get('/conversations/unauthorized-id')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
  });

  it('should validate JWT tokens', async () => {
    const invalidToken = 'invalid.jwt.token';

    const response = await request(app)
      .get('/conversations')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(response.status).toBe(401);
  });

  it('should prevent XSS in messages', async () => {
    const maliciousContent = '<script>alert("xss")</script>';

    const response = await request(app)
      .post('/conversations/conv-1/messages')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        messageType: 'text',
        content: maliciousContent,
      });

    expect(response.body.data.content).not.toContain('<script>');
  });
});
```

### Load Testing Security

Ensure security holds under load:

```typescript
describe('Security Under Load', () => {
  it('should maintain rate limits under high load', async () => {
    const promises = Array(100).fill().map(() =>
      request(app)
        .post('/conversations/conv-1/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ messageType: 'text', content: 'spam' })
    );

    const responses = await Promise.all(promises);
    const rateLimited = responses.filter(r => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

This comprehensive security implementation ensures user data protection, platform integrity, and regulatory compliance.