# Environment Variables Setup Guide

This guide shows you how to set up environment variables for the 524 Beauty Marketplace platform.

## Required Services

### Authentication
- **Kakao** - OAuth login
- **Naver** - OAuth login

### Payments
- **Kakao Pay** - Payment processing
- **Toss Payments** - Payment processing

### Korean Services
- **SENS** (Naver Cloud) - SMS/OTP
- **Naver Maps** - Location services
- **Kakao Local API** - Address search
- **National Tax Service API** - Business verification

### Infrastructure
- **PostgreSQL** - Database
- **Redis** - Caching and sessions
- **AWS S3** - File storage
- **CloudFront** - CDN

---

## Local Port Map (canonical)

- API: `http://localhost:5240`
- Admin Web: `http://localhost:5241`
- Expo Metro (mobile bundler): `http://localhost:5242`

When you see `localhost:3000/3001` in older snippets, substitute the new ports above. Also update any OAuth/payment callback URLs and CORS origins to use the API port `5240`.

---

## Root `.env.example`

Create this file at the root: `/524/.env.example`

```bash
# ========================================
# 524 - Korean Beauty Services Marketplace
# Root Environment Variables
# ========================================

# ========================================
# ENVIRONMENT
# ========================================
NODE_ENV=development

# ========================================
# DATABASE
# ========================================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/beauty_marketplace

# ========================================
# REDIS
# ========================================
REDIS_URL=redis://localhost:6379

# ========================================
# AUTHENTICATION - JWT
# ========================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d

# ========================================
# ENCRYPTION (for bank accounts, sensitive data)
# ========================================
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ========================================
# KAKAO OAUTH & APIs
# ========================================
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_ADMIN_KEY=your_kakao_admin_key
KAKAO_JS_KEY=your_kakao_js_key

# ========================================
# NAVER OAUTH & APIs
# ========================================
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_REDIRECT_URI=http://localhost:3000/auth/naver/callback

# ========================================
# PAYMENT PROVIDERS
# ========================================
# Kakao Pay
KAKAO_PAY_CID=your_kakao_pay_cid

# Toss Payments
TOSS_CLIENT_KEY=your_toss_client_key
TOSS_SECRET_KEY=your_toss_secret_key

# ========================================
# SMS - NAVER CLOUD SENS
# ========================================
SENS_SERVICE_ID=ncp:sms:kr:xxxxxxxxxx:your-service
SENS_ACCESS_KEY=your_sens_access_key
SENS_SECRET_KEY=your_sens_secret_key
SENS_SENDER_NUMBER=01012345678

# ========================================
# KOREAN SERVICES
# ========================================
# Naver Maps
NAVER_MAPS_CLIENT_ID=your_naver_maps_client_id
NAVER_MAPS_CLIENT_SECRET=your_naver_maps_client_secret

# National Tax Service (business verification)
NTS_API_KEY=your_nts_api_key

# ========================================
# AWS
# ========================================
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=524-assets
AWS_CLOUDFRONT_URL=https://dxxxxxxxxxxxxx.cloudfront.net

# ========================================
# ELASTICSEARCH (optional)
# ========================================
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme

# ========================================
# MONITORING
# ========================================
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@o123456.ingest.sentry.io/1234567

# ========================================
# APPLICATION URLS
# ========================================
API_URL=http://localhost:5240
WEB_DASHBOARD_URL=http://localhost:5241
CORS_ORIGIN=http://localhost:5241,http://localhost:5240

# ========================================
# MISC
# ========================================
TZ=Asia/Seoul
LOG_LEVEL=info
PLATFORM_FEE_PERCENTAGE=15
VAT_PERCENTAGE=10
MAKEUP_TIME_LIMIT_MINUTES=40
```

---

## API Package `.env.example`

Create this file at: `/524/packages/api/.env.example`

