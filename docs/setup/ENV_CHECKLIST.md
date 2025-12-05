# Environment Variables Checklist

Use this checklist to track which API keys and services you've set up.

## Core Services (Required)

### Authentication
- [ ] **Kakao Developers** - https://developers.kakao.com
  - [ ] `KAKAO_CLIENT_ID` - OAuth Client ID
  - [ ] `KAKAO_CLIENT_SECRET` - OAuth Client Secret  
  - [ ] `KAKAO_REST_API_KEY` - REST API Key
  - [ ] `KAKAO_ADMIN_KEY` - Admin Key
  - [ ] `KAKAO_JS_KEY` - JavaScript Key (for web maps)
  - [ ] `KAKAO_APP_KEY` - Native App Key (for mobile)
  - [ ] Set redirect URIs in Kakao console

- [ ] **Naver Developers** - https://developers.naver.com
  - [ ] `NAVER_CLIENT_ID` - Application Client ID
  - [ ] `NAVER_CLIENT_SECRET` - Application Client Secret
  - [ ] Enable "Naver Login" API
  - [ ] Set redirect URIs in Naver console

### Payments
- [ ] **Kakao Pay** - https://developers.kakao.com
  - [ ] `KAKAO_PAY_CID` - Merchant ID (가맹점 코드)
  - [ ] Complete merchant registration
  - [ ] Set webhook URLs

- [ ] **Toss Payments** - https://developers.tosspayments.com
  - [ ] `TOSS_CLIENT_KEY` - Client Key
  - [ ] `TOSS_SECRET_KEY` - Secret Key
  - [ ] Register as merchant
  - [ ] Set webhook URLs

### SMS & Notifications
- [ ] **Naver Cloud SENS** - https://www.ncloud.com
  - [ ] `SENS_SERVICE_ID` - Service ID
  - [ ] `SENS_ACCESS_KEY` - Access Key
  - [ ] `SENS_SECRET_KEY` - Secret Key
  - [ ] `SENS_SENDER_NUMBER` - Registered sender phone number
  - [ ] Register sending phone number

### Location Services
- [ ] **Naver Maps** - https://www.ncloud.com
  - [ ] `NAVER_MAPS_CLIENT_ID` - Maps Client ID
  - [ ] `NAVER_MAPS_CLIENT_SECRET` - Maps Client Secret
  - [ ] Enable Maps API

- [ ] **Kakao Local API** (uses `KAKAO_REST_API_KEY` from above)
  - [ ] Enable "Local" API in Kakao console

### Business Verification
- [ ] **National Tax Service API** - https://www.data.go.kr
  - [ ] `NTS_API_KEY` - Open API Key
  - [ ] Register account on data.go.kr
  - [ ] Apply for "사업자등록상태 조회" API

## Infrastructure (Required)

### Database
- [x] **Neon PostgreSQL** (Development)
  - [x] Neon project: `524-beauty` (lingering-tree-89417492)
  - [x] Development branch: `br-square-dew-a1eh0ftr`
  - [x] Database: `neondb` (Neon default database)
  - [x] `DATABASE_URL` - Connection string configured
  - [x] Run database migrations to create schema ✅
  - [x] Schema created: 9 tables (users, customer_profiles, artist_profiles, bookings, payments, reviews, conversations, messages, addresses)

**Note:** Using Neon's development branch for local development. Database schema is ready!

### Cache
- [ ] **Redis**
  - [ ] Install Redis locally or set up cloud instance
  - [ ] `REDIS_URL` - Connection string

### File Storage
- [ ] **AWS S3**
  - [ ] Create AWS account
  - [ ] Create S3 bucket in `ap-northeast-2` (Seoul)
  - [ ] Set up IAM user with S3 permissions
  - [ ] `AWS_ACCESS_KEY_ID` - IAM Access Key
  - [ ] `AWS_SECRET_ACCESS_KEY` - IAM Secret Key
  - [ ] `AWS_S3_BUCKET` - Bucket name

- [ ] **CloudFront** (Optional but recommended)
  - [ ] Create CloudFront distribution
  - [ ] `AWS_CLOUDFRONT_URL` - Distribution URL

## Security (Required)

### Secrets
- [ ] Generate `JWT_SECRET` (32+ bytes)
- [ ] Generate `JWT_REFRESH_SECRET` (32+ bytes)
- [ ] Generate `ENCRYPTION_KEY` (exactly 32 bytes hex)
- [ ] Generate `NEXTAUTH_SECRET` (for Next.js)

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate encryption key (must be hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Optional Services

### Search (Optional)
- [ ] **Elasticsearch**
  - [ ] Install locally or use Elastic Cloud
  - [ ] `ELASTICSEARCH_NODE` - Elasticsearch URL
  - [ ] `ELASTICSEARCH_USERNAME` - Username
  - [ ] `ELASTICSEARCH_PASSWORD` - Password

### Monitoring (Recommended)
- [ ] **Sentry** - https://sentry.io
  - [ ] Create project
  - [ ] `SENTRY_DSN` - Project DSN
  - [ ] `SENTRY_AUTH_TOKEN` - Auth token (for source maps)

## Development Setup

### Local URLs
- [ ] API: `http://localhost:3000`
- [ ] Web Dashboard: `http://localhost:3001`
- [ ] Mobile: Set appropriate URL based on platform:
  - iOS Simulator: `http://localhost:3000`
  - Android Emulator: `http://10.0.2.2:3000`
  - Physical Device: `http://YOUR_LOCAL_IP:3000`

### CORS Configuration
- [ ] Update `CORS_ORIGIN` to include all frontend URLs
- [ ] For mobile: include Expo development URL

## Quick Commands

```bash
# Create all .env files from examples
./scripts/setup-env.sh

# Install dependencies
pnpm install

# Install git hooks (Biome + typecheck on commit)
pnpm lefthook install

# Start local PostgreSQL (macOS)
brew services start postgresql

# Start local Redis (macOS)
brew services start redis

# Run database migrations (creates tables in Neon development branch)
pnpm --filter @524/database db:migrate

# Start development servers
pnpm dev
```

## Production Checklist

When deploying to production:
- [ ] Use different API keys/secrets than development
- [ ] Enable MFA on all cloud accounts
- [ ] **Neon Production Branch**: Switch `DATABASE_URL` to production branch
  - Production branch: `br-crimson-bread-a1hj0ipe` (production)
  - Get connection string: Use Neon MCP or console
- [ ] Use managed Redis (AWS ElastiCache, etc.)
- [ ] Set up SSL/TLS certificates
- [ ] Configure proper CORS origins
- [ ] Set `TRUST_PROXY=true` if behind load balancer
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Test all payment flows in sandbox first
- [ ] Verify business registration API in production

## Need Help?

See detailed setup instructions in: `docs/ENV_SETUP.md`

## Service Documentation Links

- **Kakao Developers**: https://developers.kakao.com/docs
- **Naver Developers**: https://developers.naver.com/docs
- **Naver Cloud**: https://guide.ncloud-docs.com
- **Toss Payments**: https://docs.tosspayments.com
- **National Tax Service API**: https://www.data.go.kr

