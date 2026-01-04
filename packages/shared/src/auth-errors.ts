/**
 * Authentication error codes used across API and client applications.
 * These codes provide consistent error handling and user experience.
 */

// Token-related error codes
export const TOKEN_EXPIRED = 'TOKEN_EXPIRED';
export const TOKEN_INVALID = 'TOKEN_INVALID';
export const REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED';
export const REFRESH_TOKEN_REVOKED = 'REFRESH_TOKEN_REVOKED';
export const INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN';
export const NO_REFRESH_TOKEN = 'NO_REFRESH_TOKEN';

// Session-related error codes
export const SESSION_INVALIDATED = 'SESSION_INVALIDATED';

// User-related error codes
export const USER_NOT_FOUND = 'USER_NOT_FOUND';
export const ACCOUNT_BANNED = 'ACCOUNT_BANNED';

// Network and system error codes
export const NETWORK_ERROR = 'NETWORK_ERROR';
export const AUTH_ERROR = 'AUTH_ERROR';
export const REFRESH_TIMEOUT = 'REFRESH_TIMEOUT';

// Legacy aliases for backward compatibility
export const TOKEN_EXPIRED_CODE = TOKEN_EXPIRED;
export const SESSION_INVALIDATED_CODE = SESSION_INVALIDATED;
export const TOKEN_INVALID_CODE = TOKEN_INVALID;
