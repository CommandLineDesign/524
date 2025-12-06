# 🎭 Mock Authentication Setup Complete!

## What Was Implemented

You now have a **complete mock authentication system** that lets you develop all your API routes with dynamic user data **without needing Kakao, Naver, Apple, or SENS accounts**.

## Quick Start

### 1. Start the API Server

```bash
npm run dev:api
```

The API now runs on **port 5240**. If you see `localhost:5524` in older snippets below, swap it for `localhost:5240`.

### 2. Get a Mock Token

```bash
# Login as a customer
curl -X POST http://localhost:5240/api/v1/auth/mock/login \
  -H "Content-Type: application/json" \
  -d '{"role": "customer"}'

# Response includes token and user info
```

### 3. Use the Token

```bash
# Save token from response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Make authenticated requests
curl http://localhost:5240/api/v1/bookings \
  -H "Authorization: Bearer $TOKEN"
```

### Alternative: Use Header Shortcut

```bash
# No token needed - just specify mock user
curl http://localhost:5524/api/v1/bookings \
  -H "x-mock-user-id: mock-customer-1"
```

## Available Mock Users

- `mock-customer-1` - 김고객 (Primary customer)
- `mock-customer-2` - 이고객 (Secondary customer)
- `mock-artist-1` - 박아티스트 (Primary artist)
- `mock-artist-2` - 최아티스트 (Secondary artist)
- `mock-admin-1` - 관리자 (Admin)

## Feature Flags

In `.env` files:

```bash
# Development (current)
USE_REAL_AUTH=false
ENABLE_SMS=false
ENABLE_PUSH_NOTIFICATIONS=false
ENABLE_PAYMENTS=false

# Production (when ready)
USE_REAL_AUTH=true
ENABLE_SMS=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_PAYMENTS=true
```

## Files Created

### Core Auth System
- `packages/api/src/config/features.ts` - Feature flags
- `packages/api/src/auth/mock-auth.ts` - Mock users and token generation
- `packages/api/src/middleware/auth.ts` - Auth middleware (works with mock OR real)
- `packages/api/src/routes/v1/auth.ts` - Auth endpoints

### Documentation
- `packages/api/MOCK_AUTH_GUIDE.md` - Complete usage guide with examples

### Configuration
- Updated `.env` files with feature flags
- Updated booking routes to use auth middleware

## How to Use in Your Routes

```typescript
import { requireAuth, requireCustomer, requireArtist } from '../middleware/auth';

// Any authenticated user
router.get('/profile', requireAuth(), async (req, res) => {
  const user = req.user; // Automatically populated
  res.json(user);
});

// Customer only
router.post('/bookings', requireCustomer(), async (req, res) => {
  const customerId = req.user.id;
  // Create booking...
});

// Artist only
router.get('/earnings', requireArtist(), async (req, res) => {
  const artistId = req.user.id;
  // Get earnings...
});
```

## Switching to Real Auth

When Kakao/Naver/Apple accounts are ready:

1. **Update `.env`:**
   ```bash
   USE_REAL_AUTH=true
   ```

2. **Implement real auth handlers** in:
   - `packages/api/src/auth/kakao-auth.ts`
   - `packages/api/src/auth/naver-auth.ts`
   - `packages/api/src/auth/apple-auth.ts`
   - `packages/api/src/auth/phone-auth.ts` (SENS)

3. **That's it!** All your existing routes automatically work with real auth.

## Testing Multi-User Scenarios

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
  -d '{
    "artist_id": "mock-artist-1",
    "service_type": "makeup",
    "occasion": "wedding_ceremony"
  }'

# Artist views bookings
curl http://localhost:5524/api/v1/bookings?role=artist \
  -H "Authorization: Bearer $ARTIST_TOKEN"
```

## Next Steps

1. ✅ Mock auth is set up
2. ✅ Feature flags configured
3. ✅ Example routes updated
4. **TODO**: Implement your business logic in controllers
5. **TODO**: Add more routes as needed
6. **TODO**: When business team provides accounts, flip `USE_REAL_AUTH=true`

## Documentation

See `packages/api/MOCK_AUTH_GUIDE.md` for:
- Complete API reference
- Frontend integration examples
- Testing strategies
- Troubleshooting guide

## Summary

You can now:
- ✅ Develop all API routes with real user context
- ✅ Test multi-user interactions
- ✅ Use dynamic data everywhere
- ✅ Switch to real auth with one line change
- ✅ No external auth dependencies needed

Happy coding! 🚀

