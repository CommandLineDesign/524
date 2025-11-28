# Mock Authentication Guide

## Overview

The mock authentication system allows you to develop and test all API routes with dynamic user data **without needing external auth providers** (Kakao, Naver, Apple, SENS).

When the business team sets up the real auth accounts, you can flip a single feature flag to switch to production authentication.

## Quick Start

### 1. Enable Mock Auth (Default)

In `/packages/api/.env`:
```bash
USE_REAL_AUTH=false
```

### 2. Get a Mock Token

**Option A: Simple Login**
```bash
curl -X POST http://localhost:5524/api/v1/auth/mock/login \
  -H "Content-Type: application/json" \
  -d '{"role": "customer"}'
```

Response:
```json
{
  "user": {
    "id": "mock-customer-1",
    "phone_number": "010-1234-5678",
    "email": "customer@test.com",
    "name": "김고객",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "mock": true,
  "message": "🎭 Mock authentication - for development only"
}
```

**Option B: Use Header (No Token Needed)**
```bash
curl http://localhost:5524/api/v1/bookings \
  -H "x-mock-user-id: mock-customer-1"
```

**Option C: Specific User**
```bash
curl -X POST http://localhost:5524/api/v1/auth/mock/login \
  -H "Content-Type: application/json" \
  -d '{"userId": "mock-artist-1"}'
```

### 3. Use Token in Requests

```bash
# Get your token from login response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use it in API calls
curl http://localhost:5524/api/v1/bookings \
  -H "Authorization: Bearer $TOKEN"
```

## Available Mock Users

| User ID | Role | Name | Phone | Use Case |
|---------|------|------|-------|----------|
| `mock-customer-1` | customer | 김고객 | 010-1234-5678 | Primary customer testing |
| `mock-customer-2` | customer | 이고객 | 010-2345-6789 | Secondary customer |
| `mock-artist-1` | artist | 박아티스트 | 010-3456-7890 | Primary artist testing |
| `mock-artist-2` | artist | 최아티스트 | 010-4567-8901 | Secondary artist |
| `mock-admin-1` | admin | 관리자 | 010-9999-9999 | Admin testing |

### List All Mock Users

```bash
curl http://localhost:5524/api/v1/auth/mock/users
```

## Testing Different Scenarios

### Customer Creating a Booking

```bash
# 1. Login as customer
curl -X POST http://localhost:5524/api/v1/auth/mock/login \
  -H "Content-Type: application/json" \
  -d '{"role": "customer"}' | jq -r '.token'

# 2. Create booking (use token from step 1)
curl -X POST http://localhost:5524/api/v1/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "artist_id": "mock-artist-1",
    "service_type": "makeup",
    "occasion": "wedding_ceremony",
    "scheduled_date": "2025-12-01",
    "scheduled_start_time": "2025-12-01T14:00:00Z"
  }'
```

### Artist Viewing Their Bookings

```bash
# Login as artist
curl -X POST http://localhost:5524/api/v1/auth/mock/login \
  -H "Content-Type: application/json" \
  -d '{"role": "artist"}' | jq -r '.token'

# Get artist's bookings
curl http://localhost:5524/api/v1/bookings?role=artist \
  -H "Authorization: Bearer $TOKEN"
```

### Testing Multi-User Interactions

```bash
# Terminal 1: Customer
CUSTOMER_TOKEN=$(curl -s -X POST http://localhost:5524/api/v1/auth/mock/login \
  -H "Content-Type: application/json" \
  -d '{"userId": "mock-customer-1"}' | jq -r '.token')

# Terminal 2: Artist  
ARTIST_TOKEN=$(curl -s -X POST http://localhost:5524/api/v1/auth/mock/login \
  -H "Content-Type: application/json" \
  -d '{"userId": "mock-artist-1"}' | jq -r '.token')

# Customer creates booking
curl -X POST http://localhost:5524/api/v1/bookings \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"artist_id": "mock-artist-1", ...}'

# Artist accepts booking
curl -X POST http://localhost:5524/api/v1/bookings/BOOKING_ID/accept \
  -H "Authorization: Bearer $ARTIST_TOKEN"
```

## Mock Auth Endpoints

### POST `/api/v1/auth/mock/login`
Get token for any mock user.

**Body:**
```json
{
  "userId": "mock-customer-1"  // Optional: specific user
  // OR
  "role": "customer"           // Optional: any user with this role
  // OR omit both for default customer
}
```

### POST `/api/v1/auth/phone/send-otp`
Mock phone OTP (always succeeds, code is always `123456`).

**Body:**
```json
{
  "phone_number": "010-1234-5678"
}
```

### POST `/api/v1/auth/phone/verify-otp`
Mock OTP verification (accepts any code).

**Body:**
```json
{
  "phone_number": "010-1234-5678",
  "code": "123456"  // Any code works
}
```

### POST `/api/v1/auth/:provider/login`
Mock OAuth login (kakao, naver, apple).

```bash
curl -X POST http://localhost:5524/api/v1/auth/kakao/login \
  -H "Content-Type: application/json" \
  -d '{"role": "customer"}'
```

### GET `/api/v1/auth/mock/users`
List all available mock users.

### GET `/api/v1/auth/me`
Get current authenticated user info.

## Using in Your Code

