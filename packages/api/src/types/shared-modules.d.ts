// Minimal re-exports of shared workspace types so the API can typecheck
// without pulling in the compiled shared package.

declare module '@524/shared/auth' {
  export type AuthTokens = import('@524/shared').AuthTokens;
  export type PhoneVerificationPayload = import('@524/shared').PhoneVerificationPayload;
  export type OAuthCallbackPayload = import('@524/shared').OAuthCallbackPayload;
}

declare module '@524/shared/bookings' {
  export type BookingSummary = import('@524/shared').BookingSummary;
  export type CreateBookingPayload = import('@524/shared').CreateBookingPayload;
  export type UpdateBookingStatusPayload = import('@524/shared').UpdateBookingStatusPayload;
  export type BookedService = import('@524/shared').BookedService;
}

declare module '@524/shared/artists' {
  export type ArtistProfile = import('@524/shared').ArtistProfile;
  export type ArtistSearchFilters = import('@524/shared').ArtistSearchFilters;
  export type ArtistSearchResult = import('@524/shared').ArtistSearchResult;
}

declare module '@524/shared/payments' {
  export type PaymentAuthorizationResult = import('@524/shared').PaymentAuthorizationResult;
}

declare module '@524/shared/messaging' {
  export type ChatMessage = import('@524/shared').ChatMessage;
}
