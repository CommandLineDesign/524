# 524 - Technical Specification & Architecture
## Korean Beauty Services Marketplace Platform

## System Overview

524 is a two-sided marketplace platform for beauty services in South Korea. The system consists of a React Native mobile application (primary interface for both customers and artists), a Next.js web dashboard (artist management and admin), and a Node.js/Express backend API with PostgreSQL database.

**Primary Market:** South Korea (Seoul region)  
**Languages:** Korean (primary), English (secondary)  
**Deployment Region:** AWS ap-northeast-2 (Seoul) or Naver Cloud Platform

## Technical Architecture

### Monorepo Structure

```
524/
├── packages/
│   ├── mobile/              # React Native app (customer + provider)
│   ├── web/                 # Web admin & provider dashboard (Next.js)
│   ├── api/                 # Node.js backend API
│   ├── shared/              # Shared utilities, types, constants, i18n
│   ├── database/            # Drizzle ORM schemas & migrations
│   └── notifications/       # Push notification service
├── infrastructure/          # AWS/GCP deployment configs, Docker
├── scripts/                 # Build, deploy, maintenance scripts
├── docs/                    # API docs, architecture decisions
└── locales/                 # i18n translation files (ko, en)
```

### Tech Stack

#### Frontend (Mobile) - Primary Platform
- **Framework**: React Native with TypeScript
- **Navigation**: React Navigation v6
- **Styling**: StyleSheet API + styled-components/native
- **State Management**: Zustand for global state, React Query for server state
- **Maps**: Naver Maps SDK (Korean market standard)
- **Camera**: expo-camera for portfolio and service photos
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Storage**: AsyncStorage + MMKV for sensitive data
- **Calendar**: react-native-calendars with Korean locale
- **Payment**: Kakao Pay SDK, Naver Pay SDK, Toss SDK
- **Authentication**: 
  - Kakao Login SDK
  - Naver Login SDK
  - Phone number verification (Firebase Auth)
  - Apple Sign-In (iOS requirement)
- **Real-time**: Socket.io client for messaging
- **Image Handling**: react-native-fast-image with caching

#### Frontend (Web) - Provider Dashboard & Admin
- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: CSS Modules + Tailwind CSS
- **State Management**: Zustand + React Query
- **Maps**: Kakao Maps JavaScript API
- **Charts**: Recharts for analytics
- **Forms**: React Hook Form + Zod validation
- **Rich Text**: Tiptap for service descriptions
- **Real-time**: Socket.io client

#### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with middleware architecture
- **Database**: AWS RDS PostgreSQL with Drizzle ORM
- **Authentication**: 
  - Firebase Auth for phone verification
  - Custom JWT for session management
  - OAuth integrations (Kakao, Naver)
- **File Storage**: AWS S3 with CloudFront CDN
- **Caching**: Redis for:
  - Session management
  - Real-time availability
  - Rate limiting
  - Search results caching
- **Queue**: Bull for:
  - Notification scheduling
  - Payment processing
  - Service completion workflows
  - Reminder systems
- **Real-time**: Socket.io for messaging
- **Search**: Elasticsearch for:
  - Artist search
  - Location-based queries
  - Occasion matching
- **Payment Processing**:
  - Kakao Pay API
  - Naver Pay API
  - Toss Payments API
  - PG Integration (KG Inicis, NHN KCP)
- **SMS**: SENS (Naver Cloud) for OTP and notifications
- **Business Registration**: National Tax Service API integration

#### Korean-Specific Infrastructure
- **Hosting**: Naver Cloud Platform or AWS Seoul Region (ap-northeast-2)
- **CDN**: CloudFront with Seoul edge locations
- **Compliance**: 
  - PIPA (Personal Information Protection Act)
  - ePrivacy certification
  - Financial Services Commission regulations
- **Address System**: Kakao Local API for address lookup
- **Maps & Location**: 
  - Naver Maps for location services
  - Kakao Mobility for directions
- **Business Verification**: 
  - Business registration number validation
  - Professional license verification

## Data Model

### Core Entities

```typescript
// ========================================
// USER & PROFILE MODELS
// ========================================

interface User {
  id: string;
  firebase_uid?: string;
  phone_number: string;
  phone_verified: boolean;
  email?: string;
  role: 'customer' | 'artist' | 'admin';
  
  // OAuth identifiers
  kakao_id?: string;
  naver_id?: string;
  apple_id?: string;
  
  name: string;
  profile_image_url?: string;
  birth_year?: number;
  
  language: 'ko' | 'en';
  timezone: string;
  notification_preferences: object;
  
  is_active: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CustomerProfile {
  id: string;
  user_id: string;
  
  // Beauty preferences
  skin_type?: string;
  hair_type?: string;
  allergies?: string[];
  
  // Saved data
  favorite_artists: string[];
  saved_addresses: Address[];
  
  // Stats
  total_bookings: number;
  completed_bookings: number;
  
  created_at: Date;
  updated_at: Date;
}

interface ArtistProfile {
  id: string;
  user_id: string;
  
  stage_name: string;
  bio: string;
  specialties: string[];
  years_experience: number;
  
  // Verification
  business_registration_number?: string;
  business_verified: boolean;
  
  // Service configuration
  service_radius_km: number;
  primary_location: Location;
  working_hours: object;
  buffer_time_minutes: number;
  
  // Portfolio
  portfolio_images: PortfolioImage[];
  
  // Performance metrics
  total_services: number;
  completed_services: number;
  average_rating: number;
  response_time_minutes: number;
  
  // Financial
  bank_account?: object; // Encrypted
  
  // Status
  is_accepting_bookings: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  
  created_at: Date;
  updated_at: Date;
}

// ========================================
// BOOKING MODELS
// ========================================

interface Booking {
  id: string;
  booking_number: string;
  
  customer_id: string;
  artist_id: string;
  
  service_type: 'hair' | 'makeup' | 'combo';
  occasion: string;
  services: BookedService[];
  total_duration_minutes: number;
  
  scheduled_date: Date;
  scheduled_start_time: Date;
  scheduled_end_time: Date;
  
  service_location: ServiceLocation;
  address: Address;
  location_notes?: string;
  
  // Actual timing
  service_started_at?: Date;
  service_completed_at?: Date;
  actual_duration_minutes?: number;
  
  special_requests?: string;
  reference_images?: string[];
  
  status: BookingStatus;
  
  payment_id?: string;
  payment_status: string;
  total_amount: number;
  
  // Reviews
  customer_rating?: number;
  customer_review?: string;
  artist_response?: string;
  
  cancelled_by?: string;
  cancelled_at?: Date;
  cancellation_reason?: string;
  
  created_at: Date;
  updated_at: Date;
}

type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

interface BookedService {
  id: string;
  booking_id: string;
  service_id: string;
  service_name: string;
  duration_minutes: number;
  price: number;
}

// ========================================
// PAYMENT MODELS
// ========================================

interface Payment {
  id: string;
  booking_id: string;
  customer_id: string;
  artist_id: string;
  
  subtotal: number;
  platform_fee: number;
  travel_fee: number;
  tip_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: 'KRW';
  
  payment_method: string;
  payment_provider: 'kakao_pay' | 'naver_pay' | 'toss' | 'card';
  payment_provider_transaction_id?: string;
  
  status: PaymentStatus;
  
  authorized_at?: Date;
  captured_at?: Date;
  refunded_at?: Date;
  
  artist_payout_amount: number;
  payout_status: string;
  payout_date?: Date;
  
  created_at: Date;
  updated_at: Date;
}

type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'completed'
  | 'failed'
  | 'refunded';

// ========================================
// MESSAGING MODELS
// ========================================

interface Conversation {
  id: string;
  booking_id?: string;
  customer_id: string;
  artist_id: string;
  
  status: 'active' | 'archived';
  last_message_at: Date;
  unread_count_customer: number;
  unread_count_artist: number;
  
  created_at: Date;
  updated_at: Date;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: 'customer' | 'artist';
  
  message_type: 'text' | 'image' | 'system';
  content: string;
  images?: string[];
  
  sent_at: Date;
  read_at?: Date;
  
  created_at: Date;
}

// ========================================
// REVIEW MODELS
// ========================================

interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  artist_id: string;
  
  overall_rating: number; // 1-5
  quality_rating: number;
  professionalism_rating: number;
  timeliness_rating: number;
  
  review_text?: string;
  review_images?: string[];
  
  artist_response?: string;
  
  is_visible: boolean;
  
  created_at: Date;
  updated_at: Date;
}

// ========================================
// LOCATION MODELS
// ========================================

interface Address {
  id: string;
  
  // Korean address format
  sido: string;           // 시/도
  sigungu: string;        // 시/군/구
  dong: string;           // 동
  road_name?: string;
  building_number?: string;
  building_name?: string;
  detail_address?: string;
  postal_code: string;
  
  full_address_korean: string;
  
  latitude: number;
  longitude: number;
  
  label?: 'home' | 'work' | 'other';
  
  created_at: Date;
  updated_at: Date;
}
```