### Protecting Routes

```typescript
import { requireAuth, requireCustomer, requireArtist } from '../middleware/auth';

// Any authenticated user
router.get('/profile', requireAuth(), async (req, res) => {
  const user = req.user;
  // user is automatically populated (mock or real)
});

// Customer only
router.post('/bookings', requireCustomer(), async (req, res) => {
  const customerId = req.user.id;
  // Create booking for this customer
});

// Artist only
router.get('/earnings', requireArtist(), async (req, res) => {
  const artistId = req.user.id;
  // Get artist earnings
});

// Multiple roles
router.get('/bookings/:id', requireAuth(['customer', 'artist']), async (req, res) => {
  // Both customers and artists can access
});
```

### Optional Auth

```typescript
import { optionalAuth } from '../middleware/auth';

// Public endpoint that personalizes if user is logged in
router.get('/artists/search', optionalAuth(), async (req, res) => {
  const userId = req.user?.id; // undefined if not logged in
  
  // Show personalized results if logged in
  // Show public results if not logged in
});
```

## Switching to Real Auth

When Kakao/Naver/Apple accounts are ready:

### 1. Update Environment Variable

```bash
# In packages/api/.env
USE_REAL_AUTH=true
ENABLE_SMS=true  # When SENS is configured
```

### 2. Implement Real Auth Handlers

The mock auth routes will automatically be disabled. Implement the real handlers in:
- `packages/api/src/auth/kakao-auth.ts`
- `packages/api/src/auth/naver-auth.ts`
- `packages/api/src/auth/apple-auth.ts`
- `packages/api/src/auth/phone-auth.ts` (SENS integration)

### 3. Update Route Handlers

In `packages/api/src/routes/v1/auth.ts`, replace the `501` responses with your real implementations.

### 4. No Code Changes Needed Elsewhere!

All your existing routes using `requireAuth()`, `requireCustomer()`, etc. will automatically work with real authentication. The middleware handles both mock and real auth transparently.

## Frontend Integration

### React Native (Mobile)

```typescript
// packages/mobile/src/api/auth.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function mockLogin(role: 'customer' | 'artist' = 'customer') {
  const response = await fetch(`${API_URL}/api/v1/auth/mock/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  
  const data = await response.json();
  
  // Store token
  await AsyncStorage.setItem('auth_token', data.token);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
}

// Use in your app
import { mockLogin } from './api/auth';

// In development, auto-login
if (__DEV__) {
  await mockLogin('customer');
}
```

### Next.js (Web)

```typescript
// packages/web/src/lib/auth.ts
export async function getMockToken(role: 'customer' | 'artist' | 'admin') {
  const response = await fetch('/api/v1/auth/mock/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  
  return response.json();
}
```

## Testing Tips

### 1. Quick Role Switching

Create helper scripts:

```bash
# scripts/login-as-customer.sh
#!/bin/bash
curl -s -X POST http://localhost:5524/api/v1/auth/mock/login \
  -H "Content-Type: application/json" \
  -d '{"role": "customer"}' | jq -r '.token'

# Usage:
TOKEN=$(./scripts/login-as-customer.sh)
curl http://localhost:5524/api/v1/bookings -H "Authorization: Bearer $TOKEN"
```

### 2. Postman/Insomnia Collection

Set environment variables:
- `CUSTOMER_TOKEN`: Token for mock-customer-1
- `ARTIST_TOKEN`: Token for mock-artist-1
- `ADMIN_TOKEN`: Token for mock-admin-1

### 3. Automated Tests

```typescript
// test/helpers/auth.ts
export async function getCustomerToken() {
  const response = await request(app)
    .post('/api/v1/auth/mock/login')
    .send({ role: 'customer' });
  return response.body.token;
}

// In your tests
it('should create booking', async () => {
  const token = await getCustomerToken();
  
  const response = await request(app)
    .post('/api/v1/bookings')
    .set('Authorization', `Bearer ${token}`)
    .send({ ... });
    
  expect(response.status).toBe(201);
});
```

## Security Notes

- Mock auth is **automatically disabled** when `USE_REAL_AUTH=true`
- Mock endpoints return `404` in production
- Mock tokens are flagged with `mock: true` in the payload
- Never deploy with `USE_REAL_AUTH=false` to production

## Troubleshooting

### "No token provided" error

Make sure you're including the Authorization header:
```bash
-H "Authorization: Bearer YOUR_TOKEN"
```

Or use the mock header shortcut:
```bash
-H "x-mock-user-id: mock-customer-1"
```

### "Mock user not found"

Check available users:
```bash
curl http://localhost:5524/api/v1/auth/mock/users
```

### Token expired

Mock tokens last 24 hours. Just get a new one:
```bash
curl -X POST http://localhost:5524/api/v1/auth/mock/login -d '{"role": "customer"}'
```

## Summary

✅ **Zero external dependencies** - develop without Kakao/Naver/Apple accounts  
✅ **Dynamic user data** - test multi-user scenarios easily  
✅ **One-line switch** - flip `USE_REAL_AUTH` when ready  
✅ **No code changes** - existing routes work with both mock and real auth  
✅ **Multiple test users** - customers, artists, admins pre-configured  
✅ **Production-safe** - automatically disabled in production  

Happy developing! 🚀

