# 524 Mobile App Specification Document

> **Purpose**: Complete inventory of all screens, data collection, data usage, and identified gaps.
> **Last Updated**: January 2026
> **For**: Designers, developers, and product team

---

## Table of Contents

1. [User Types & Roles](#1-user-types--roles)
2. [Screen Inventory](#2-screen-inventory)
3. [Authentication Flow](#3-authentication-flow)
4. [Customer Onboarding Flow](#4-customer-onboarding-flow)
5. [Booking Flow](#5-booking-flow)
6. [Artist Onboarding Flow](#6-artist-onboarding-flow)
7. [Booking Management](#7-booking-management)
8. [Reviews System](#8-reviews-system)
9. [Messaging System](#9-messaging-system)
10. [Home & Notifications](#10-home--notifications)
11. [Data Flow Summary](#11-data-flow-summary)
12. [Critical Gaps & Issues](#12-critical-gaps--issues)
13. [Recommendations](#13-recommendations)

---

## 1. User Types & Roles

The app supports two distinct user types:

| Role | Description | Entry Point |
|------|-------------|-------------|
| **Customer** | Seeks beauty services (hair, makeup) | SignupScreen |
| **Artist** | Provides beauty services | ArtistSignupScreen |

---

## 2. Screen Inventory

### 2.1 Complete Screen List (41 Screens)

#### Authentication Screens
| Screen | File | Purpose |
|--------|------|---------|
| LoginScreen | `LoginScreen.tsx` | Router - directs to Dev or Production login |
| NewLoginScreen | `NewLoginScreen.tsx` | Production login (Figma design) |
| DevLoginScreen | `DevLoginScreen.tsx` | Development login with test accounts |
| SignupScreen | `SignupScreen.tsx` | Customer account creation |
| ArtistSignupScreen | `ArtistSignupScreen.tsx` | Artist account creation |
| SignupConfirmationScreen | `SignupConfirmationScreen.tsx` | Post-signup confirmation |

#### Customer Onboarding Screens
| Screen | File | Purpose |
|--------|------|---------|
| OnboardingFlowScreen | `OnboardingFlowScreen.tsx` | Multi-step onboarding orchestrator |
| OnboardingLookalikeScreen | `OnboardingLookalikeScreen.tsx` | Celebrity lookalike question |
| OnboardingServicesScreen | `OnboardingServicesScreen.tsx` | Service interest selection |

#### Booking Flow Screens (Entry)
| Screen | File | Purpose |
|--------|------|---------|
| BookingFlowScreen | `booking/BookingFlowScreen.tsx` | Booking wizard orchestrator |
| LocationInputScreen | `booking/entry/LocationInputScreen.tsx` | Service location input |
| CelebrityInputScreen | `booking/entry/CelebrityInputScreen.tsx` | 3-step celebrity questions |
| CelebrityResultScreen | `booking/entry/CelebrityResultScreen.tsx` | Celebrity result display |
| IdolQuestionScreen | `booking/entry/IdolQuestionScreen.tsx` | Idol dropdown selection |
| IdolConfirmationScreen | `booking/entry/IdolConfirmationScreen.tsx` | Confirm idol selection |
| ServiceSelectionScreen | `booking/entry/ServiceSelectionScreen.tsx` | Hair/Makeup/Combo selection |

#### Booking Flow Screens (Common)
| Screen | File | Purpose |
|--------|------|---------|
| OccasionSelectionScreen | `booking/common/OccasionSelectionScreen.tsx` | Event occasion selection |
| ScheduleSelectionScreen | `booking/common/ScheduleSelectionScreen.tsx` | Date/time selection |
| BookingMethodScreen | `booking/common/BookingMethodScreen.tsx` | Booking method type |

#### Booking Flow Screens (Artist Selection)
| Screen | File | Purpose |
|--------|------|---------|
| ArtistListScreen | `booking/artist/ArtistListScreen.tsx` | Browse/filter artists |
| ArtistDetailScreen | `booking/artist/ArtistDetailScreen.tsx` | Artist profile in booking context |

#### Booking Flow Screens (Treatment)
| Screen | File | Purpose |
|--------|------|---------|
| TreatmentSelectionScreen | `booking/treatment/TreatmentSelectionScreen.tsx` | Specific treatment selection |
| StyleSelectionScreen | `booking/treatment/StyleSelectionScreen.tsx` | Style image selection/upload |

#### Booking Flow Screens (Checkout)
| Screen | File | Purpose |
|--------|------|---------|
| PaymentConfirmationScreen | `booking/checkout/PaymentConfirmationScreen.tsx` | Review & confirm payment |
| BookingCompleteScreen | `booking/checkout/BookingCompleteScreen.tsx` | Success confirmation |

#### Booking Management Screens
| Screen | File | Purpose |
|--------|------|---------|
| HomeScreen | `HomeScreen.tsx` | Customer home/dashboard |
| BookingsListScreen | `BookingsListScreen.tsx` | Customer booking list |
| BookingDetailScreen | `BookingDetailScreen.tsx` | Customer booking details |
| BookingSummaryScreen | `BookingSummaryScreen.tsx` | Pre-confirmation summary |

#### Artist Screens
| Screen | File | Purpose |
|--------|------|---------|
| ArtistOnboardingFlowScreen | `ArtistOnboardingFlowScreen.tsx` | 4-step artist profile setup |
| ArtistPendingScreen | `ArtistPendingScreen.tsx` | Waiting for admin approval |
| ArtistBookingsListScreen | `ArtistBookingsListScreen.tsx` | Artist's booking requests |
| ArtistBookingDetailScreen | `ArtistBookingDetailScreen.tsx` | Booking detail for artist |
| ArtistProfileScreen | `ArtistProfileScreen.tsx` | Public artist profile |
| ArtistReviewsScreen | `ArtistReviewsScreen.tsx` | Reviews received by artist |

#### Review Screens
| Screen | File | Purpose |
|--------|------|---------|
| ReviewSubmissionScreen | `ReviewSubmissionScreen.tsx` | Write review for booking |
| ReviewConfirmationScreen | `ReviewConfirmationScreen.tsx` | Review submitted success |
| MyReviewsScreen | `MyReviewsScreen.tsx` | Customer's written reviews |

#### Communication Screens
| Screen | File | Purpose |
|--------|------|---------|
| ChatsListScreen | `ChatsListScreen.tsx` | Conversation list |
| ChatScreen | `ChatScreen.tsx` | Individual chat |
| NotificationInboxScreen | `NotificationInboxScreen.tsx` | Notification history |

---

## 3. Authentication Flow

### 3.1 Customer Signup

**Screen**: `SignupScreen.tsx`

| Field | Type | Validation | Stored In | Displayed Where | Purpose |
|-------|------|------------|-----------|-----------------|---------|
| Name | String | 2-100 chars | `users.name` | Header greeting | Identification |
| Email | String | Valid, unique | `users.email` | Never shown | Authentication |
| Password | String | 8+ chars, alphanumeric | `users.passwordHash` | Never | Authentication |
| Phone | String | Korean format (010-XXXX-XXXX) | `users.phoneNumber` | Never shown | Contact/verification |
| Date of Birth | Date | Valid past date | `users.birthYear` (year only) | **NEVER** | **UNUSED** |

**Gap Identified**: Birth year is collected but never used anywhere in the app.

### 3.2 Artist Signup

**Screen**: `ArtistSignupScreen.tsx`

| Field | Type | Validation | Stored In | Displayed Where | Purpose |
|-------|------|------------|-----------|-----------------|---------|
| Email | String | Valid, unique | `users.email` | Never shown | Authentication |
| Password | String | 8+ chars, alphanumeric | `users.passwordHash` | Never | Authentication |

**Note**: Artists provide minimal info at signup, then complete profile in onboarding.

---

## 4. Customer Onboarding Flow

**Condition**: Enabled via `EXPO_PUBLIC_SHOW_CUSTOMER_ONBOARDING` feature flag

### 4.1 OnboardingFlowScreen (Celebrity Questions)

**Input Type**: Controlled by `EXPO_PUBLIC_ONBOARDING_INPUT_TYPE`

| Field | Question (Korean) | Stored In | Displayed To Customer | Displayed To Artist | Purpose |
|-------|-------------------|-----------|----------------------|---------------------|---------|
| `celebrity_lookalike` | "비슷하다고 들어본 연예인" (Celebrity you've been told you look like) | `onboarding_responses` | CelebrityResultScreen | **NEVER** | Style matching |
| `celebrity_similar_image` | "비슷한 이미지 원하는 연예인" (Celebrity image you want) | `onboarding_responses` | CelebrityResultScreen | **NEVER** | Style matching |
| `celebrity_admire` | "예쁘다고 생각하는 연예인" (Celebrity you think is pretty) | `onboarding_responses` | CelebrityResultScreen | **NEVER** | Style matching |
| `resultCelebrity` | Computed result | `onboarding_responses` | CelebrityResultScreen | **NEVER** | Style matching |

### 4.2 OnboardingServicesScreen

| Field | Options | Stored In | Displayed Where | Purpose |
|-------|---------|-----------|-----------------|---------|
| `service_interests` | Hair, Makeup, Hair + Makeup | `onboarding_responses` | **NEVER** | Personalization |

### Critical Gap: Celebrity/Idol Data

The onboarding configuration has a `shareWithStylist: true` flag, but this is **never implemented**:

```
COLLECTED → STORED → NEVER SHARED WITH ARTIST
```

**Impact**: Artists have no visibility into customer's style preferences, defeating the purpose of collecting this data.

---

## 5. Booking Flow

### 5.1 Flow Overview

```
Celebrity Path:
LocationInput → ServiceSelection → OccasionSelection → ScheduleSelection →
ArtistList → TreatmentSelection → StyleSelection → PaymentConfirmation → BookingComplete

Direct Path:
ServiceSelection → OccasionSelection → ScheduleSelection →
ArtistList → TreatmentSelection → StyleSelection → PaymentConfirmation → BookingComplete
```

### 5.2 Location Input

**Screen**: `LocationInputScreen.tsx`

| Field | Type | Stored In | Displayed To Customer | Displayed To Artist | Status |
|-------|------|-----------|----------------------|---------------------|--------|
| `location` | Address string | `bookings.serviceLocation` | PaymentConfirmation, BookingDetail | ArtistBookingDetail | Working |
| `locationCoordinates` | {lat, lng} | `bookings.address` | Not shown | Not shown | Working |
| `locationNotes` | Text | `bookings.locationNotes` | **NEVER** | **NEVER** | **NOT DISPLAYED** |

### 5.3 Celebrity/Idol Questions (Booking Flow)

**Screen**: `CelebrityInputScreen.tsx` or `IdolQuestionScreen.tsx`

| Field | Stored In | Displayed To Customer | Displayed To Artist | Status |
|-------|-----------|----------------------|---------------------|--------|
| `celebrities.lookalike` | **NOT SAVED** | CelebrityResultScreen (session only) | **NEVER** | **NOT PERSISTED** |
| `celebrities.similarImage` | **NOT SAVED** | CelebrityResultScreen (session only) | **NEVER** | **NOT PERSISTED** |
| `celebrities.admire` | **NOT SAVED** | CelebrityResultScreen (session only) | **NEVER** | **NOT PERSISTED** |
| `resultCelebrity` | **NOT SAVED** | CelebrityResultScreen (session only) | **NEVER** | **NOT PERSISTED** |

**Critical Gap**: Celebrity data collected during booking is **never saved to the database** and **never shown to artists**.

### 5.4 Service Selection

**Screen**: `ServiceSelectionScreen.tsx`

| Field | Options | Stored In | Displayed Where | Status |
|-------|---------|-----------|-----------------|--------|
| `serviceType` | hair, makeup, combo | `bookings.serviceType` | **NEVER** | **NOT DISPLAYED** |

### 5.5 Occasion Selection

**Screen**: `OccasionSelectionScreen.tsx`

| Field | Options | Stored In | Displayed Where | Status |
|-------|---------|-----------|-----------------|--------|
| `occasion` | 결혼식, 상견례, 소개팅, etc. | `bookings.occasion` | **NEVER** | **NOT DISPLAYED** |

**Gap**: Occasion is stored but never shown to customer or artist in booking details.

### 5.6 Schedule Selection

**Screen**: `ScheduleSelectionScreen.tsx`

| Field | Type | Stored In | Displayed To Customer | Displayed To Artist | Status |
|-------|------|-----------|----------------------|---------------------|--------|
| `selectedDate` | ISO date | `bookings.scheduledDate` | BookingDetail | ArtistBookingDetail | Working |
| `selectedTimeSlot` | HH:MM | `bookings.scheduledStartTime` | BookingDetail | ArtistBookingDetail | Working |

### 5.7 Artist Selection

**Screen**: `ArtistListScreen.tsx`

| Field | Type | Stored In | Status |
|-------|------|-----------|--------|
| `selectedArtistId` | UUID | `bookings.artistId` | Working |
| `artistSortType` | Enum | **NOT SAVED** | Session only |
| `artistFilterApplied` | Boolean | **NOT SAVED** | Session only |

### 5.8 Treatment Selection

**Screen**: `TreatmentSelectionScreen.tsx`

| Field | Type | Stored In | Displayed Where | Status |
|-------|------|-----------|-----------------|--------|
| `selectedTreatments[]` | Array | `bookings.services` (JSONB) | PaymentConfirmation, BookingDetail, ArtistBookingDetail | Working |
| `totalAmount` | Number | `bookings.totalAmount` | PaymentConfirmation, BookingDetail | Working |
| `estimatedDuration` | Minutes | `bookings.totalDurationMinutes` | PaymentConfirmation, BookingDetail | Working |

### 5.9 Style Selection

**Screen**: `StyleSelectionScreen.tsx`

| Field | Type | Stored In | Displayed To Customer | Displayed To Artist | Status |
|-------|------|-----------|----------------------|---------------------|--------|
| `selectedStyles[]` | Array (max 3) | **NOT SAVED** | **NEVER** | **NEVER** | **NOT IMPLEMENTED** |
| `customStyleImage` | Image URI | **NOT SAVED** | **NEVER** | **NEVER** | **NOT IMPLEMENTED** |

**Critical Gap**: Style images are collected but **never sent to the API** despite `referenceImages` field existing in database schema.

### 5.10 Payment Confirmation

**Screen**: `PaymentConfirmationScreen.tsx`

| Field | Type | Stored In | Displayed Where | Status |
|-------|------|-----------|-----------------|--------|
| `customerNotes` | Text | `bookings.specialRequests` | **NEVER** | **NOT DISPLAYED** |

**Gap**: Customer notes are saved but never displayed to artist or in booking details.

---

## 6. Artist Onboarding Flow

**Condition**: Required when artist is missing `stageName`, `primaryLocation`, or `profileImageUrl`

### 6.1 Step 1: Basic Information

| Field | Type | Validation | Stored In | Displayed Where | Status |
|-------|------|------------|-----------|-----------------|--------|
| `stageName` | String | 1+ chars | `artistProfiles.stageName` | Artist cards, detail screens | Working |
| `bio` | Text | Max 1000 chars | `artistProfiles.bio` | Artist detail screen | Working |

### 6.2 Step 2: Specialties

| Field | Type | Options | Stored In | Displayed Where | Status |
|-------|------|---------|-----------|-----------------|--------|
| `specialties` | Array | hair, makeup | `artistProfiles.specialties` | Artist cards, filtering | Working |
| `yearsExperience` | Number | 0-100 | `artistProfiles.yearsExperience` | Artist detail screen | Working |

### 6.3 Step 3: Service Area

| Field | Type | Stored In | Displayed Where | Status |
|-------|------|-----------|-----------------|--------|
| `primaryLocation` | {lat, lng, address} | `artistProfiles.primaryLocation` | Used in search/filtering | Working |
| `serviceRadiusKm` | Number | `artistProfiles.serviceRadiusKm` | **NOT DISPLAYED** | Logic only |

### 6.4 Step 4: Profile Photo

| Field | Type | Stored In | Displayed Where | Status |
|-------|------|-----------|-----------------|--------|
| `profileImageUrl` | S3 URL | `artistProfiles.profileImageUrl` | Artist cards, detail screens | Working |

---

## 7. Booking Management

### 7.1 Customer View: BookingDetailScreen

**Data Displayed**:
- Booking number
- Status badge
- Scheduled date/time
- Services list with names, durations, prices
- Total amount
- Location address
- Artist name
- Payment status
- Status history timeline

**Data NOT Displayed** (but available):
- Occasion type
- Service type (hair/makeup/combo)
- Customer notes/special requests
- Style reference images
- Location notes

### 7.2 Artist View: ArtistBookingDetailScreen

**Data Displayed**:
- Booking number
- Status badge
- Scheduled date/time range
- Services with durations and prices
- Total amount (with fees)
- Payment status
- Status history
- Action buttons (Accept/Decline/Start/Complete)
- Message button

**Data NOT Displayed** (Critical Gaps):

| Missing Data | Available In | Impact |
|--------------|--------------|--------|
| Customer name | `users.name` | Artist doesn't know who they're serving |
| Customer phone | `users.phoneNumber` | No direct contact info |
| Celebrity/idol preferences | `onboarding_responses` | Artist can't prepare for desired style |
| Style reference images | Would be `bookings.referenceImages` | Artist can't see what look customer wants |
| Customer notes | `bookings.specialRequests` | Artist misses special instructions |
| Occasion type | `bookings.occasion` | No context for the event |
| Customer allergies | `customerProfiles.allergies` | **SAFETY RISK** |
| Customer sensitivities | `customerProfiles.sensitivities` | **SAFETY RISK** |
| Medical notes | `customerProfiles.medicalNotes` | **SAFETY RISK** |
| Skin type | `customerProfiles.skinType` | Can't prepare appropriate products |
| Hair type | `customerProfiles.hairType` | Can't prepare appropriate products |

---

## 8. Reviews System

### 8.1 Review Submission

**Screen**: `ReviewSubmissionScreen.tsx`

| Field | Type | Required | Stored In | Displayed Where | Status |
|-------|------|----------|-----------|-----------------|--------|
| `overallRating` | 1-5 stars | Yes | `reviews.overallRating` | MyReviews, ArtistReviews | Working |
| `qualityRating` | 1-5 stars | Yes | `reviews.qualityRating` | ArtistReviews (aggregate) | Working |
| `professionalismRating` | 1-5 stars | Yes | `reviews.professionalismRating` | ArtistReviews (aggregate) | Working |
| `timelinessRating` | 1-5 stars | Yes | `reviews.timelinessRating` | ArtistReviews (aggregate) | Working |
| `reviewText` | Text | No | `reviews.reviewText` | MyReviews, ArtistReviews | Working |
| `photos` | Images (max 5) | No | S3 + `review_images` | MyReviews, ArtistReviews | Working |

### 8.2 Review Display

**MyReviewsScreen** (Customer view):
- Shows reviews customer has written
- Displays artist responses if any

**ArtistReviewsScreen** (Artist view):
- Shows aggregate statistics for all 4 rating categories
- Lists all reviews received with pagination
- Artists can respond to reviews

---

## 9. Messaging System

### 9.1 Message Data

| Field | Type | Stored In | Status |
|-------|------|-----------|--------|
| `content` | Text | `messages.content` | Working |
| `images` | Array | `messages.images` | Working |
| `messageType` | text/image/system | `messages.messageType` | Working |
| `sentAt` | Timestamp | `messages.sentAt` | Working |
| `readAt` | Timestamp | `messages.readAt` | Working |

### 9.2 Features
- Bidirectional communication (customer ↔ artist)
- Real-time updates via WebSocket
- Read receipts and typing indicators
- Message history fully preserved
- Offline message queueing
- Can be linked to specific bookings

---

## 10. Home & Notifications

### 10.1 HomeScreen

**Data Displayed**:
- User name (greeting)
- Days until next booking
- Unread notification count

**Data NOT Displayed** (but available):
- Artist name for upcoming booking
- Services for upcoming booking
- Booking total amount
- Booking number
- Service location

**Placeholder Sections** (Not connected):
- "My Bookings" carousel - shows fake data
- "Best Reviews" carousel - shows fake data
- "Best Artists" carousel - shows fake data

### 10.2 NotificationInboxScreen

**Notification Types Handled**:
- `booking_created` → Navigate to BookingDetail
- `booking_status_changed` → Navigate to BookingDetail
- `new_message` → Navigate to Chat

**Gap**: No visual differentiation between notification types (no icons).

---

## 11. Data Flow Summary

### 11.1 Customer Data Collection Status

| Data | Collected | Stored in DB | Shown to Customer | Shown to Artist | Verdict |
|------|-----------|--------------|-------------------|-----------------|---------|
| Name | Yes | Yes | Header only | **NO** | Partial |
| Email | Yes | Yes | No | No | OK (private) |
| Phone | Yes | Yes | No | **NO** | Gap |
| Birth Year | Yes | Yes | No | No | **UNUSED** |
| Celebrity preferences | Yes | Yes (onboarding) | Session only | **NO** | **BROKEN** |
| Service interests | Yes | Yes | No | No | **UNUSED** |
| Location | Yes | Yes | Yes | Yes | Working |
| Location notes | Yes | Yes | **NO** | **NO** | **NOT DISPLAYED** |
| Service type | Yes | Yes | **NO** | **NO** | **NOT DISPLAYED** |
| Occasion | Yes | Yes | **NO** | **NO** | **NOT DISPLAYED** |
| Style images | Yes | **NO** | **NO** | **NO** | **NOT IMPLEMENTED** |
| Customer notes | Yes | Yes | **NO** | **NO** | **NOT DISPLAYED** |
| Skin/hair type | **NO** | Schema exists | N/A | N/A | **NOT COLLECTED** |
| Allergies | **NO** | Schema exists | N/A | N/A | **NOT COLLECTED** |

### 11.2 Artist Data Collection Status

| Data | Collected | Stored | Displayed to Customers | Status |
|------|-----------|--------|------------------------|--------|
| Stage name | Yes | Yes | Yes | Working |
| Bio | Yes | Yes | Yes | Working |
| Specialties | Yes | Yes | Yes | Working |
| Years experience | Yes | Yes | Yes | Working |
| Location | Yes | Yes | Used in search | Working |
| Service radius | Yes | Yes | Not shown | Logic only |
| Profile photo | Yes | Yes | Yes | Working |

---

## 12. Critical Gaps & Issues

### 12.1 HIGH PRIORITY - Safety Concerns

| Issue | Description | Risk Level |
|-------|-------------|------------|
| **No allergy collection** | Customer allergies are not collected | **HIGH** - Safety risk |
| **No sensitivity collection** | Product sensitivities not collected | **HIGH** - Safety risk |
| **No medical notes** | Medical considerations not collected | **HIGH** - Safety risk |

### 12.2 HIGH PRIORITY - Core Feature Gaps

| Issue | Description | Impact |
|-------|-------------|--------|
| **Celebrity data not saved** | 3-step celebrity questionnaire data is never persisted | Entire feature is useless |
| **Celebrity data not shown to artist** | Even onboarding celebrity data never reaches artist | Artists can't prepare for style |
| **Style images not saved** | Customer's selected/uploaded style references never sent to API | Artists can't see desired look |
| **Customer notes not displayed** | Special requests saved but never shown | Artists miss instructions |
| **Customer identity hidden** | Artists don't see customer name or phone | Can't identify who they're serving |

### 12.3 MEDIUM PRIORITY - Display Gaps

| Issue | Description | Impact |
|-------|-------------|--------|
| **Occasion not displayed** | Event type stored but never shown | No context for service |
| **Service type not displayed** | Hair/makeup/combo not shown in details | Missing basic info |
| **Location notes not displayed** | Additional location info not shown | Missing delivery instructions |
| **HomeScreen placeholders** | Booking history, reviews, artists carousels show fake data | Poor user experience |

### 12.4 LOW PRIORITY - Unused Data

| Issue | Description | Recommendation |
|-------|-------------|----------------|
| **Birth year collected but unused** | No age-based features exist | Remove collection or implement feature |
| **Service interests unused** | Onboarding data never used for personalization | Implement recommendations or remove |
| **Service radius not displayed** | Calculated but not shown to customers | Add to artist profile |

---

## 13. Recommendations

### 13.1 Immediate Actions (Safety)

1. **Add allergy/sensitivity collection** during customer signup or profile
2. **Display health information prominently** to artists before accepting bookings
3. **Add medical notes field** to customer profile

### 13.2 High Priority (Core Features)

1. **Fix celebrity/idol data flow**:
   - Persist booking celebrity data to database
   - Include in booking payload sent to API
   - Display to artists in ArtistBookingDetailScreen

2. **Implement style images**:
   - Send `selectedStyles[]` and `customStyleImage` in booking payload
   - Store in `bookings.referenceImages`
   - Display to artists in ArtistBookingDetailScreen

3. **Display customer information to artists**:
   - Add customer name to ArtistBookingDetailScreen
   - Add special requests/notes section
   - Add occasion type

4. **Fix customer notes display**:
   - Show `specialRequests` in BookingDetailScreen
   - Show `specialRequests` prominently in ArtistBookingDetailScreen

### 13.3 Medium Priority (UX Improvements)

1. **Enhance HomeScreen**:
   - Connect "My Bookings" carousel to real data
   - Show more booking details (artist, services, amount)
   - Implement "Best Artists" recommendations

2. **Add occasion to booking details**:
   - Display in customer BookingDetailScreen
   - Display in ArtistBookingDetailScreen

3. **Add service type display**:
   - Show hair/makeup/combo in booking details

### 13.4 Low Priority (Cleanup)

1. **Remove or implement birth year**:
   - Either add age verification/restrictions
   - Or remove from signup form

2. **Remove or implement service interests**:
   - Use for artist recommendations
   - Or remove from onboarding

3. **Consider customer profile completion flow**:
   - Prompt customers to add skin type, hair type, preferences
   - Make this data available to artists

---

## Appendix A: Database Schema Reference

### Users Table
```
users {
  id, email, passwordHash, name, phoneNumber, phoneVerified,
  role, profileImageUrl, birthYear, gender, language, timezone,
  notificationPreferences, isActive, isVerified, isBanned,
  onboardingCompleted, tokenVersion, sessionVersion, createdAt, updatedAt
}
```

### Artist Profiles Table
```
artistProfiles {
  id, userId, stageName, bio, specialties, yearsExperience,
  businessRegistrationNumber, businessVerified, licenses, certifications,
  serviceRadiusKm, primaryLocation, serviceAreas, workingHours,
  bufferTimeMinutes, advanceBookingDays, services, packages, travelFee,
  portfolioImages, beforeAfterSets, featuredWork, averageRating, totalReviews,
  responseTimeMinutes, verificationStatus, backgroundCheckCompleted,
  backgroundCheckDate, insuranceVerified, bankAccount, taxId,
  isAcceptingBookings, reviewedBy, reviewedAt, createdAt, updatedAt, verifiedAt
}
```

### Customer Profiles Table (Largely Unused)
```
customerProfiles {
  id, userId, skinType, skinTone, hairType, hairLength,
  allergies, sensitivities, medicalNotes, preferredStyles, favoriteArtists,
  genderPreference, primaryAddress, savedAddresses, totalBookings,
  completedBookings, cancelledBookings, averageRatingGiven, createdAt, updatedAt
}
```

### Bookings Table
```
bookings {
  id, bookingNumber, customerId, artistId, serviceType, occasion,
  services, scheduledDate, scheduledStartTime, scheduledEndTime,
  totalDurationMinutes, totalAmount, status, serviceLocation, address,
  locationType, locationNotes, referenceImages, specialRequests,
  timezone, paymentStatus, statusHistory, completedAt, completedBy,
  createdAt, updatedAt
}
```

### Onboarding Responses Table
```
onboarding_responses {
  id, userId, flowId, flowVersion, variantId, stepKey,
  response (JSONB), version, isCompletedStep, createdAt, updatedAt
}
```

---

## Appendix B: Feature Flags

| Flag | Purpose | Values |
|------|---------|--------|
| `EXPO_PUBLIC_SHOW_CUSTOMER_ONBOARDING` | Enable customer onboarding flow | 'true' / 'false' |
| `EXPO_PUBLIC_ONBOARDING_INPUT_TYPE` | Celebrity input method | 'idol_dropdown' / default |
| `USE_DEV_LOGIN` | Use development login screen | true / false |

---

## Appendix C: Navigation Structure

```
App Root
├─ [Unauthenticated]
│  ├─ Login
│  ├─ Signup
│  ├─ SignupConfirmation
│  └─ ArtistSignup
│
├─ [Artist - Incomplete Profile]
│  └─ ArtistOnboarding (4 steps)
│
├─ [Artist - Pending Review]
│  └─ ArtistPending
│
├─ [Artist - Approved]
│  ├─ ArtistBookingsList
│  ├─ ArtistBookingDetail
│  ├─ ArtistReviews
│  ├─ ChatsList / Chat
│  └─ NotificationInbox
│
├─ [Customer - Needs Onboarding]
│  ├─ OnboardingFlow
│  └─ OnboardingServices
│
└─ [Customer - Approved]
   ├─ Home
   ├─ BookingFlow (multi-step)
   ├─ BookingsList / BookingDetail
   ├─ ReviewSubmission / MyReviews
   ├─ ArtistProfile
   ├─ ChatsList / Chat
   └─ NotificationInbox
```