### Database Schema (Drizzle ORM)

```typescript
// packages/database/schema/users.ts
import { pgTable, uuid, varchar, timestamp, boolean, integer, decimal, jsonb, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firebase_uid: varchar('firebase_uid', { length: 128 }).unique(),
  
  // Korean OAuth
  kakao_id: varchar('kakao_id', { length: 128 }).unique(),
  naver_id: varchar('naver_id', { length: 128 }).unique(),
  apple_id: varchar('apple_id', { length: 128 }).unique(),
  
  // Primary identifiers
  phone_number: varchar('phone_number', { length: 20 }).notNull().unique(),
  phone_verified: boolean('phone_verified').default(false),
  email: varchar('email', { length: 255 }),
  
  role: varchar('role', { length: 20 }).notNull().default('customer'),
  name: varchar('name', { length: 100 }).notNull(),
  profile_image_url: text('profile_image_url'),
  
  birth_year: integer('birth_year'),
  gender: varchar('gender', { length: 10 }),
  
  language: varchar('language', { length: 5 }).default('ko'),
  timezone: varchar('timezone', { length: 50 }).default('Asia/Seoul'),
  
  notification_preferences: jsonb('notification_preferences'),
  
  is_active: boolean('is_active').default(true),
  is_verified: boolean('is_verified').default(false),
  deactivated_at: timestamp('deactivated_at'),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const customerProfiles = pgTable('customer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  
  skin_type: varchar('skin_type', { length: 20 }),
  skin_tone: varchar('skin_tone', { length: 50 }),
  hair_type: varchar('hair_type', { length: 20 }),
  hair_length: varchar('hair_length', { length: 20 }),
  
  allergies: jsonb('allergies'),
  sensitivities: jsonb('sensitivities'),
  medical_notes: text('medical_notes'),                      // Encrypted
  
  preferred_styles: jsonb('preferred_styles'),
  favorite_artists: jsonb('favorite_artists'),
  gender_preference: varchar('gender_preference', { length: 20 }),
  
  primary_address: jsonb('primary_address'),
  saved_addresses: jsonb('saved_addresses'),
  
  total_bookings: integer('total_bookings').default(0),
  completed_bookings: integer('completed_bookings').default(0),
  cancelled_bookings: integer('cancelled_bookings').default(0),
  average_rating_given: decimal('average_rating_given', { precision: 3, scale: 2 }),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const artistProfiles = pgTable('artist_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  
  stage_name: varchar('stage_name', { length: 100 }).notNull(),
  bio: text('bio'),
  specialties: jsonb('specialties'),
  years_experience: integer('years_experience').notNull(),
  
  // Business verification
  business_registration_number: varchar('business_registration_number', { length: 20 }),
  business_verified: boolean('business_verified').default(false),
  licenses: jsonb('licenses'),
  certifications: jsonb('certifications'),
  
  service_radius_km: decimal('service_radius_km', { precision: 5, scale: 2 }).notNull(),
  primary_location: jsonb('primary_location').notNull(),
  service_areas: jsonb('service_areas'),
  
  working_hours: jsonb('working_hours'),
  buffer_time_minutes: integer('buffer_time_minutes').default(30),
  advance_booking_days: integer('advance_booking_days').default(14),
  
  services: jsonb('services'),
  packages: jsonb('packages'),
  travel_fee: decimal('travel_fee', { precision: 10, scale: 2 }),
  
  portfolio_images: jsonb('portfolio_images'),
  before_after_sets: jsonb('before_after_sets'),
  featured_work: jsonb('featured_work'),
  
  // Performance metrics
  total_services: integer('total_services').default(0),
  completed_services: integer('completed_services').default(0),
  cancelled_services: integer('cancelled_services').default(0),
  average_rating: decimal('average_rating', { precision: 3, scale: 2 }),
  total_reviews: integer('total_reviews').default(0),
  response_time_minutes: integer('response_time_minutes'),
  on_time_completion_rate: decimal('on_time_completion_rate', { precision: 5, scale: 2 }),
  
  background_check_completed: boolean('background_check_completed').default(false),
  background_check_date: timestamp('background_check_date'),
  insurance_verified: boolean('insurance_verified').default(false),
  insurance_expiry_date: timestamp('insurance_expiry_date'),
  
  bank_account: jsonb('bank_account'),                       // Encrypted
  tax_id: text('tax_id'),                                    // Encrypted
  
  is_accepting_bookings: boolean('is_accepting_bookings').default(true),
  verification_status: varchar('verification_status', { length: 20 }).default('pending'),
  account_status: varchar('account_status', { length: 20 }).default('active'),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  verified_at: timestamp('verified_at'),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  booking_number: varchar('booking_number', { length: 50 }).unique().notNull(),
  
  customer_id: uuid('customer_id').references(() => users.id).notNull(),
  artist_id: uuid('artist_id').references(() => users.id).notNull(),
  
  service_type: varchar('service_type', { length: 20 }).notNull(),
  occasion: varchar('occasion', { length: 50 }).notNull(),
  services: jsonb('services').notNull(),
  total_duration_minutes: integer('total_duration_minutes').notNull(),
  
  scheduled_date: timestamp('scheduled_date').notNull(),
  scheduled_start_time: timestamp('scheduled_start_time').notNull(),
  scheduled_end_time: timestamp('scheduled_end_time').notNull(),
  timezone: varchar('timezone', { length: 50 }).default('Asia/Seoul'),
  
  service_location: jsonb('service_location').notNull(),
  location_type: varchar('location_type', { length: 30 }).notNull(),
  address: jsonb('address').notNull(),
  location_notes: text('location_notes'),
  
  artist_arrived_at: timestamp('artist_arrived_at'),
  service_started_at: timestamp('service_started_at'),
  service_completed_at: timestamp('service_completed_at'),
  actual_duration_minutes: integer('actual_duration_minutes'),
  
  special_requests: text('special_requests'),
  reference_images: jsonb('reference_images'),
  
  status: varchar('status', { length: 30 }).notNull(),
  status_history: jsonb('status_history'),
  
  payment_id: uuid('payment_id'),
  payment_status: varchar('payment_status', { length: 30 }).notNull(),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  breakdown: jsonb('breakdown'),
  
  protocol_checklist: jsonb('protocol_checklist'),
  time_limit_breached: boolean('time_limit_breached').default(false),
  completion_photo: text('completion_photo'),
  
  customer_rating: integer('customer_rating'),
  customer_review: text('customer_review'),
  customer_review_date: timestamp('customer_review_date'),
  artist_response: text('artist_response'),
  
  artist_rating_for_customer: integer('artist_rating_for_customer'),
  artist_notes: text('artist_notes'),
  
  cancelled_by: varchar('cancelled_by', { length: 20 }),
  cancelled_at: timestamp('cancelled_at'),
  cancellation_reason: text('cancellation_reason'),
  cancellation_fee: decimal('cancellation_fee', { precision: 10, scale: 2 }),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  confirmed_at: timestamp('confirmed_at'),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  booking_id: uuid('booking_id').references(() => bookings.id).notNull(),
  customer_id: uuid('customer_id').references(() => users.id).notNull(),
  artist_id: uuid('artist_id').references(() => users.id).notNull(),
  
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  platform_fee: decimal('platform_fee', { precision: 10, scale: 2 }).notNull(),
  travel_fee: decimal('travel_fee', { precision: 10, scale: 2 }).default('0'),
  tip_amount: decimal('tip_amount', { precision: 10, scale: 2 }).default('0'),
  discount_amount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  tax_amount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('KRW'),
  
  payment_method: varchar('payment_method', { length: 30 }).notNull(),
  payment_provider: varchar('payment_provider', { length: 30 }).notNull(),
  payment_provider_transaction_id: varchar('payment_provider_transaction_id', { length: 255 }),
  
  card_last4: varchar('card_last4', { length: 4 }),
  card_brand: varchar('card_brand', { length: 20 }),
  
  status: varchar('status', { length: 30 }).notNull(),
  status_history: jsonb('status_history'),
  
  authorized_at: timestamp('authorized_at'),
  captured_at: timestamp('captured_at'),
  failed_at: timestamp('failed_at'),
  refunded_at: timestamp('refunded_at'),
  
  refund_amount: decimal('refund_amount', { precision: 10, scale: 2 }),
  refund_reason: text('refund_reason'),
  
  artist_payout_amount: decimal('artist_payout_amount', { precision: 10, scale: 2 }).notNull(),
  payout_status: varchar('payout_status', { length: 20 }).default('pending'),
  payout_date: timestamp('payout_date'),
  payout_transaction_id: varchar('payout_transaction_id', { length: 255 }),
  
  receipt_url: text('receipt_url'),
  tax_invoice_issued: boolean('tax_invoice_issued').default(false),
  tax_invoice_number: varchar('tax_invoice_number', { length: 50 }),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Additional tables following similar patterns...
// - conversations
// - messages
// - reviews
// - notifications
// - protocol_checklists
// - protocol_violations
// - addresses
// - artist_analytics
// - platform_analytics
```

