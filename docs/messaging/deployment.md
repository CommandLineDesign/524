# Deployment Guide

## Overview

This guide covers the deployment process for the messaging system, including infrastructure setup, database migrations, and production monitoring.

## Prerequisites

### Infrastructure Requirements

- **Node.js**: Version 20 LTS
- **PostgreSQL**: Version 15+ with PostGIS
- **Redis**: Version 7+ for caching and WebSocket scaling
- **AWS S3**: For image storage
- **CloudFront**: CDN for image delivery (optional but recommended)

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-super-secure-jwt-secret-here

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=524-chat-media

# CORS
CORS_ORIGIN=https://yourapp.com

# WebSocket
WS_URL=wss://yourapp.com
```

## Database Setup

### Initial Schema Creation

```sql
-- Run these migrations in order
-- 0008_add_booking_id_to_messages.sql
-- 0009_add_conversation_indexes.sql
-- 0010_add_conversation_archival.sql

-- Verify tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('conversations', 'messages');
```

### Indexes Verification

```sql
-- Check that all required indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, indexname;
```

Expected indexes:
- `idx_conversations_customer`
- `idx_conversations_artist`
- `idx_conversations_lookup`
- `idx_conversations_active`
- `idx_messages_conversation`
- `idx_messages_booking`

### Data Migration

If migrating from existing data:

```sql
-- Create conversations from existing bookings
INSERT INTO conversations (
  customer_id, artist_id, booking_id, status, last_message_at,
  unread_count_customer, unread_count_artist, created_at, updated_at
)
SELECT DISTINCT
  b.customer_id, b.artist_id, b.id, 'active',
  COALESCE(b.created_at, NOW()), 0, 0, b.created_at, b.updated_at
FROM bookings b
WHERE NOT EXISTS (
  SELECT 1 FROM conversations c
  WHERE c.customer_id = b.customer_id AND c.artist_id = b.artist_id
);
```

## AWS Infrastructure Setup

### S3 Bucket Configuration

```terraform
resource "aws_s3_bucket" "chat_media" {
  bucket = "524-chat-media"

  tags = {
    Environment = "production"
    Service     = "messaging"
  }
}

resource "aws_s3_bucket_public_access_block" "chat_media" {
  bucket = aws_s3_bucket.chat_media.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_cors_configuration" "chat_media" {
  bucket = aws_s3_bucket.chat_media.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST"]
    allowed_origins = ["https://yourapp.com"]
    max_age_seconds = 3000
  }
}
```

### IAM Policy for S3 Access

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::524-chat-media/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::524-chat-media"
    }
  ]
}
```

### CloudFront Distribution (Optional)

```terraform
resource "aws_cloudfront_distribution" "chat_media" {
  origin {
    domain_name = aws_s3_bucket.chat_media.bucket_regional_domain_name
    origin_id   = "S3-chat-media"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = null

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-chat-media"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

## Application Deployment

### Build Process

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Type checking
pnpm typecheck

# Build application
pnpm build

# Run tests
pnpm test

# Database migrations
pnpm --filter @524/database db:migrate
```

### Docker Deployment

```dockerfile
# packages/api/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY pnpm-lock.yaml package.json ./
COPY packages/api/package.json ./packages/api/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy source code
COPY packages/api/src ./packages/api/src
COPY packages/api/tsconfig.json ./packages/api/

# Build application
RUN cd packages/api && pnpm build

# Expose port
EXPOSE 5240

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5240/health || exit 1

# Start application
CMD ["node", "packages/api/dist/index.js"]
```

### Docker Compose for Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: packages/api/Dockerfile
    ports:
      - "5240:5240"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## Production Scaling

### WebSocket Scaling with Redis

```typescript
// packages/api/src/websocket/chatSocket.ts
import { RedisAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ host: 'localhost', port: 6379 });
const subClient = pubClient.duplicate();

io.adapter(new RedisAdapter(pubClient, subClient));
```

### Database Connection Pooling

```typescript
// packages/api/src/config/database.ts
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,        // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// For Drizzle ORM
export const db = drizzle(pool);
```

### Load Balancing

```nginx
# nginx.conf
upstream api_backend {
    ip_hash;  # Sticky sessions for WebSocket
    server api-1:5240;
    server api-2:5240;
    server api-3:5240;
}

server {
    listen 80;
    server_name yourapp.com;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring Setup

### Application Metrics

```typescript
// packages/api/src/middleware/metrics.ts
import { collectDefaultMetrics, register } from 'prom-client';

collectDefaultMetrics();

// Custom metrics
export const messageCounter = new Counter({
  name: 'messages_total',
  help: 'Total number of messages sent',
  labelNames: ['type', 'status'],
});

export const websocketConnections = new Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections',
});

export const conversationCounter = new Counter({
  name: 'conversations_total',
  help: 'Total number of conversations created',
});
```

### Health Checks

```typescript
// packages/api/src/routes/health.ts
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.select().from(users).limit(1);

    // Check Redis connection
    await redis.ping();

    // Check S3 access
    await s3Client.listBuckets();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        redis: 'up',
        s3: 'up',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});
