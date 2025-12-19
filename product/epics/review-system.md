# Review System

**Category**: Foundation

**Priority**: Medium

**Status**: 📝 In Progress

**Dependencies**:

- [Booking System](./booking-system.md)

**Estimated Effort**: Medium (3-5 sprints)

## Description

This epic covers the complete reputation and review system for the marketplace. Reviews and ratings are the primary trust signal for future customers, enabling them to make informed decisions when selecting artists. The system allows customers to rate their experience after a completed service, artists to respond to reviews, and administrators to moderate content. It includes multi-dimensional ratings, photo uploads, review management interfaces, and moderation tools.

The review system is tightly integrated with the booking lifecycle, requiring bookings to be marked as "Completed" before reviews can be submitted. This ensures reviews are only left for services that have been delivered.

## Key Components

- **Booking Completion Flow**: Artists can mark bookings as "Completed" to enable review submission
- **Customer Review Interface**: Multi-dimensional rating (1-5 stars) with text feedback and photo uploads
- **Artist Review Management**: View received reviews, respond publicly, access from booking cards
- **Customer Review History**: "My Reviews" section for customers to view all reviews they've written
- **Artist Review Dashboard**: "My Reviews" section for artists to view all reviews they've received
- **Review Display on Profiles**: Show reviews on artist public profiles with aggregate ratings
- **Review Photos**: Support for up to 5 photos per review with S3 upload integration
- **Artist Response System**: Public response capability for artists to address reviews
- **Aggregation Logic**: Real-time calculation of average ratings and review counts
- **Admin Moderation Tools**: Flag, hide, and remove inappropriate reviews in Admin app
- **Zero State Handling**: Replace placeholder review data with proper empty states for artists with no reviews

## Acceptance Criteria

### Booking Completion
- [x] Artists can mark a booking as "Completed" from their booking management interface
- [x] Marking a booking as "Completed" triggers the booking status change workflow
- [x] Only bookings in appropriate states (e.g., "in_progress", "paid") can be marked as completed
- [x] Completion action is logged with timestamp and artist ID

### Customer Review Submission
- [x] Customers can only leave a review after a booking is in "Completed" status
- [x] Review interface is accessible from the completed booking card
- [x] Reviews include overall rating (1-5 stars) and dimension ratings (Quality, Professionalism, Timeliness)
- [x] Customers can add optional text review (up to 1000 characters)
- [x] Customers can upload up to 5 photos with their review
- [x] Reviews must be submitted within 30 days of service completion
- [x] After 30 days, the review option is no longer available
- [x] Review submission triggers notification to the artist

### Customer Review History
- [x] Customers have a "My Reviews" section in their profile
- [x] "My Reviews" displays all reviews the customer has written, sorted by date (newest first)
- [x] Each review entry shows the artist, service details, rating, and review text
- [x] Customers can view artist responses to their reviews
- [x] Customers can navigate to the original booking from the review

### Artist Review Management
- [x] Artists can view reviews from completed booking cards
- [x] Artists have a "My Reviews" section showing all reviews they've received
- [x] Reviews display customer name (or anonymous if preferred), rating, text, and photos
- [x] Artists receive notifications when new reviews are posted
- [ ] Artists can respond publicly to any review (moved to backlog)
- [ ] Artist responses are displayed below the customer review (moved to backlog)
- [ ] Artists can edit their response within 24 hours of posting (moved to backlog)

### Review Display
- [ ] Artist public profiles display aggregate rating (average of all reviews)
- [ ] Artist profiles show total review count
- [ ] Individual reviews are displayed on artist profiles, sorted by date
- [ ] Review photos are displayed in a gallery format
- [ ] Artist responses are shown inline with reviews
- [ ] Reviews show verified booking badge to indicate authenticity

### Photo Upload Integration
- [x] Review photo uploads use S3 presigned URLs (following S3_UPLOAD_SETUP.md)
- [x] Photos are stored in `review-photos/{booking_id}/` folder structure
- [x] Maximum 5 photos per review, 5MB per photo
- [x] Supported formats: JPEG, PNG, WebP
- [x] Client-side image compression before upload
- [x] Photos are publicly accessible via CDN after upload

