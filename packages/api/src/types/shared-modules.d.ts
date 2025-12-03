// Relaxed type declarations for shared workspace modules used by the API.
// These provide minimal `any`-based types so tsc can emit JS without
// needing to fully resolve the shared package type definitions.

declare module '@524/shared/auth' {
  export type AuthTokens = any;
  export type PhoneVerificationPayload = any;
  export type OAuthCallbackPayload = any;
}

declare module '@524/shared/bookings' {
  export type BookingSummary = any;
  export type CreateBookingPayload = any;
  export type UpdateBookingStatusPayload = any;
}

declare module '@524/shared/artists' {
  export type ArtistProfile = any;
  export type ArtistSearchFilters = any;
  export type ArtistSearchResult = any;
}

declare module '@524/shared/payments' {
  export type PaymentAuthorizationResult = any;
}

declare module '@524/shared/messaging' {
  export type ChatMessage = any;
}