## Authentication & Authorization

### Korean Market Authentication Flow

```typescript
// packages/api/src/auth/strategies/korean-auth.ts

interface AuthStrategy {
  // Phone number (Primary method)
  phoneAuth: {
    sendOTP: (phoneNumber: string) => Promise<void>;
    verifyOTP: (phoneNumber: string, code: string) => Promise<AuthToken>;
  };
  
  // Kakao OAuth
  kakaoAuth: {
    getAuthURL: () => string;
    handleCallback: (code: string) => Promise<AuthToken>;
  };
  
  // Naver OAuth
  naverAuth: {
    getAuthURL: () => string;
    handleCallback: (code: string) => Promise<AuthToken>;
  };
  
  // Apple Sign In
  appleAuth: {
    verifyToken: (identityToken: string) => Promise<AuthToken>;
  };
}

// User lookup/creation with multiple auth methods
async function authenticateUser(authData: AuthData): Promise<User> {
  // Try to find existing user by any identifier
  let user = await findUserByAnyIdentifier({
    kakao_id: authData.kakao_id,
    naver_id: authData.naver_id,
    apple_id: authData.apple_id,
    phone_number: authData.phone_number,
    firebase_uid: authData.firebase_uid,
  });
  
  if (!user) {
    // Create new user
    user = await createUser({
      phone_number: authData.phone_number,
      kakao_id: authData.kakao_id,
      naver_id: authData.naver_id,
      name: authData.name || generateDefaultName(),
      profile_image_url: authData.profile_image,
    });
  } else {
    // Link additional auth methods to existing account
    await linkAuthMethods(user.id, authData);
  }
  
  return user;
}

// Phone verification with SMS (SENS)
async function sendVerificationCode(phoneNumber: string): Promise<void> {
  const code = generateSixDigitCode();
  
  // Store in Redis with 5-minute expiration
  await redis.setex(`otp:${phoneNumber}`, 300, code);
  
  // Send via Naver Cloud SENS
  await sensClient.sendSMS({
    to: phoneNumber,
    from: process.env.SENS_SENDER_NUMBER,
    content: `[524] 인증번호는 ${code}입니다. 5분 이내에 입력해주세요.`,
  });
}

// JWT token generation with Korean considerations
function generateTokenPair(user: User): TokenPair {
  const accessToken = jwt.sign(
    {
      user_id: user.id,
      role: user.role,
      phone_number: user.phone_number,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  const refreshToken = jwt.sign(
    {
      user_id: user.id,
      type: 'refresh',
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
  
  return { accessToken, refreshToken };
}
```

### Authorization Middleware

```typescript
// Role-based access control
export const requireAuth = (roles?: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
      
      // Check role if specified
      if (roles && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      // Attach user to request
      req.user = await getUserById(decoded.user_id);
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

// Resource ownership verification
export const requireOwnership = (resourceType: 'booking' | 'profile' | 'review') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const resourceId = req.params.id;
    const userId = req.user.id;
    
    const hasOwnership = await verifyOwnership(resourceType, resourceId, userId);
    
    if (!hasOwnership && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  };
};
```

## Payment Integration (Korean Market)

### Payment Provider Integration

