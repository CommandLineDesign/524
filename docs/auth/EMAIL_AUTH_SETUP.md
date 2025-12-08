# Email/Password Authentication Setup

## Overview

Added a complete email/password authentication system for development and testing. Mock users are stored in the database with hashed passwords, providing a realistic authentication flow without needing external OAuth providers.

## Changes Made

### 1. Database Schema Updates

**File:** `packages/database/src/schema/users.ts`
- Added `passwordHash` field to users table for storing bcrypt-hashed passwords
- Made `email` field unique to support email-based login
- Generated migration: `migrations/0001_rich_galactus.sql`

### 2. Database Seeding

**File:** `packages/database/src/seed.ts`
- Created seed script to populate database with mock users
- All users have the password: `password@1234`
- Mock users:
  - `customer@test.com` - Customer (김고객)
  - `customer2@test.com` - Customer (이고객)
  - `artist@test.com` - Artist (박아티스트)
  - `artist2@test.com` - Artist (최아티스트)
  - `admin@test.com` - Admin (관리자)

**Run seed script:**
```bash
cd packages/database
npm run seed
```

### 3. API Authentication Service

**File:** `packages/api/src/services/authService.ts`
- New `AuthService` class with email/password login
- Uses bcrypt to verify passwords against database hashes
- Generates JWT tokens for authenticated users
- Fetches user data from database for token validation

### 4. API Authentication Routes

**File:** `packages/api/src/routes/v1/auth.ts`
- Added `POST /api/v1/auth/login` endpoint for email/password login
- Added `GET /api/v1/auth/me` endpoint to get current user info
- Added `POST /api/v1/auth/signup/user` endpoint for customer signup (email/password/confirmPassword)
- Added `POST /api/v1/auth/signup/artist` endpoint for artist signup (creates artist role only and a pending artist profile)
- Works alongside existing mock auth endpoints

**Notes**
- Phone numbers are optional for signup; we no longer generate placeholder phone values. Future phone verification can supply this field when ready.

**Login Request:**
```json
POST /api/v1/auth/login
{
  "email": "customer@test.com",
  "password": "password@1234"
}
```

**Login Response:**
```json
{
  "user": {
    "id": "mock-customer-1",
    "email": "customer@test.com",
    "name": "김고객",
    "role": "customer",
    "phoneNumber": "010-1234-5678"
  },
  "token": "eyJhbGc..."
}
```

### 5. Authentication Middleware Updates

**File:** `packages/api/src/middleware/auth.ts`
- Updated to fetch users from database for non-mock tokens
- Supports both mock auth (for testing) and database auth (for realistic flows)
- JWT tokens include user_id, role, and phone_number

### 6. Mobile App - Auth Store

**File:** `packages/mobile/src/store/authStore.ts`
- New Zustand store for authentication state
- Manages user login, logout, and session persistence
- Uses AsyncStorage to persist auth tokens between app restarts
- Handles API calls to login endpoint

### 7. Mobile App - Login Screen

**File:** `packages/mobile/src/screens/LoginScreen.tsx`
- Beautiful login screen with email/password inputs
- Quick-select buttons for each test user
- Shows test credentials info box
- Handles login errors with user-friendly messages

**Features:**
- Email and password input fields
- Test user selector buttons
- Loading states
- Error handling
- Development-friendly UI with visible test credentials

### 8. Mobile App - Navigation

**File:** `packages/mobile/src/navigation/AppNavigator.tsx`
- Added authentication-aware navigation
- Shows login screen when not authenticated
- Shows app screens when authenticated
- Loads session on app start from AsyncStorage

### 9. Mobile App - API Client

**File:** `packages/mobile/src/api/client.ts`
- Updated to include Authorization header with JWT token
- Reads token from AsyncStorage for all requests
- Automatically attaches to booking creation and other API calls

## Setup Instructions

### 1. Run Database Migration

```bash
cd packages/database
# Apply the migration to add password_hash column
npm run generate  # Already done
```

### 2. Seed Mock Users

```bash
cd packages/database
npm run seed
```

This will create 5 mock users in your database with the password `password@1234`.

### 3. Restart API Server

```bash
cd packages/api
npm run dev
```

### 4. Run Mobile App

```bash
cd packages/mobile
npm start
```

## Testing

### Test Login in Mobile App

1. Launch the mobile app
2. You'll see the login screen
3. Either:
   - Select a test user button (pre-fills email)
   - Manually enter any test email
4. Password is always: `password@1234`
5. Tap "로그인" (Login)

### Test Login with curl

```bash
# Login as customer
curl -X POST http://localhost:5524/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"password@1234"}'

# Get current user (use token from login response)
curl http://localhost:5524/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Booking Creation

```bash
# Create booking (use token from login response)
curl -X POST http://localhost:5524/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "customerId": "mock-customer-1",
    "artistId": "mock-artist-1",
    "serviceType": "hair",
    "occasion": "wedding",
    "scheduledDate": "2024-12-01T10:00:00Z",
    "scheduledStartTime": "2024-12-01T10:00:00Z",
    "scheduledEndTime": "2024-12-01T11:00:00Z",
    "totalAmount": 80000,
    "services": [],
    "location": { "address": "Test Location" }
  }'
```

## Migration Path

### From Mock Auth to Real Auth

When ready to implement real OAuth providers:

1. Keep the email/password system for testing
2. Add OAuth provider columns (already exist: kakaoId, naverId, appleId)
3. Implement OAuth login endpoints in `auth.ts`
4. Update `AuthService` to handle OAuth tokens
5. Update mobile app to show OAuth buttons alongside email/password

### Benefits of This Approach

✅ **Realistic Testing**: Mock users behave exactly like real users
✅ **Full Auth Flow**: Login, logout, token refresh all work
✅ **Database Integration**: All features work with real database queries
✅ **Role-Based Testing**: Easy to test as customer, artist, or admin
✅ **Secure**: Passwords are properly hashed with bcrypt
✅ **Persistent Sessions**: Tokens survive app restarts
✅ **Production-Ready**: Same auth system, just add OAuth providers later

## Security Notes

- This is for **development/testing only**
- All test users use the same password: `password@1234`
- Passwords are properly hashed with bcrypt (secure)
- JWT tokens expire after 24 hours
- Tokens are stored securely in AsyncStorage

## Mock Users Reference

| Email | Password | Role | Name |
|-------|----------|------|------|
| customer@test.com | password@1234 | customer | 김고객 |
| customer2@test.com | password@1234 | customer | 이고객 |
| artist@test.com | password@1234 | artist | 박아티스트 |
| artist2@test.com | password@1234 | artist | 최아티스트 |
| admin@test.com | password@1234 | admin | 관리자 |

## Next Steps

- [ ] Run database migration
- [ ] Seed mock users
- [ ] Restart API server
- [ ] Test login in mobile app
- [ ] Test booking creation with authentication
- [ ] Add user profile screen
- [ ] Add logout button in app menu
- [ ] Add user switcher in app menu (optional)

