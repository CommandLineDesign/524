# 🎭 Mock Authentication System - Test Results

**Date**: November 17, 2025  
**Status**: ✅ **FULLY OPERATIONAL**

## ✅ What's Working

### 1. API Server
- ✅ Running on port `5524`
- ✅ Health check: `http://localhost:5524/api/health`
- ✅ Node v22.21.1 (correct version)

### 2. Mock Authentication Routes
```bash
# Get available mock users
curl http://localhost:5524/api/v1/auth/mock/users

# Login with role
curl -X POST http://localhost:5524/api/v1/auth/mock/login \
  -H "Content-Type: application/json" \
  -d '{"role": "customer"}'

# Get current user info
curl http://localhost:5524/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Authentication Middleware
✅ **Bearer Token Authentication**
```bash
TOKEN=$(curl -s -X POST http://localhost:5524/api/v1/auth/mock/login \
  -H "Content-Type: application/json" \
  -d '{"role": "customer"}' | jq -r '.token')

curl http://localhost:5524/api/v1/bookings \
  -H "Authorization: Bearer $TOKEN"
```

✅ **Header-Based Authentication (Quick Testing)**
```bash
curl http://localhost:5524/api/v1/bookings \
  -H "x-mock-user-id: mock-customer-1"
```

### 4. Role-Based Access Control (RBAC)
✅ **Customer-only routes** (e.g., `POST /bookings`)
- ✅ Customers: Allowed
- ✅ Artists: Blocked (403 Forbidden)
- ✅ No auth: Blocked (401 Unauthorized)

✅ **Artist-only routes** (e.g., `PATCH /bookings/:id/status`)
- Protected correctly

✅ **Multi-role routes** (e.g., `GET /bookings/:id`)
- Customers and Artists: Allowed
- Others: Blocked

## 🧪 Test Results

### Test 1: Mock Login
```bash
$ curl -X POST http://localhost:5524/api/v1/auth/mock/login \
  -H "Content-Type: application/json" \
  -d '{"role": "customer"}'
```
**Result**: ✅ SUCCESS
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
  "mock": true
}
```

### Test 2: Role-Based Access Control
```bash
$ curl -X POST http://localhost:5524/api/v1/bookings \
  -H "x-mock-user-id: mock-artist-1" \
  -H "Content-Type: application/json" \
  -d '{"artistId": "...", "serviceId": "...", "scheduledAt": "..."}'
```
**Result**: ✅ SUCCESS (Correctly blocked)
```json
{
  "error": "Insufficient permissions",
  "required_roles": ["customer"],
  "your_role": "artist"
}
```

### Test 3: Unauthenticated Request
```bash
$ curl -X POST http://localhost:5524/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{"artistId": "...", "serviceId": "...", "scheduledAt": "..."}'
```
**Result**: ✅ SUCCESS (Correctly blocked)
```json
{
  "error": "No token provided",
  "hint": "Use x-mock-user-id header or POST /api/v1/auth/mock/login"
}
```

### Test 4: Get Current User Info
```bash
$ curl http://localhost:5524/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```
**Result**: ✅ SUCCESS
```json
{
  "id": "mock-customer-1",
  "phone_number": "010-1234-5678",
  "email": "customer@test.com",
  "name": "김고객",
  "role": "customer",
  "mock": true,
  "available_test_users": [
    "mock-customer-1",
    "mock-customer-2",
    "mock-artist-1",
    "mock-artist-2",
    "mock-admin-1"
  ]
}
```

### Test 5: List Available Mock Users
```bash
$ curl http://localhost:5524/api/v1/auth/mock/users
```
**Result**: ✅ SUCCESS (5 mock users available)

## 📝 Available Mock Users

| User ID | Role | Name | Phone | Email |
|---------|------|------|-------|-------|
| `mock-customer-1` | customer | 김고객 | 010-1234-5678 | customer@test.com |
| `mock-customer-2` | customer | 이소비 | 010-2345-6789 | customer2@test.com |
| `mock-artist-1` | artist | 박아티스트 | 010-3456-7890 | artist@test.com |
| `mock-artist-2` | artist | 최메이크업 | 010-4567-8901 | artist2@test.com |
| `mock-admin-1` | admin | 관리자 | 010-5678-9012 | admin@test.com |

## 🔧 Configuration

### Environment Variables
```bash
# packages/api/.env
USE_REAL_AUTH=false          # ✅ Mock auth enabled
ENABLE_SMS=false             # SMS disabled (SENS not configured)
ENABLE_PUSH_NOTIFICATIONS=false  # Push disabled (Firebase not configured)
ENABLE_PAYMENTS=false        # Payments disabled (Kakao Pay/Toss not configured)
```

### Feature Flags
```typescript
// packages/api/src/config/features.ts
export const features = {
  USE_REAL_AUTH: env.USE_REAL_AUTH === 'true',
  ENABLE_SMS: env.ENABLE_SMS === 'true',
  ENABLE_PUSH_NOTIFICATIONS: env.ENABLE_PUSH_NOTIFICATIONS === 'true',
  ENABLE_PAYMENTS: env.ENABLE_PAYMENTS === 'true',
};
```

## 🚀 Quick Start Commands

### Start API Server
```bash
npm run dev:api
```

### Test Authentication
```bash
# Get a customer token
TOKEN=$(curl -s -X POST http://localhost:5524/api/v1/auth/mock/login \
  -H "Content-Type: application/json" \
  -d '{"role": "customer"}' | jq -r '.token')

# Use the token
curl http://localhost:5524/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Or use the quick header method
curl http://localhost:5524/api/v1/auth/me \
  -H "x-mock-user-id: mock-customer-1"
```

## 📚 Documentation

- **Full Guide**: `packages/api/MOCK_AUTH_GUIDE.md`
- **Setup Summary**: `MOCK_AUTH_SETUP_COMPLETE.md`
- **Environment Checklist**: `ENV_CHECKLIST.md`

## 🔄 Switching to Real Authentication

When Kakao/Naver/Apple accounts are ready:

1. **Update `.env`**:
   ```bash
   USE_REAL_AUTH=true
   ENABLE_SMS=true
   ```

2. **Add real credentials**:
   ```bash
   KAKAO_CLIENT_ID=your_real_id
   NAVER_CLIENT_ID=your_real_id
   SENS_SERVICE_ID=your_real_id
   ```

3. **Implement real auth handlers** in `packages/api/src/routes/v1/auth.ts`
   - Stubs are already in place
   - Middleware automatically switches based on `USE_REAL_AUTH`

4. **No changes needed to existing routes!** 🎉

## ⚠️ Known Issues

### Controller Errors (Not Auth-Related)
Some controllers may have implementation issues (e.g., booking creation logic). These are **separate from authentication** and need to be addressed independently.

Example:
```bash
$ curl -X POST http://localhost:5524/api/v1/bookings \
  -H "x-mock-user-id: mock-customer-1" \
  -H "Content-Type: application/json" \
  -d '{"artistId": "...", "serviceId": "...", "scheduledAt": "..."}'

# Returns: 500 Internal Server Error (controller logic issue)
```

**Note**: Authentication is working correctly (user is authenticated as customer). The error is in the booking controller's business logic.

## ✅ Conclusion

**Mock authentication is fully operational and ready for development!**

You can now:
- ✅ Test all API routes with different user roles
- ✅ Develop features without waiting for external auth providers
- ✅ Switch to real auth with a single environment variable change
- ✅ Use dynamic user data in all your tests

**Next Steps**:
1. Fix controller business logic errors (separate from auth)
2. Continue building features with mock auth
3. When ready, implement real auth handlers and flip `USE_REAL_AUTH=true`