```typescript
// packages/api/src/payments/providers/

// Kakao Pay Integration
class KakaoPayProvider implements PaymentProvider {
  async initiatePayment(params: PaymentParams): Promise<PaymentInitiation> {
    const response = await axios.post(
      'https://kapi.kakao.com/v1/payment/ready',
      {
        cid: process.env.KAKAO_PAY_CID,
        partner_order_id: params.booking_id,
        partner_user_id: params.customer_id,
        item_name: params.service_description,
        quantity: 1,
        total_amount: params.total_amount,
        tax_free_amount: 0,
        approval_url: `${process.env.APP_URL}/payment/success`,
        cancel_url: `${process.env.APP_URL}/payment/cancel`,
        fail_url: `${process.env.APP_URL}/payment/fail`,
      },
      {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
        },
      }
    );
    
    return {
      tid: response.data.tid,
      redirect_url: response.data.next_redirect_mobile_url,
    };
  }
  
  async approvePayment(tid: string, pgToken: string): Promise<PaymentResult> {
    const response = await axios.post(
      'https://kapi.kakao.com/v1/payment/approve',
      {
        cid: process.env.KAKAO_PAY_CID,
        tid: tid,
        partner_order_id: params.booking_id,
        partner_user_id: params.customer_id,
        pg_token: pgToken,
      },
      {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
        },
      }
    );
    
    return {
      success: true,
      transaction_id: response.data.tid,
      amount: response.data.amount.total,
      approved_at: response.data.approved_at,
    };
  }
  
  async refundPayment(tid: string, amount: number): Promise<RefundResult> {
    // Kakao Pay refund implementation
  }
}

// Naver Pay Integration
class NaverPayProvider implements PaymentProvider {
  async initiatePayment(params: PaymentParams): Promise<PaymentInitiation> {
    // Similar structure for Naver Pay
  }
}

// Toss Payments Integration
class TossPaymentsProvider implements PaymentProvider {
  async initiatePayment(params: PaymentParams): Promise<PaymentInitiation> {
    const response = await axios.post(
      'https://api.tosspayments.com/v1/payments',
      {
        orderId: params.booking_id,
        amount: params.total_amount,
        orderName: params.service_description,
        successUrl: `${process.env.APP_URL}/payment/success`,
        failUrl: `${process.env.APP_URL}/payment/fail`,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64')}`,
        },
      }
    );
    
    return {
      payment_key: response.data.paymentKey,
      redirect_url: response.data.checkout.url,
    };
  }
}

// Payment provider factory
class PaymentFactory {
  static getProvider(method: PaymentMethod): PaymentProvider {
    switch (method) {
      case 'kakao_pay':
        return new KakaoPayProvider();
      case 'naver_pay':
        return new NaverPayProvider();
      case 'toss':
        return new TossPaymentsProvider();
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }
}

// Payment workflow
async function processBookingPayment(booking: Booking, paymentMethod: PaymentMethod): Promise<Payment> {
  const provider = PaymentFactory.getProvider(paymentMethod);
  
  // Calculate amounts
  const breakdown = calculatePriceBreakdown(booking);
  
  // Create payment record
  const payment = await db.insert(payments).values({
    booking_id: booking.id,
    customer_id: booking.customer_id,
    artist_id: booking.artist_id,
    subtotal: breakdown.subtotal,
    platform_fee: breakdown.platform_fee,
    travel_fee: breakdown.travel_fee,
    total_amount: breakdown.total,
    currency: 'KRW',
    payment_method: paymentMethod,
    status: 'pending',
  }).returning();
  
  // Initiate payment with provider
  const initiation = await provider.initiatePayment({
    booking_id: booking.id,
    customer_id: booking.customer_id,
    total_amount: breakdown.total,
    service_description: `524 Beauty Service - ${booking.service_type}`,
  });
  
  // Store transaction ID
  await db.update(payments)
    .set({
      payment_provider_transaction_id: initiation.tid || initiation.payment_key,
    })
    .where(eq(payments.id, payment.id));
  
  return payment;
}

// Price calculation with Korean tax
function calculatePriceBreakdown(booking: Booking): PriceBreakdown {
  const subtotal = booking.services.reduce((sum, s) => sum + s.price, 0);
  const platform_fee = subtotal * 0.15;  // 15% commission
  const travel_fee = booking.travel_fee || 0;
  
  // VAT calculation (10% in Korea)
  const tax_amount = (subtotal + platform_fee + travel_fee) * 0.1;
  
  const total = subtotal + platform_fee + travel_fee + tax_amount;
  
  return {
    subtotal,
    platform_fee,
    travel_fee,
    tax_amount,
    discount_amount: 0,
    tip_amount: 0,
    total,
  };
}

// Artist payout processing
async function processArtistPayout(payment: Payment): Promise<void> {
  const artistPayoutAmount = payment.subtotal - payment.platform_fee;
  
  // Get artist bank account info
  const artist = await getArtistProfile(payment.artist_id);
  
  if (!artist.bank_account) {
    throw new Error('Artist bank account not configured');
  }
  
  // Process payout via banking API
  const payoutResult = await bankingAPI.transferFunds({
    recipient_bank: artist.bank_account.bank_code,
    recipient_account: artist.bank_account.account_number,
    recipient_name: artist.bank_account.account_holder,
    amount: artistPayoutAmount,
    description: `524 Service Payment - Booking ${payment.booking_id}`,
  });
  
  // Update payment record
  await db.update(payments)
    .set({
      payout_status: 'processed',
      payout_date: new Date(),
      payout_transaction_id: payoutResult.transaction_id,
    })
    .where(eq(payments.id, payment.id));
}
```

## Real-Time Features

### WebSocket Implementation for Messaging

```typescript
// packages/api/src/websocket/chat-socket.ts

import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

export function initializeChatSocket(io: Server) {
  // Redis adapter for horizontal scaling
  const pubClient = createRedisClient();
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
  
  io.use(async (socket, next) => {
    // Authenticate socket connection
    const token = socket.handshake.auth.token;
    try {
      const user = await verifyToken(token);
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });
  
  io.on('connection', (socket) => {
    const user = socket.data.user;
    
    // Join user's personal room
    socket.join(`user:${user.id}`);
    
    // Join conversation rooms
    socket.on('join_conversation', async (conversationId) => {
      // Verify user is part of this conversation
      const conversation = await getConversation(conversationId);
      if (conversation.customer_id === user.id || conversation.artist_id === user.id) {
        socket.join(`conversation:${conversationId}`);
      }
    });
    
    // Send message
    socket.on('send_message', async (data) => {
      const { conversation_id, content, message_type, images } = data;
      
      // Save message to database
      const message = await createMessage({
        conversation_id,
        sender_id: user.id,
        sender_role: user.role,
        content,
        message_type,
        images,
      });
      
      // Broadcast to conversation room
      io.to(`conversation:${conversation_id}`).emit('new_message', message);
      
      // Send push notification to recipient if offline
      const conversation = await getConversation(conversation_id);
      const recipientId = user.role === 'customer' 
        ? conversation.artist_id 
        : conversation.customer_id;
      
      await sendPushNotification(recipientId, {
        title: user.name,
        body: content,
        data: { conversation_id, message_id: message.id },
      });
    });
    
    // Typing indicator
    socket.on('typing_start', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        user_id: user.id,
        user_name: user.name,
      });
    });
    
    socket.on('typing_stop', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        user_id: user.id,
      });
    });
    
    // Mark messages as read
    socket.on('mark_read', async (messageIds) => {
      await markMessagesAsRead(messageIds, user.id);
      io.to(`user:${user.id}`).emit('messages_read', messageIds);
    });
    
    socket.on('disconnect', () => {
      // Cleanup
    });
  });
}
```

### Real-Time Booking Updates

```typescript
// Emit booking status changes to relevant users
export async function updateBookingStatus(
  bookingId: string, 
  newStatus: BookingStatus,
  io: Server
) {
  const booking = await getBooking(bookingId);
  
  // Update database
  await db.update(bookings)
    .set({
      status: newStatus,
      status_history: sql`array_append(status_history, ${JSON.stringify({
        status: newStatus,
        timestamp: new Date(),
      })})`,
      updated_at: new Date(),
    })
    .where(eq(bookings.id, bookingId));
  
  // Emit to customer
  io.to(`user:${booking.customer_id}`).emit('booking_updated', {
    booking_id: bookingId,
    status: newStatus,
  });
  
  // Emit to artist
  io.to(`user:${booking.artist_id}`).emit('booking_updated', {
    booking_id: bookingId,
    status: newStatus,
  });
  
  // Send push notifications
  await sendBookingStatusNotification(booking, newStatus);
}
```

## API Design

### RESTful Endpoints

```typescript
// ========================================
// AUTHENTICATION
// ========================================
POST   /api/v1/auth/phone/send-otp                // Send OTP to phone
POST   /api/v1/auth/phone/verify-otp              // Verify OTP and login/signup
POST   /api/v1/auth/kakao/login                   // Kakao OAuth login
POST   /api/v1/auth/naver/login                   // Naver OAuth login
POST   /api/v1/auth/apple/login                   // Apple Sign In
POST   /api/v1/auth/refresh                       // Refresh access token
POST   /api/v1/auth/logout                        // Logout (invalidate tokens)