```bash
# ========================================
# API Package Environment Variables
# ========================================

# ========================================
# SERVER
# ========================================
NODE_ENV=development
PORT=5240
HOST=0.0.0.0

# ========================================
# DATABASE
# ========================================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/beauty_marketplace

# ========================================
# REDIS
# ========================================
REDIS_URL=redis://localhost:6379

# ========================================
# JWT AUTHENTICATION
# ========================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d

# ========================================
# DATA ENCRYPTION
# ========================================
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# ========================================
# KAKAO - OAuth & Payment
# ========================================
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:3000/api/v1/auth/kakao/callback
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_ADMIN_KEY=your_kakao_admin_key

# Kakao Pay
KAKAO_PAY_CID=your_kakao_pay_cid
KAKAO_PAY_APPROVAL_URL=http://localhost:3000/api/v1/payments/kakao/success
KAKAO_PAY_CANCEL_URL=http://localhost:3000/api/v1/payments/kakao/cancel
KAKAO_PAY_FAIL_URL=http://localhost:3000/api/v1/payments/kakao/fail

# ========================================
# NAVER - OAuth
# ========================================
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_REDIRECT_URI=http://localhost:3000/api/v1/auth/naver/callback

# ========================================
# TOSS PAYMENTS
# ========================================
TOSS_CLIENT_KEY=your_toss_client_key
TOSS_SECRET_KEY=your_toss_secret_key
TOSS_SUCCESS_URL=http://localhost:3000/api/v1/payments/toss/success
TOSS_FAIL_URL=http://localhost:3000/api/v1/payments/toss/fail

# ========================================
# NAVER CLOUD SENS (SMS)
# ========================================
SENS_SERVICE_ID=ncp:sms:kr:xxxxxxxxxx:your-service
SENS_ACCESS_KEY=your_sens_access_key
SENS_SECRET_KEY=your_sens_secret_key
SENS_SENDER_NUMBER=01012345678

# ========================================
# NAVER MAPS
# ========================================
NAVER_MAPS_CLIENT_ID=your_naver_maps_client_id
NAVER_MAPS_CLIENT_SECRET=your_naver_maps_client_secret

# ========================================
# NATIONAL TAX SERVICE
# ========================================
NTS_API_KEY=your_nts_api_key
NTS_API_URL=https://api.odcloud.kr/api/nts-businessman/v1

# ========================================
# AWS S3 & CLOUDFRONT
# ========================================
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=524-assets
AWS_CLOUDFRONT_URL=https://dxxxxxxxxxxxxx.cloudfront.net

# ========================================
# ELASTICSEARCH (Optional)
# ========================================
ELASTICSEARCH_NODE=http://localhost:9200
ENABLE_ELASTICSEARCH=false

# ========================================
# WEBSOCKET
# ========================================
ENABLE_WEBSOCKET=true
SOCKET_IO_CORS_ORIGIN=http://localhost:3001,http://localhost:8081

# ========================================
# CORS
# ========================================
CORS_ORIGIN=http://localhost:3001,http://localhost:8081
TRUST_PROXY=false

# ========================================
# RATE LIMITING
# ========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
OTP_RATE_LIMIT_MAX=3

# ========================================
# FILE UPLOADS
# ========================================
MAX_FILE_SIZE_MB=10
MAX_PORTFOLIO_IMAGES=20
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# ========================================
# MONITORING
# ========================================
SENTRY_DSN=
LOG_LEVEL=info

# ========================================
# BUSINESS LOGIC
# ========================================
PLATFORM_FEE_PERCENTAGE=15
VAT_PERCENTAGE=10
MAKEUP_TIME_LIMIT_MINUTES=40
DEFAULT_BUFFER_TIME_MINUTES=30

# ========================================
# TIMEZONE
# ========================================
TZ=Asia/Seoul
```

---

## Web Dashboard `.env.example`

Create this file at: `/524/packages/web/.env.example`

**Note:** Next.js uses `.env.local` for local development (not tracked in git)

```bash
# ========================================
# Web Dashboard (Next.js)
# ========================================

# ========================================
# API
# ========================================
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# ========================================
# KAKAO
# ========================================
NEXT_PUBLIC_KAKAO_JS_KEY=your_kakao_js_key

# ========================================
# AUTHENTICATION
# ========================================
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-change-this

# ========================================
# SENTRY (Optional)
# ========================================
NEXT_PUBLIC_SENTRY_DSN=

# ========================================
# ENVIRONMENT
# ========================================
NEXT_PUBLIC_ENV=development

# ========================================
# FEATURE FLAGS
# ========================================
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CHAT=true
```

---

## Mobile App `.env.example`

Create this file at: `/524/packages/mobile/.env.example`

```bash
# ========================================
# Mobile App (React Native)
# ========================================

# ========================================
# API
# ========================================
API_URL=http://localhost:3000
WS_URL=ws://localhost:3000
# iOS simulator: http://localhost:3000
# Android emulator: http://10.0.2.2:3000
# Physical device: http://192.168.1.XXX:3000

# ========================================
# KAKAO
# ========================================
KAKAO_APP_KEY=your_kakao_native_app_key

# ========================================
# NAVER
# ========================================
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_SERVICE_URL_SCHEME=beauty524

# ========================================
# NAVER MAPS
# ========================================
NAVER_MAPS_CLIENT_ID=your_naver_maps_client_id

# ========================================
# TOSS PAYMENTS
# ========================================
TOSS_CLIENT_KEY=your_toss_client_key

# ========================================
# SENTRY (Optional)
# ========================================
SENTRY_DSN=

# ========================================
# DEEP LINKING
# ========================================
DEEP_LINK_SCHEME=beauty524
DEEP_LINK_PREFIX=beauty524://

# ========================================
# ENVIRONMENT
# ========================================
ENV=development

# ========================================
# FEATURE FLAGS
# ========================================
ENABLE_DEV_MENU=true
ENABLE_ERROR_REPORTING=false
```