### Zero State Handling
- [ ] Remove all placeholder/mock review data from the system
- [ ] Artists with no reviews display appropriate empty state message
- [ ] Empty state includes encouragement text (e.g., "Complete your first booking to receive reviews")
- [ ] Zero state is visually distinct from error states
- [ ] Aggregate ratings show "No reviews yet" instead of 0 stars

### Admin Moderation
- [ ] Admin app includes "Reviews" section for moderation
- [ ] Admins can view all reviews across the platform
- [ ] Admins can flag reviews as inappropriate
- [ ] Admins can hide reviews from public display
- [ ] Admins can permanently delete reviews (with audit log)
- [ ] Admins can view flagged reviews in a dedicated queue
- [ ] Moderation actions are logged with admin ID and timestamp
- [ ] Artists and customers are notified when their reviews are moderated

### Data Integrity
- [ ] Average ratings are updated immediately when new reviews are submitted
- [ ] Review counts are accurate and updated in real-time
- [ ] Deleted reviews are properly removed from aggregate calculations
- [ ] Review data is properly linked to bookings and users in the database

## Technical Requirements

### Database Schema
- **Reviews Table**: Links to bookings, customers, and artists with ratings and content
- **Review Images Table**: Stores S3 keys and metadata for review photos
- **Review Responses Table**: Stores artist responses with timestamps
- **Moderation Log Table**: Tracks all moderation actions with admin IDs
- **Indexes**: Optimize queries for artist_id, customer_id, booking_id, created_at
- **Constraints**: Ensure one review per booking, prevent reviews on non-completed bookings

### API Endpoints
```
POST   /api/v1/bookings/:id/complete              # Artist marks booking complete ✅
POST   /api/v1/bookings/:id/review                # Customer submits review ✅
GET    /api/v1/reviews                            # Get user's reviews (customer or artist) ✅
GET    /api/v1/reviews/:id                        # Get specific review details ✅
GET    /api/v1/artists/:id/reviews                # Get all reviews for an artist ✅
POST   /api/v1/reviews/:id/photos/presign         # Get presigned URL for photo upload ✅
POST   /api/v1/reviews/:id/response               # Artist responds to review (backlog)
PUT    /api/v1/reviews/:id/response               # Update artist response (within 24h) (backlog)
PUT    /api/v1/reviews/:id                        # Update review (within 24h) (backlog)
DELETE /api/v1/reviews/:id                        # Delete review (customer only) (backlog)
POST   /api/v1/admin/reviews/:id/flag             # Admin flags review
POST   /api/v1/admin/reviews/:id/hide             # Admin hides review
DELETE /api/v1/admin/reviews/:id                  # Admin deletes review
GET    /api/v1/admin/reviews/flagged              # Get flagged reviews queue
```

### S3 Integration
- Follow patterns defined in `docs/setup/S3_UPLOAD_SETUP.md`
- Use presigned URLs for direct browser/mobile uploads
- Folder structure: `review-photos/{booking_id}/{uuid}.jpg`
- Maximum file size: 5MB per image
- Allowed types: `image/jpeg`, `image/png`, `image/webp`
- Public read access via CloudFront CDN

### Mobile App (React Native)
- Review submission form in booking detail screen
- "My Reviews" tab in customer profile
- "My Reviews" section in artist dashboard
- Photo picker with multi-select (up to 5 images)
- Image compression before upload using react-native-image-resizer
- Star rating component with dimension breakdowns
- Review card component for displaying reviews

### Web Admin (Next.js)
- Reviews moderation dashboard at `/admin/reviews`
- Flagged reviews queue with filtering
- Review detail modal with full context (booking, users, photos)
- Moderation actions (flag, hide, delete) with confirmation dialogs
- Audit log view for moderation history
- Search and filter by artist, customer, date range, status

### Performance
- Review list pagination (20 reviews per page)
- Lazy loading for review photos
- Cached aggregate ratings (updated on review submission/deletion)
- Database indexes on frequently queried fields
- API response time <200ms for review list endpoints

### Anti-Abuse
- Rate limiting: Max 5 review submissions per hour per user
- Validation: Prevent reviews on non-completed bookings
- Duplicate prevention: One review per booking
- Time window enforcement: Reviews only within 30 days of completion
- Profanity filter on review text (optional for MVP)
- Spam detection for repetitive content (future enhancement)

## User Stories