// ========================================
// USER PROFILE
// ========================================
GET    /api/v1/users/me                          // Get current user profile
PUT    /api/v1/users/me                          // Update current user profile
DELETE /api/v1/users/me                          // Delete account
POST   /api/v1/users/me/photo                    // Upload profile photo

// Customer-specific
GET    /api/v1/customers/me/profile              // Get customer profile
PUT    /api/v1/customers/me/profile              // Update customer profile
GET    /api/v1/customers/me/addresses            // Get saved addresses
POST   /api/v1/customers/me/addresses            // Add address
PUT    /api/v1/customers/me/addresses/:id        // Update address
DELETE /api/v1/customers/me/addresses/:id        // Delete address

// Artist-specific
GET    /api/v1/artists/me/profile                // Get artist profile
PUT    /api/v1/artists/me/profile                // Update artist profile
POST   /api/v1/artists/me/verify                 // Submit verification documents
GET    /api/v1/artists/me/verification-status    // Check verification status

// ========================================
// ARTIST SERVICES & PORTFOLIO
// ========================================
GET    /api/v1/artists/:id/services              // Get artist's services
POST   /api/v1/artists/me/services               // Create service
PUT    /api/v1/artists/me/services/:id           // Update service
DELETE /api/v1/artists/me/services/:id           // Delete service

GET    /api/v1/artists/:id/portfolio             // Get artist's portfolio
POST   /api/v1/artists/me/portfolio              // Add portfolio image
PUT    /api/v1/artists/me/portfolio/:id          // Update portfolio image
DELETE /api/v1/artists/me/portfolio/:id          // Delete portfolio image
POST   /api/v1/artists/me/portfolio/reorder      // Reorder portfolio

// ========================================
// ARTIST DISCOVERY & SEARCH
// ========================================
GET    /api/v1/search/artists                    // Search artists
GET    /api/v1/artists/:id                       // Get artist public profile
GET    /api/v1/artists/:id/reviews               // Get artist reviews
GET    /api/v1/artists/:id/availability          // Check artist availability
GET    /api/v1/artists/nearby                    // Get artists near location
GET    /api/v1/artists/recommended               // Get recommended artists

// Query parameters for search:
// ?service_type=makeup
// ?occasion=wedding_ceremony
// &location=lat,lng
// &radius=10
// &date=2025-11-01
// &min_rating=4.5
// &sort_by=rating
// &gender=female

// ========================================
// BOOKINGS
// ========================================
POST   /api/v1/bookings                          // Create booking request
GET    /api/v1/bookings                          // Get user's bookings
GET    /api/v1/bookings/:id                      // Get booking details
PUT    /api/v1/bookings/:id                      // Update booking
DELETE /api/v1/bookings/:id                      // Cancel booking

// Customer actions
POST   /api/v1/bookings/:id/modify               // Request modification
POST   /api/v1/bookings/:id/cancel               // Cancel booking

// Artist actions
POST   /api/v1/bookings/:id/accept               // Accept booking request
POST   /api/v1/bookings/:id/decline              // Decline booking request
POST   /api/v1/bookings/:id/start                // Mark service started
POST   /api/v1/bookings/:id/complete             // Mark service completed
POST   /api/v1/bookings/:id/checklist            // Submit protocol checklist

// Filter parameters:
// ?status=confirmed,in_progress
// &date_from=2025-11-01
// &date_to=2025-11-30
// &role=customer (for artists to see their bookings as service provider)

// ========================================
// AVAILABILITY & SCHEDULING
// ========================================
GET    /api/v1/artists/:id/availability          // Get available time slots
GET    /api/v1/artists/me/calendar               // Get artist calendar
PUT    /api/v1/artists/me/working-hours          // Update working hours
POST   /api/v1/artists/me/time-off               // Block time off
DELETE /api/v1/artists/me/time-off/:id           // Remove blocked time

// ========================================
// PAYMENTS
// ========================================
POST   /api/v1/payments/initiate                 // Initiate payment
POST   /api/v1/payments/:id/confirm              // Confirm payment
GET    /api/v1/payments/:id                      // Get payment details
GET    /api/v1/payments                          // Get payment history
POST   /api/v1/payments/:id/refund               // Request refund
POST   /api/v1/payments/:id/tip                  // Add tip after service

// Artist payouts
GET    /api/v1/artists/me/earnings               // Get earnings summary
GET    /api/v1/artists/me/payouts                // Get payout history
POST   /api/v1/artists/me/payout-account         // Set payout account
GET    /api/v1/artists/me/payout-account         // Get payout account

// ========================================
// MESSAGING
// ========================================
GET    /api/v1/conversations                     // Get user's conversations
GET    /api/v1/conversations/:id                 // Get conversation details
GET    /api/v1/conversations/:id/messages        // Get messages
POST   /api/v1/conversations                     // Start new conversation
POST   /api/v1/conversations/:id/messages        // Send message
PUT    /api/v1/conversations/:id/read            // Mark conversation as read
DELETE /api/v1/conversations/:id                 // Archive conversation

// ========================================
// REVIEWS & RATINGS
// ========================================
POST   /api/v1/bookings/:id/review               // Leave review
GET    /api/v1/reviews                           // Get user's reviews (given/received)
GET    /api/v1/reviews/:id                       // Get review details
PUT    /api/v1/reviews/:id                       // Update review
DELETE /api/v1/reviews/:id                       // Delete review
POST   /api/v1/reviews/:id/response              // Artist responds to review
POST   /api/v1/reviews/:id/helpful               // Mark review as helpful
POST   /api/v1/reviews/:id/report                // Report inappropriate review

// ========================================
// NOTIFICATIONS
// ========================================
GET    /api/v1/notifications                     // Get notifications
PUT    /api/v1/notifications/:id/read            // Mark notification as read
PUT    /api/v1/notifications/read-all            // Mark all as read
PUT    /api/v1/notifications/settings            // Update notification preferences
POST   /api/v1/notifications/register-token      // Register FCM token