```

### Logging Configuration

```typescript
// packages/api/src/config/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// In production, use a transport
if (process.env.NODE_ENV === 'production') {
  logger.addTransport({
    target: 'pino/file',
    options: { destination: '/var/log/messaging.log' },
  });
}
```

## Backup Strategy

### Database Backups

```bash
# Daily database backup
0 2 * * * pg_dump -U user -h host database > /backups/messaging-$(date +\%Y\%m\%d).sql

# Upload to S3
aws s3 cp /backups/messaging-$(date +\%Y\%m\%d).sql s3://backups/messaging/
```

### Message Data Retention

```typescript
// Automatic cleanup of old messages
import cron from 'node-cron';

cron.schedule('0 3 * * *', async () => { // Daily at 3 AM
  const retentionDate = new Date();
  retentionDate.setFullYear(retentionDate.getFullYear() - 1);

  const deletedCount = await messageService.deleteOldMessages(retentionDate);
  logger.info(`Cleaned up ${deletedCount} messages older than 1 year`);
});
```

## Rollback Strategy

### Blue-Green Deployment

```bash
# Deploy to staging
kubectl set image deployment/messaging-api messaging-api=524/messaging:v2.1.0 --namespace=staging

# Run tests against staging
npm run test:e2e -- --environment=staging

# Promote to production
kubectl set image deployment/messaging-api messaging-api=524/messaging:v2.1.0 --namespace=production

# Rollback if needed
kubectl set image deployment/messaging-api messaging-api=524/messaging:v2.0.0 --namespace=production
```

### Database Rollbacks

```sql
-- Create restore point before migrations
CREATE TABLE schema_backup AS
SELECT * FROM information_schema.tables
WHERE table_schema = 'public';

-- Rollback migration
-- Note: Implement proper migration rollback scripts
```

## Performance Tuning

### Database Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM conversations
WHERE customer_id = $1 AND status = 'active'
ORDER BY last_message_at DESC
LIMIT 20;

-- Add missing indexes if needed
CREATE INDEX CONCURRENTLY idx_conversations_customer_active
ON conversations(customer_id, last_message_at DESC)
WHERE status = 'active';
```

### WebSocket Optimization

```typescript
// Connection limits
io.sockets.setMaxListeners(1000);

// Heartbeat configuration
io.engine.pingTimeout = 60000;  // 1 minute
io.engine.pingInterval = 25000; // 25 seconds

// Compression
io.engine.compression = true;
```

### Caching Strategy

```typescript
// Cache conversation metadata
const conversationCache = new Map();

const getConversationCached = async (id: string) => {
  if (conversationCache.has(id)) {
    return conversationCache.get(id);
  }

  const conversation = await conversationRepo.getConversation(id);
  conversationCache.set(id, conversation);

  // Expire after 5 minutes
  setTimeout(() => conversationCache.delete(id), 300000);

  return conversation;
};
```

## Security Hardening

### Network Security

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

### Application Security

```typescript
// Helmet.js security headers
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
}));
```

## Monitoring and Alerting

### Key Metrics to Monitor

- **WebSocket Connections**: Active connections, connection duration
- **Message Throughput**: Messages per second, delivery latency
- **Database Performance**: Query latency, connection pool usage
- **Error Rates**: Failed messages, API errors
- **Storage Usage**: S3 storage growth, image upload failures

### Alerting Rules

```yaml
# Prometheus alerting rules
groups:
  - name: messaging
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"

      - alert: WebSocketConnectionsLow
        expr: websocket_connections_active < 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low WebSocket connection count"

      - alert: DatabaseHighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High database query latency"
```

### Log Aggregation

```typescript
// Structured logging with correlation IDs
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || generateId();
  logger.info({
    correlationId: req.correlationId,
    method: req.method,
    url: req.url,
    userId: req.user?.id,
  }, 'Request started');

  res.on('finish', () => {
    logger.info({
      correlationId: req.correlationId,
      statusCode: res.statusCode,
      responseTime: Date.now() - req.startTime,
    }, 'Request completed');
  });

  next();
});
```

## Troubleshooting

### Common Deployment Issues

#### WebSocket Connection Failures

```bash
# Check WebSocket port accessibility
telnet yourapp.com 5240

# Verify SSL certificate
openssl s_client -connect yourapp.com:5240 -servername yourapp.com

# Check CORS configuration
curl -H "Origin: https://yourapp.com" -v https://yourapp.com/messaging/conversations
```

#### Database Connection Issues

```bash
# Test database connectivity
psql "$DATABASE_URL" -c "SELECT 1"

# Check connection pool status
# Monitor pool metrics in application logs
```

#### S3 Upload Failures

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Test S3 bucket access
aws s3 ls s3://524-chat-media/

# Check bucket permissions
aws s3api get-bucket-policy --bucket 524-chat-media
```

### Performance Troubleshooting

```bash
# Monitor WebSocket connections
curl http://localhost:5240/metrics | grep websocket_connections

# Check database slow queries
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

# Monitor Redis memory usage
redis-cli info memory
```

### Log Analysis

```bash
# Search for errors
grep "ERROR" /var/log/messaging.log | tail -20

# WebSocket connection analysis
grep "Client connected\|Client disconnected" /var/log/messaging.log | wc -l

# Message throughput
grep "Message sent" /var/log/messaging.log | awk '{print $1}' | sort | uniq -c
```

This deployment guide ensures the messaging system is production-ready with proper scaling, monitoring, and maintenance procedures.

