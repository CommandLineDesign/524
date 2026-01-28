# 524 Mobile App Overview

> A concise guide to every screen and flow in the app, written for designers and non-technical team members.

---

## What is 524?

524 is a beauty service booking app connecting **customers** who want hair and makeup services with **artists** who provide those services. The app handles the entire journey from finding an artist to completing the service and leaving a review.

---

## User Types

| User | Description |
|------|-------------|
| **Customer** | Someone looking for hair/makeup services for an event |
| **Artist** | A professional who provides hair and/or makeup services |

---

## Customer Flows

### 1. Sign Up & Login

**Purpose**: Create an account and access the app.

**What we collect**:
- Name
- Email & password
- Phone number
- Date of birth

**Current issues**:
- Date of birth is collected but never used for anything

---

### 2. Customer Onboarding (Optional)

**Purpose**: Learn about the customer's style preferences before they book.

**What we collect**:
- Celebrity they've been told they look like
- Celebrity whose style they want
- Celebrity they admire
- Which services they're interested in (hair, makeup, or both)

**Intention**: This information should help artists understand what look the customer is going for before the appointment.

**Current issues**:
- This data is never shown to artists
- The `shareWithStylist` setting exists but isn't implemented
- Essentially, we ask these questions but do nothing with the answers

---

### 3. Booking Flow

**Purpose**: Guide the customer through selecting a service, choosing an artist, and confirming their booking.

#### Step 1: Location
- Customer enters where they want the service (their home, event venue, etc.)
- Can add notes about the location (parking, access instructions)

**Issue**: Location notes are saved but never displayed to anyone

#### Step 2: Celebrity/Style Questions (Optional Path)
- Same 3 celebrity questions from onboarding
- Shows a "result" screen summarizing their style preferences

**Issue**: This data is NOT saved to the booking - it disappears after the session

#### Step 3: Service Type
- Customer picks: Hair only, Makeup only, or Both

**Issue**: This choice is saved but never shown in booking details

#### Step 4: Occasion
- Customer selects what the service is for (wedding, first meeting with in-laws, date, etc.)

**Issue**: Occasion is saved but never shown to customer or artist in booking details

#### Step 5: Schedule
- Customer picks their preferred date and time slot

#### Step 6: Artist Selection
- Browse available artists with filters and sorting
- View artist profiles with ratings, experience, and specialties
- Select an artist

#### Step 7: Treatment Selection
- Choose specific treatments from the selected artist's menu
- See prices and duration for each treatment
- Running total displayed

#### Step 8: Style Selection
- Customer can select up to 3 reference images for the look they want
- Can also upload their own photo

**Issue**: These images are collected but NEVER sent to the server - artists can't see them

#### Step 9: Payment & Notes
- Review booking summary
- Add special requests or notes for the artist
- Confirm and pay

**Issue**: Customer notes are saved but never displayed to the artist

#### Step 10: Confirmation
- Booking confirmed screen with next steps

---

### 4. Home Screen

**Purpose**: Customer's main dashboard after logging in.

**What it shows**:
- Greeting with customer's name
- Days until next booking
- Notification badge

**What it should show but doesn't**:
- Artist name for upcoming booking
- Services booked
- Total amount
- Booking location

**Current issues**:
- "My Bookings" carousel shows placeholder/fake data
- "Best Reviews" carousel shows placeholder/fake data
- "Best Artists" carousel shows placeholder/fake data

---

### 5. Booking Management

**Purpose**: View and track bookings.

**Customer booking detail shows**:
- Booking number and status
- Date and time
- List of services with prices
- Total amount
- Artist name
- Location
- Status timeline

**Missing from customer view**:
- Occasion type
- Their own notes/special requests
- Style reference images they selected

---

### 6. Reviews

**Purpose**: Rate and review completed services.

**What customers submit**:
- Overall rating (1-5 stars)
- Quality rating (1-5 stars)
- Professionalism rating (1-5 stars)
- Timeliness rating (1-5 stars)
- Written review (optional)
- Photos (optional, up to 5)

**Where reviews appear**:
- Customer can see their submitted reviews
- Artist can see reviews they've received with aggregate stats
- Artists can respond to reviews

---

### 7. Messaging

**Purpose**: Direct communication between customer and artist.