// ========================================
// ANALYTICS (Artist)
// ========================================
GET    /api/v1/artists/me/analytics              // Get analytics dashboard
GET    /api/v1/artists/me/analytics/earnings     // Earnings breakdown
GET    /api/v1/artists/me/analytics/bookings     // Booking stats
GET    /api/v1/artists/me/analytics/performance  // Performance metrics
GET    /api/v1/artists/me/analytics/customers    // Customer insights

// ========================================
// ADMIN
// ========================================
GET    /api/v1/admin/users                       // Get all users
GET    /api/v1/admin/bookings                    // Get all bookings
GET    /api/v1/admin/analytics                   // Platform analytics
POST   /api/v1/admin/users/:id/verify            // Verify user
POST   /api/v1/admin/users/:id/suspend           // Suspend user
GET    /api/v1/admin/violations                  // Get protocol violations
POST   /api/v1/admin/violations/:id/resolve      // Resolve violation

// ========================================
// UTILITIES
// ========================================
POST   /api/v1/upload/image                      // Upload image to S3
GET    /api/v1/locations/search                  // Search Korean addresses
GET    /api/v1/locations/geocode                 // Geocode address
GET    /api/v1/occasions                         // Get all occasion types
GET    /api/v1/service-categories                // Get service categories
```

## Korean Market Localization

### i18n Implementation

```typescript
// packages/shared/locales/ko.json
{
  "common": {
    "app_name": "524",
    "tagline": "어디서 예뻐지실 건가요?",
    "book_service": "서비스 예약",
    "cancel": "취소",
    "confirm": "확인",
    "save": "저장",
    "delete": "삭제",
    "edit": "수정",
    "back": "뒤로",
    "next": "다음",
    "loading": "로딩중...",
    "error": "오류가 발생했습니다"
  },
  "auth": {
    "phone_number": "전화번호",
    "phone_placeholder": "010-1234-5678",
    "send_code": "인증번호 전송",
    "verification_code": "인증번호",
    "verify": "인증하기",
    "login": "로그인",
    "signup": "회원가입",
    "kakao_login": "카카오로 시작하기",
    "naver_login": "네이버로 시작하기",
    "apple_login": "Apple로 계속하기"
  },
  "service_types": {
    "hair": "헤어",
    "makeup": "메이크업",
    "combo": "헤어 + 메이크업"
  },
  "occasions": {
    "blind_date": "소개팅",
    "date": "데이트",
    "dance_sport": "댄스스포츠",
    "exercise_class": "운동클래스",
    "beauty_pageant": "미인대회",
    "flight_attendant": "승무원",
    "daily": "데일리",
    "profile_photo": "개인 프로필",
    "announcer": "아나운서",
    "body_photo": "바디",
    "professional_photo": "전업사진",
    "doljanchi": "돌잔치",
    "sanggyeonrye": "상견례",
    "pre_wedding": "전날제 결혼식",
    "wedding_ceremony": "본식 결혼식"
  },
  "booking": {
    "select_service": "서비스 선택",
    "select_occasion": "오늘의 일정은 무엇인가요?",
    "select_artist": "아티스트 선택",
    "select_date": "날짜 선택",
    "select_time": "시간 선택",
    "special_requests": "특별 요청사항",
    "total_amount": "총 금액",
    "booking_number": "예약 번호",
    "time_guarantee": "40분 완성 보장"
  },
  "payment": {
    "kakao_pay": "카카오페이",
    "naver_pay": "네이버페이",
    "toss": "토스",
    "card": "카드",
    "subtotal": "서비스 금액",
    "platform_fee": "플랫폼 수수료",
    "travel_fee": "출장비",
    "tip": "팁",
    "total": "총 결제금액",
    "vat_included": "부가세 포함"
  }
}

// packages/mobile/src/i18n/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from '../../shared/locales/ko.json';
import en from '../../shared/locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
    },
    lng: 'ko',
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### Korean Address Handling

```typescript
// packages/api/src/services/location-service.ts

import axios from 'axios';

// Kakao Local API for address search
export async function searchKoreanAddress(query: string): Promise<AddressResult[]> {
  const response = await axios.get('https://dapi.kakao.com/v2/local/search/address.json', {
    headers: {
      Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
    },
    params: {
      query,
      size: 10,
    },
  });
  
  return response.data.documents.map((doc: any) => ({
    full_address_korean: doc.address_name,
    sido: doc.address.region_1depth_name,
    sigungu: doc.address.region_2depth_name,
    dong: doc.address.region_3depth_name,
    road_name: doc.road_address?.road_name,
    building_number: doc.road_address?.main_building_no,
    building_name: doc.road_address?.building_name,
    postal_code: doc.road_address?.zone_no,
    latitude: parseFloat(doc.y),
    longitude: parseFloat(doc.x),
  }));
}

// Distance calculation for service radius
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
```

### Korean Business Registration Verification

```typescript
// National Tax Service API integration
export async function verifyBusinessRegistration(
  businessNumber: string,
  startDate: string,
  ownerName: string
): Promise<VerificationResult> {
  // Format: 123-45-67890
  const formatted = businessNumber.replace(/-/g, '');
  
  try {
    const response = await axios.post(
      'https://api.odcloud.kr/api/nts-businessman/v1/status',
      {
        businesses: [
          {
            b_no: formatted,
            start_dt: startDate,
            p_nm: ownerName,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Infuser ${process.env.NTS_API_KEY}`,
        },
      }
    );
    
    const result = response.data.data[0];
    
    return {
      is_valid: result.b_stt === '계속사업자',
      business_number: formatted,
      status: result.b_stt,
      company_name: result.company,
      tax_type: result.tax_type,
    };
  } catch (error) {
    return {
      is_valid: false,
      error: 'Verification failed',
    };
  }
}
```

## Real-Time Features

### WebSocket Implementation for Messaging

```typescript
// packages/api/src/websocket/chat-socket.ts

import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

export function initializeChatSocket(io: Server) {
  // Redis adapter for horizontal scaling
  const pubClient = createRedisClient();
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
  
  io.use(async (socket, next) => {
    // Authenticate socket connection
    const token = socket.handshake.auth.token;
    try {
      const user = await verifyToken(token);
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });
  
  io.on('connection', (socket) => {
    const user = socket.data.user;
    
    // Join user's personal room
    socket.join(`user:${user.id}`);
    
    // Send message
    socket.on('send_message', async (data) => {
      const { conversation_id, content, message_type, images } = data;
      
      const message = await createMessage({
        conversation_id,
        sender_id: user.id,
        sender_role: user.role,
        content,
        message_type,
        images,
      });
      
      // Broadcast to conversation room
      io.to(`conversation:${conversation_id}`).emit('new_message', message);
    });
    
    // Typing indicators
    socket.on('typing_start', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        user_id: user.id,
      });
    });
    
    socket.on('disconnect', () => {
      // Cleanup
    });
  });
}
```

## Performance Optimization

### Caching Strategy

```typescript
// packages/api/src/cache/redis-cache.ts

export class CacheService {
  // Cache artist search results
  async cacheArtistSearchResults(query: SearchQuery, results: Artist[]): Promise<void> {
    const key = `search:${JSON.stringify(query)}`;
    await redis.setex(key, 300, JSON.stringify(results)); // 5 min cache
  }
  
  // Cache artist availability
  async cacheArtistAvailability(artistId: string, date: string, slots: TimeSlot[]): Promise<void> {
    const key = `availability:${artistId}:${date}`;
    await redis.setex(key, 600, JSON.stringify(slots)); // 10 min cache
  }
  