---

## Database Package `.env.example`

Create this file at: `/524/packages/database/.env.example`

```bash
# ========================================
# Database Package
# ========================================

# ========================================
# DATABASE
# ========================================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/beauty_marketplace

# For migrations
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beauty_marketplace
DB_USER=postgres
DB_PASSWORD=postgres

# ========================================
# ENVIRONMENT
# ========================================
NODE_ENV=development
```

---

## Notifications Package `.env.example`

Create this file at: `/524/packages/notifications/.env.example`

```bash
# ========================================
# Notifications Package
# ========================================

# ========================================
# NAVER CLOUD SENS (SMS)
# ========================================
SENS_SERVICE_ID=ncp:sms:kr:xxxxxxxxxx:your-service
SENS_ACCESS_KEY=your_sens_access_key
SENS_SECRET_KEY=your_sens_secret_key
SENS_SENDER_NUMBER=01012345678

# ========================================
# REDIS
# ========================================
REDIS_URL=redis://localhost:6379

# ========================================
# ENVIRONMENT
# ========================================
NODE_ENV=development
```

---

## Setup Instructions

### 1. Create `.env` files

For each package, copy the `.env.example` to `.env`:

```bash
# Root
cp .env.example .env

# API
cp packages/api/.env.example packages/api/.env

# Web (use .env.local for Next.js)
cp packages/web/.env.example packages/web/.env.local

# Mobile
cp packages/mobile/.env.example packages/mobile/.env

# Database
cp packages/database/.env.example packages/database/.env

# Notifications
cp packages/notifications/.env.example packages/notifications/.env
```

### 2. Update `.gitignore`

Add these lines to your root `.gitignore`:

```
# Environment variables
.env
.env.local
.env.*.local
packages/*/.env
packages/*/.env.local
```

### 3. Get API Keys

#### Kakao Developers (https://developers.kakao.com)
1. Create an app
2. Get `REST API Key` → `KAKAO_REST_API_KEY`
3. Get `JavaScript Key` → `KAKAO_JS_KEY`
4. Get `Admin Key` → `KAKAO_ADMIN_KEY`
5. Get `Native App Key` → `KAKAO_APP_KEY` (for mobile)
6. Set up OAuth redirect URIs
7. Apply for Kakao Pay and get `CID`

#### Naver Developers (https://developers.naver.com)
1. Create an application
2. Get `Client ID` and `Client Secret`
3. Enable "Naver Login" API
4. Set OAuth redirect URIs
5. Enable "Naver Maps" API

#### Naver Cloud Platform (https://www.ncloud.com)
1. Create account
2. Set up SENS (SMS service)
3. Register sender phone number
4. Get API credentials

#### Toss Payments (https://developers.tosspayments.com)
1. Register as merchant
2. Get Client Key and Secret Key
3. Set up webhook URLs

#### National Tax Service (https://www.data.go.kr)
1. Register for Open API
2. Get API key for business verification

#### AWS (https://aws.amazon.com)
1. Create IAM user with S3 and CloudFront permissions
2. Create S3 bucket in `ap-northeast-2` region
3. Set up CloudFront distribution
4. Get access key and secret key

### 4. Generate Secrets

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Encryption Key (must be 32 bytes hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Local Development URLs

- API: `http://localhost:3000`
- Web Dashboard: `http://localhost:3001`
- Mobile (Expo): `http://192.168.1.XXX:8081` (your local IP)

---

## Environment-Specific Files

### Development
Use `.env` or `.env.local` with localhost URLs

### Staging
Create `.env.staging` with staging API URLs

### Production
Use environment variables from your hosting provider (Vercel, AWS, etc.)
**Never commit production credentials to git**

---

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use different keys** for development and production
3. **Rotate secrets** regularly in production
4. **Use environment-specific** S3 buckets and databases
5. **Enable MFA** on all cloud provider accounts
6. **Encrypt sensitive data** before storing in database

---

## Troubleshooting

### Mobile App Can't Reach API

**iOS Simulator:**
```bash
API_URL=http://localhost:3000
```

**Android Emulator:**
```bash
API_URL=http://10.0.2.2:3000
```

**Physical Device:**
```bash
# Find your computer's local IP
# macOS: ifconfig | grep "inet "
# Use that IP
API_URL=http://192.168.1.XXX:3000
```

### CORS Errors

Make sure your API `.env` has:
```bash
CORS_ORIGIN=http://localhost:3001,http://localhost:8081
```

### Database Connection Issues

Check that PostgreSQL is running:
```bash
psql -h localhost -U postgres -d beauty_marketplace
```