### Core Review Flow
- [Mark Booking Complete](../stories/archive/mark-booking-complete.md): Artist marks booking as completed to enable review submission ✅
- [Submit Customer Review](../stories/archive/submit-customer-review.md): Customer leaves multi-dimensional review after service completion ✅
- [Upload Review Photos](../stories/archive/upload-review-photos.md): Customer uploads photos with review to showcase artist work ✅

### Review Management
- [View Customer Review History](../stories/archive/view-customer-review-history.md): Customer views all reviews they've written ✅
- [View Artist Reviews](../stories/archive/view-artist-reviews.md): Artist views all reviews they've received ✅
- [Respond to Review](../stories/backlog/respond-to-review.md): Artist responds publicly to customer reviews (backlog)

### Review Display & Moderation
- [Display Reviews on Artist Profile](../stories/display-reviews-on-profile.md): Reviews and ratings displayed on artist profiles for customer decision-making
- [Moderate Reviews](../stories/moderate-reviews.md): Admin moderates inappropriate reviews to maintain platform quality

## Risks and Assumptions

### Risks
- **Review Bombing**: Malicious users could leave multiple fake negative reviews
  - *Mitigation*: One review per booking, require completed booking, rate limiting, admin moderation
- **Inappropriate Content**: Reviews may contain offensive language or images
  - *Mitigation*: Admin moderation tools, flagging system, profanity filters (future)
- **Low Review Volume**: Customers may not leave reviews, reducing trust signals
  - *Mitigation*: Post-service reminder notifications, incentives (future consideration)
- **Artist Retaliation**: Artists may retaliate against negative reviews
  - *Mitigation*: Clear policies, admin oversight, customer anonymity options (future)
- **Photo Storage Costs**: High volume of review photos could increase S3 costs
  - *Mitigation*: 5MB limit per photo, 5 photos per review, image compression, lifecycle policies

### Assumptions
- Customers are willing to leave reviews after completed services
- Artists will respond professionally to reviews
- 30-day review window is sufficient for most customers
- Multi-dimensional ratings (Quality, Professionalism, Timeliness) provide valuable signal
- Admin moderation will be sufficient to handle inappropriate content
- S3 upload infrastructure is already in place and functioning
- Booking completion workflow is straightforward for artists

## Notes

### Current Status
**Core review functionality is MVP-ready!** ✅
- Booking completion and review submission working end-to-end
- Customer and artist review history implemented
- Photo upload integration complete
- Basic review display on profiles in progress

**Remaining for MVP:**
- Display reviews on artist profiles (`display-reviews-on-profile.md`)
- Admin moderation tools (`moderate-reviews.md`)
- Payment holds release for declined bookings (`release-payment-holds-on-booking-declines.md`)

**Backlog Enhancements:**
- Artist responses to reviews
- Review editing within 24 hours
- Advanced moderation features
- Performance optimizations

### Implementation Phases
1. **Phase 1 - Core Review Submission**: Booking completion, customer review submission, basic display ✅ **COMPLETED**
2. **Phase 2 - Review Management**: Artist responses (backlog), customer/artist review history sections ✅ **COMPLETED**
3. **Phase 3 - Admin Moderation**: Admin tools, flagging, hiding, deletion, audit logs
4. **Phase 4 - Review Display**: Display reviews on artist profiles, aggregate ratings
5. **Phase 5 - Polish**: Zero state handling, remove placeholder data, notifications, performance optimization

### Future Enhancements (Post-MVP)
- Artist responses to reviews (currently in backlog)
- Review editing within 24 hours (currently in backlog)
- Double-blind reviews (neither side sees review until both submit)
- Review incentives (discounts for leaving reviews)
- Review helpfulness voting
- Verified purchase badges
- Review analytics for artists (sentiment analysis, trends)
- Automated profanity and spam detection
- Customer anonymity options
- Review templates for common feedback

### Related Documentation
- S3 Upload Setup: `docs/setup/S3_UPLOAD_SETUP.md`
- Technical Specification: `ai/context/524-technical-specification.md`
- Review Data Model: See `Review` interface in technical spec (lines 354-376)
- Booking Data Model: See `Booking` interface in technical spec (lines 209-254)

### Design Considerations
- Review cards should be visually prominent on artist profiles
- Empty states should be encouraging, not discouraging
- Photo galleries should be touch-friendly on mobile
- Star ratings should be large and easy to interact with
- Artist responses should be visually distinct from customer reviews
- Moderation actions should require confirmation to prevent accidents