  // Real-time booking status
  async getBookingStatus(bookingId: string): Promise<BookingStatus | null> {
    const key = `booking:status:${bookingId}`;
    const status = await redis.get(key);
    return status as BookingStatus;
  }
  
  async setBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    const key = `booking:status:${bookingId}`;
    await redis.setex(key, 3600, status); // 1 hour
  }
  
  // Session management
  async storeUserSession(userId: string, sessionData: any): Promise<void> {
    const key = `session:${userId}`;
    await redis.setex(key, 86400, JSON.stringify(sessionData)); // 24 hours
  }
}
```

### Database Indexing Strategy

```sql
-- Performance-critical indexes for PostgreSQL

-- User lookups by multiple auth methods
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_users_kakao_id ON users(kakao_id);
CREATE INDEX idx_users_naver_id ON users(naver_id);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);

-- Booking queries
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_artist_id ON bookings(artist_id);
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);

-- Composite indexes for common queries
CREATE INDEX idx_bookings_customer_status ON bookings(customer_id, status);
CREATE INDEX idx_bookings_artist_status ON bookings(artist_id, status);
CREATE INDEX idx_bookings_date_status ON bookings(scheduled_date, status);

-- Location-based searches (PostGIS)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE INDEX idx_artist_profiles_location ON artist_profiles USING GIST (
  ST_MakePoint(
    (primary_location->>'longitude')::float,
    (primary_location->>'latitude')::float
  )
);

-- Review lookups
CREATE INDEX idx_reviews_artist_id ON reviews(artist_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);

-- Messaging
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_conversations_artist_id ON conversations(artist_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Payment tracking
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_artist_id ON payments(artist_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payout_status ON payments(payout_status);
```

## Security Measures

### Data Encryption

```typescript
// packages/api/src/security/encryption.ts

import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Encrypt sensitive fields before storing in database
export async function encryptSensitiveData(data: any): Promise<any> {
  const encrypted = { ...data };
  
  if (data.bank_account) {
    encrypted.bank_account = encrypt(JSON.stringify(data.bank_account));
  }
  
  if (data.tax_id) {
    encrypted.tax_id = encrypt(data.tax_id);
  }
  
  if (data.medical_notes) {
    encrypted.medical_notes = encrypt(data.medical_notes);
  }
  
  return encrypted;
}
```

### Rate Limiting

```typescript
// packages/api/src/middleware/rate-limit.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// General API rate limit
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
});

// OTP sending rate limit (prevent SMS spam)
export const otpLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:otp:',
  }),
  windowMs: 60 * 1000,       // 1 minute
  max: 3,                    // 3 OTP sends per minute
  skipSuccessfulRequests: true,
  message: 'OTP 요청이 너무 많습니다. 1분 후 다시 시도해주세요.',
});

// Payment processing rate limit
export const paymentLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:payment:',
  }),
  windowMs: 60 * 1000,
  max: 5,
  message: '결제 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
});

// Booking creation rate limit
export const bookingLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:booking:',
  }),
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,                   // 10 bookings per hour
  message: '예약 생성이 너무 많습니다. 잠시 후 다시 시도해주세요.',
});
```

## Testing Strategy

### Unit Testing

```typescript
// packages/api/tests/services/booking-service.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { BookingService } from '../../src/services/booking-service';

describe('BookingService', () => {
  let bookingService: BookingService;
  
  beforeEach(() => {
    bookingService = new BookingService();
  });
  
  describe('calculatePriceBreakdown', () => {
    it('should calculate correct total with platform fee and VAT', () => {
      const booking = {
        services: [
          { price: 50000 },
          { price: 30000 },
        ],
        travel_fee: 10000,
      };
      
      const breakdown = bookingService.calculatePriceBreakdown(booking);
      
      expect(breakdown.subtotal).toBe(80000);
      expect(breakdown.platform_fee).toBe(12000);  // 15%
      expect(breakdown.travel_fee).toBe(10000);
      expect(breakdown.tax_amount).toBe(10200);    // 10% VAT
      expect(breakdown.total).toBe(112200);
    });
  });
  
  describe('checkTimeCompliance', () => {
    it('should flag makeup services exceeding 40 minutes', async () => {
      const booking = {
        id: 'test-id',
        service_type: 'makeup',
        service_started_at: new Date('2025-11-01T10:00:00'),
        service_completed_at: new Date('2025-11-01T10:45:00'),
      };
      
      const result = await bookingService.checkTimeCompliance(booking);
      
      expect(result.within_time_limit).toBe(false);
      expect(result.actual_duration_minutes).toBe(45);
    });
  });
});
```

### Integration Testing

```typescript
// packages/api/tests/integration/booking-flow.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/db';

describe('Booking Flow Integration', () => {
  let customerToken: string;
  let artistToken: string;
  let bookingId: string;
  
  beforeAll(async () => {
    await setupTestDatabase();
    
    // Create test users and get tokens
    customerToken = await createTestCustomer();
    artistToken = await createTestArtist();
  });
  
  afterAll(async () => {
    await cleanupTestDatabase();
  });
  
  it('should complete full booking flow', async () => {
    // 1. Customer creates booking request
    const createResponse = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        artist_id: 'test-artist-id',
        service_type: 'makeup',
        occasion: 'wedding_ceremony',
        scheduled_date: '2025-11-15',
        scheduled_start_time: '2025-11-15T14:00:00',
      });
    
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.status).toBe('pending');
    bookingId = createResponse.body.id;
    
    // 2. Artist accepts booking
    const acceptResponse = await request(app)
      .post(`/api/v1/bookings/${bookingId}/accept`)
      .set('Authorization', `Bearer ${artistToken}`);
    
    expect(acceptResponse.status).toBe(200);
    expect(acceptResponse.body.status).toBe('confirmed');
    
    // 3. Customer completes payment
    const paymentResponse = await request(app)
      .post('/api/v1/payments/initiate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        booking_id: bookingId,
        payment_method: 'kakao_pay',
      });
    
    expect(paymentResponse.status).toBe(200);
    expect(paymentResponse.body.redirect_url).toBeDefined();
    
    // 4. Artist starts service
    const startResponse = await request(app)
      .post(`/api/v1/bookings/${bookingId}/start`)
      .set('Authorization', `Bearer ${artistToken}`);
    
    expect(startResponse.status).toBe(200);
    expect(startResponse.body.status).toBe('in_progress');
    
    // 5. Artist completes service with checklist
    const completeResponse = await request(app)
      .post(`/api/v1/bookings/${bookingId}/complete`)
      .set('Authorization', `Bearer ${artistToken}`)
      .send({
        protocol_checklist: {
          behind_ear_completed: true,
          customer_hair_managed: true,
          quality_confirmed: true,
          no_personal_info_requested: true,
          within_time_limit: true,
        },
      });
    
    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.status).toBe('completed');
    
    // 6. Customer leaves review
    const reviewResponse = await request(app)
      .post(`/api/v1/bookings/${bookingId}/review`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        overall_rating: 5,
        review_text: '매우 만족스러운 서비스였습니다!',
      });
    
    expect(reviewResponse.status).toBe(201);
    expect(reviewResponse.body.overall_rating).toBe(5);
  });
});
```

## Deployment & DevOps

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy 524

on:
  push:
    branches:
      - main
      - staging
  pull_request:
    branches:
      - main

env:
  NODE_VERSION: '20'
  DOCKER_REGISTRY: ghcr.io
  IMAGE_NAME: 524-app

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
          
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build-api:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.DOCKER_REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: ./packages/api
          push: true
          tags: |
            ${{ env.DOCKER_REGISTRY }}/${{ github.repository }}/${{ env.IMAGE_NAME }}-api:${{ github.sha }}
            ${{ env.DOCKER_REGISTRY }}/${{ github.repository }}/${{ env.IMAGE_NAME }}-api:latest
  
  deploy-staging:
    needs: [test, build-api]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/staging'
    environment: staging
    
    steps:
      - name: Deploy to staging
        run: |
          # Deploy to Naver Cloud Platform or AWS Seoul
          # Update ECS service or K8s deployment
  
  deploy-production:
    needs: [test, build-api]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Deploy to production
        run: |
          # Deploy to production environment
          # Update ECS service or K8s deployment with blue-green strategy

  build-mobile:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        working-directory: ./packages/mobile
        run: npm ci
      
      - name: Build Android
        working-directory: ./packages/mobile
        run: eas build --platform android --non-interactive
      
      - name: Build iOS
        working-directory: ./packages/mobile
        run: eas build --platform ios --non-interactive
      
      - name: Submit to stores
        working-directory: ./packages/mobile
        run: eas submit --latest --non-interactive
```