**Features**:
- Text messages
- Image sharing
- Linked to specific bookings
- Read receipts
- Typing indicators
- Full message history preserved

---

### 8. Notifications

**Purpose**: Keep customers informed about their bookings.

**Notification types**:
- Booking created
- Booking status changed
- New message from artist

**Issue**: No visual icons to distinguish notification types

---

## Artist Flows

### 1. Sign Up

**Purpose**: Create an artist account.

**What we collect**:
- Email & password only

Artists provide minimal information at signup, then complete their profile in onboarding.

---

### 2. Artist Onboarding (Required)

**Purpose**: Build the artist's public profile before they can accept bookings.

**Step 1 - Basic Info**:
- Stage name (display name)
- Bio/introduction

**Step 2 - Expertise**:
- Specialties (hair, makeup, or both)
- Years of experience

**Step 3 - Service Area**:
- Primary location (map selection)
- How far they're willing to travel (radius)

**Step 4 - Profile Photo**:
- Upload a professional photo

After completing onboarding, artist waits for admin approval.

---

### 3. Pending Approval

**Purpose**: Holding screen while admin reviews the artist's profile.

Shows a simple message that their profile is under review.

---

### 4. Artist Booking Management

**Purpose**: View and respond to booking requests.

**Booking list shows**:
- Booking number
- Services summary
- Date and time
- Total amount
- Status badge

**Booking detail shows**:
- All of the above plus:
- Full service breakdown with prices
- Payment status
- Status history timeline
- Action buttons (Accept/Decline/Start/Complete)
- Button to message customer

**Critical information MISSING from artist view**:

| Missing | Why it matters |
|---------|----------------|
| Customer name | Artist doesn't know who they're serving |
| Customer phone | No direct contact info |
| Occasion type | No context for the event |
| Style preferences/celebrity info | Can't prepare for the desired look |
| Reference images | Can't see what style customer wants |
| Special requests/notes | Misses customer instructions |
| Allergies | **Safety risk** |
| Skin sensitivities | **Safety risk** |
| Medical notes | **Safety risk** |

---

### 5. Artist Reviews

**Purpose**: See feedback from customers.

**What artists see**:
- Average ratings across all 4 categories
- Total review count
- Individual reviews with text and photos
- Ability to respond to reviews

---

## Summary of Major Gaps

### Data Collected But Never Used

| Data | Where Collected | Problem |
|------|-----------------|---------|
| Celebrity/idol preferences | Onboarding + Booking flow | Never shown to artists |
| Style reference images | Booking flow | Never saved to server |
| Customer notes | Checkout | Never displayed |
| Occasion type | Booking flow | Never displayed |
| Service type | Booking flow | Never displayed |
| Location notes | Booking flow | Never displayed |
| Date of birth | Sign up | No purpose |

### Safety Concerns

The app has database fields for allergies, sensitivities, and medical notes, but:
- We never ask customers for this information
- Artists have no way to see health/safety info before appointments

### Artist Experience

When an artist receives a booking request, they see:
- Services and prices
- Date and time
- Location

They do NOT see:
- Who the customer is
- What look the customer wants
- Any special instructions
- What the occasion is
- Health/safety information

**This makes it very difficult for artists to prepare properly or decide whether to accept a booking.**

---

## Quick Reference: All Screens

### Customer Screens
1. Login
2. Sign Up
3. Sign Up Confirmation
4. Onboarding - Celebrity Questions
5. Onboarding - Service Interests
6. Home
7. Booking Flow (10 steps)
8. Bookings List
9. Booking Detail
10. Review Submission
11. Review Confirmation
12. My Reviews
13. Chat List
14. Chat
15. Notifications

### Artist Screens
1. Login
2. Sign Up
3. Onboarding (4 steps)
4. Pending Approval
5. Bookings List
6. Booking Detail
7. My Reviews
8. Chat List
9. Chat
10. Notifications

---

## Recommendations for Design

1. **Artist booking detail needs a complete redesign** - Add customer info, style preferences, notes, and safety information

2. **Customer home screen needs real data** - Replace placeholder carousels with actual booking history and recommendations

3. **Style/preference data needs to flow through** - Either remove the celebrity questions or actually show them to artists

4. **Add health/safety collection** - Critical for artists to know about allergies before appointments

5. **Show occasion and notes everywhere** - Both customer and artist should see this context in booking details
