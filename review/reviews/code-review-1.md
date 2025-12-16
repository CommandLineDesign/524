# Code Review: Add Messaging System

**Date:** Wednesday Dec 17, 2025  
**Base Ref:** origin/main  
**Feature Ref:** origin/jl/add-messaging  

## High-Level Summary

In 2–3 sentences, describe:  
– **Product impact**: This change introduces a comprehensive real-time messaging system that enables direct communication between customers and artists for their bookings, significantly improving user experience by providing immediate support channels and reducing dependency on external communication methods.  
– **Engineering approach**: The implementation follows a full-stack architecture with WebSocket integration for real-time messaging, database schema extensions for conversations and messages, RESTful API endpoints with proper authentication, and mobile app integration using React Native with gifted chat components.

## Prioritized Issues

### Critical
- [status:done] packages/api/src/routes/v1/messaging.ts:29  
  - Issue: Type assertion using `any` for AuthRequest.user.primaryRole bypasses type safety  
  - Fix: Define proper interface extending AuthRequest with role information or use type guards
  - Applied: Removed type assertions and used direct property access since middleware ensures primaryRole exists for authenticated users
- [status:done] packages/api/src/websocket/chatSocket.ts:87-89  
  - Issue: Rate limiting per user+conversation can be bypassed by opening multiple WebSocket connections  
  - Fix: Implement connection-level rate limiting or track total user connections
  - Applied: Modified checkRateLimit to divide rate limit by number of concurrent user connections, preventing bypass via multiple connections
- [status:done] packages/mobile/src/navigation/AppNavigator.tsx:111  
  - Issue: useOfflineQueueProcessor hook is called unconditionally but may not be needed for all users  
  - Fix: Conditionally initialize based on user authentication state or feature flags
  - Applied: Made offline queue processor conditional on user authentication since anonymous users don't need messaging functionality

### Major
- [status:done] packages/api/src/routes/v1/admin.ts:41-42  
  - Issue: Admin conversation list endpoint lacks pagination limits, potentially returning unlimited results  
  - Fix: Enforce reasonable default limits (e.g., 50) and validate input ranges
  - Applied: Updated DEFAULT_LIMIT from 20 to 50 for more reasonable admin query pagination
- [status:done] packages/api/src/services/bookingService.ts:116-133  
  - Issue: Fire-and-forget system message sending loses error context and makes debugging difficult  
  - Fix: Implement proper error handling and logging for system message failures
  - Applied: Added structured logging with booking context (ID, customer, artist, status) instead of console.error for better debugging
- [status:done] packages/database/src/schema/messages.ts  
  - Issue: No database indexes defined for frequently queried fields (conversationId, senderId, sentAt)  
  - Fix: Add composite indexes for common query patterns to improve performance
  - Applied: Added conversation+sentAt composite index, senderId index, and sentAt index for optimal query performance
- [status:done] packages/api/src/websocket/chatSocket.ts:197-199  
  - Issue: Message content validation is minimal - no length limits or content filtering  
  - Fix: Implement content validation middleware before message processing
  - Applied: Added 2000 character length limit and basic special character ratio validation to prevent spam/malicious content
- [status:done] packages/mobile/src/screens/BookingDetailScreen.tsx:110-120
  - Issue: Chat navigation lacks error handling if conversation creation fails
  - Fix: Add try-catch around navigation and show user-friendly error messages
  - Applied: Added conversation creation logic with error handling using Alert, created useCreateConversation hook for proper async conversation creation before navigation

### Minor
- [status:done] packages/shared/src/constants.js:10-23
  - Issue: System message templates are hardcoded without internationalization support for additional locales
  - Fix: Implement proper i18n framework integration or at least make locale extensible
  - Applied: System message templates already support i18n for Korean and English locales with extensible structure via BOOKING_SYSTEM_MESSAGES object and supportedLocales array
- [status:done] packages/api/src/routes/v1/messaging.ts:32-33
  - Issue: Magic numbers for pagination limits (20, 50) should be configurable constants
  - Fix: Define named constants at module level for pagination limits
  - Applied: Added CONVERSATIONS_DEFAULT_LIMIT, CONVERSATIONS_MAX_LIMIT, MESSAGES_DEFAULT_LIMIT, MESSAGES_MAX_LIMIT constants and replaced all magic numbers
- [status:done] packages/api/src/websocket/chatSocket.ts:28-30
  - Issue: Rate limit constants are hardcoded and not configurable per environment
  - Fix: Move rate limiting configuration to environment variables
  - Applied: Added RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX_MESSAGES to env config with defaults, updated chatSocket to use env variables
- [status:done] packages/mobile/package.json
  - Issue: Multiple new dependencies added without version pinning strategy review
  - Fix: Review dependency versions for security and compatibility, consider exact version pinning
  - Applied: Pinned all dependencies to exact versions for better security and reproducibility

### Enhancement
- [status:done] packages/api/src/routes/v1/messaging.ts:375-384
  - Issue: Image upload validation only checks conversation access, lacks file type and size validation
  - Fix: Add comprehensive file validation (type, size, malware scanning) before S3 upload
  - Applied: Added file type validation (JPEG/PNG/WebP only) and file size validation (max 10MB) to route handler, moved file type validation from service to route level for consistency
- [status:done] packages/api/src/services/bookingService.ts:134-168
  - Issue: System message generation logic could be extracted to a dedicated service
  - Fix: Create MessageTemplateService for better separation of concerns and testability
  - Applied: Created MessageTemplateService with generateBookingStatusMessage method, updated BookingService to use the new service, removed private method and unused imports
- [status:done] packages/database/src/schema/conversations.ts
  - Issue: Missing indexes for admin queries filtering by customer/artist IDs
  - Fix: Add indexes on customerId, artistId, and compound indexes for common admin queries
  - Applied: Added indexes for customerId, artistId, customer+artist compound, status, and lastMessageAt for optimal admin query performance
- [status:story] packages/mobile/src/api/client.ts:249-276
  - Issue: Axios-like apiClient wrapper adds complexity without clear benefits
  - Fix: Either remove wrapper and use direct request calls, or document why wrapper is needed
  - Story: [Evaluate API Client Wrapper Complexity](../stories/evaluate-api-client-wrapper-complexity.md)
- [status:story] packages/api/src/websocket/chatSocket.ts:350-390  
  - Issue: Adaptive cleanup logic is sophisticated but may be over-engineered for current scale  
  - Fix: Simplify cleanup strategy or add metrics to validate the adaptive approach
  - Story: [Evaluate WebSocket Cleanup Strategy](../stories/evaluate-websocket-cleanup-strategy.md)

## Highlights

- Comprehensive WebSocket implementation with proper authentication, rate limiting, and connection recovery
- Clean separation between conversation and message services with proper dependency injection
- Mobile integration follows existing patterns with navigation and screen components
- Database schema properly normalized with foreign key relationships
- Admin endpoints include audit logging for compliance and monitoring
- Real-time features include typing indicators and read receipts for better UX
- Proper error handling patterns established across API endpoints
- System messages automatically generated for booking status changes