### Infrastructure as Code (Terraform)

```hcl
# infrastructure/terraform/main.tf

terraform {
  required_version = ">= 1.0"
  
  backend "s3" {
    bucket = "524-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "ap-northeast-2"
  }
}

provider "aws" {
  region = "ap-northeast-2"  # Seoul
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "524-vpc"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier           = "524-postgres"
  engine              = "postgres"
  engine_version      = "15.4"
  instance_class      = "db.t3.medium"
  allocated_storage   = 100
  storage_encrypted   = true
  
  db_name             = "beauty_marketplace"
  username            = var.db_username
  password            = var.db_password
  
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"
  
  tags = {
    Name = "524-postgres"
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "524-redis"
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.t3.medium"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
  
  tags = {
    Name = "524-redis"
  }
}

# ECS Cluster for API
resource "aws_ecs_cluster" "main" {
  name = "524-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# S3 for file storage
resource "aws_s3_bucket" "assets" {
  bucket = "524-assets"
  
  tags = {
    Name = "524-assets"
  }
}

# CloudFront CDN
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  price_class         = "PriceClass_200"  # US, Europe, Asia
  
  origin {
    domain_name = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id   = "S3-assets"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-assets"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
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

## Monitoring & Analytics

### Application Monitoring

```typescript
// packages/api/src/monitoring/metrics.ts

import { Counter, Histogram, Gauge } from 'prom-client';

// Booking metrics
export const bookingCreatedCounter = new Counter({
  name: 'bookings_created_total',
  help: 'Total number of bookings created',
  labelNames: ['service_type', 'occasion'],
});

export const bookingCompletedCounter = new Counter({
  name: 'bookings_completed_total',
  help: 'Total number of completed bookings',
  labelNames: ['service_type'],
});

export const bookingCancelledCounter = new Counter({
  name: 'bookings_cancelled_total',
  help: 'Total number of cancelled bookings',
  labelNames: ['cancelled_by', 'reason'],
});

// Payment metrics
export const paymentProcessedCounter = new Counter({
  name: 'payments_processed_total',
  help: 'Total number of processed payments',
  labelNames: ['payment_method', 'status'],
});

export const paymentAmountHistogram = new Histogram({
  name: 'payment_amount_krw',
  help: 'Distribution of payment amounts in KRW',
  buckets: [10000, 30000, 50000, 100000, 200000, 500000],
});

// Service time compliance
export const serviceTimeHistogram = new Histogram({
  name: 'service_duration_minutes',
  help: 'Distribution of service durations',
  labelNames: ['service_type'],
  buckets: [10, 20, 30, 40, 50, 60, 90, 120],
});

export const timeLimitBreachCounter = new Counter({
  name: 'time_limit_breaches_total',
  help: 'Total number of time limit breaches',
  labelNames: ['service_type'],
});

// Protocol violations
export const protocolViolationCounter = new Counter({
  name: 'protocol_violations_total',
  help: 'Total number of protocol violations',
  labelNames: ['violation_type', 'severity'],
});

// Active bookings gauge
export const activeBookingsGauge = new Gauge({
  name: 'active_bookings_count',
  help: 'Current number of active bookings',
  labelNames: ['status'],
});

// API performance
export const apiResponseTimeHistogram = new Histogram({
  name: 'api_response_time_ms',
  help: 'API response time in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
});
```

### Error Tracking (Sentry)

```typescript
// packages/api/src/monitoring/sentry.ts

import * as Sentry from '@sentry/node';
import '@sentry/tracing';

export function initializeSentry(app: Express) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
    ],
    
    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        
        // Remove sensitive headers
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['x-api-key'];
        }
      }
      
      return event;
    },
  });
  
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}
```

## Compliance Requirements (Korean Market)

### Data Protection (PIPA)
- User consent management for data collection
- Right to data deletion
- Data encryption at rest and in transit
- Audit logging for sensitive operations

### Payment Compliance
- PG (Payment Gateway) registration required
- Transaction reporting requirements
- VAT collection (10%) and reporting

### Business Registration
- Business registration number verification via National Tax Service API
- Tax invoice generation for services

## Monitoring & Observability

### Prometheus Metrics
- Booking lifecycle metrics
- Payment processing metrics
- API performance metrics (response time, error rates)
- Service duration tracking
- Database query performance

### Error Tracking
- Sentry for exception tracking
- Sensitive data filtering in error reports
- Source map support for debugging

### Logging
- Structured logging with Winston
- Log aggregation (e.g., CloudWatch, DataDog)
- Audit logs for sensitive operations

### Alerting
- Critical error alerts
- Payment processing failures
- Service availability monitoring
- Database performance degradation

## Summary

This technical specification outlines the architecture for 524, a beauty services marketplace platform optimized for the Korean market.

**Core Technologies:**
- Mobile: React Native with TypeScript
- Backend: Node.js/Express with PostgreSQL (Drizzle ORM)
- Infrastructure: AWS Seoul region
- Real-time: Socket.io for messaging
- Caching: Redis for session management and performance
- Storage: AWS S3 with CloudFront CDN

**Korean Market Integrations:**
- Authentication: Phone OTP via SENS, Kakao/Naver/Apple OAuth
- Payments: Kakao Pay, Naver Pay, Toss integration
- Location: Korean address system with Kakao Local API
- Compliance: PIPA data protection requirements
- Business verification: National Tax Service API

**Architecture Highlights:**
- Multi-provider payment processing with retry logic
- Real-time bidirectional messaging with Socket.io
- Location-based artist search using PostGIS
- AES-256-GCM encryption for sensitive data
- Comprehensive rate limiting
- RESTful API with 50+ endpoints
- Horizontal scalability via Redis adapter
- Automated testing with Vitest
- CI/CD pipeline with GitHub Actions
- Infrastructure as Code with Terraform

The system is designed as a two-sided marketplace supporting both customer and artist workflows while maintaining regulatory compliance and data security standards required for the Korean market.
