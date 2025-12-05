import type { UserRole } from './constants';
export type OAuthProvider = 'kakao' | 'naver' | 'apple' | 'google';
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
export interface PhoneVerificationPayload {
  phoneNumber: string;
  code: string;
  deviceId?: string;
}
export interface OAuthCallbackPayload {
  provider: OAuthProvider;
  code: string;
  redirectUri?: string;
}
export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  phoneNumber: string;
}
//# sourceMappingURL=auth.d.ts.map
