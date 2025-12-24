import { Alert } from 'react-native';

/**
 * SNS Authentication Service
 *
 * Provides authentication methods for social login providers.
 * Currently showing "coming soon" alerts as placeholders for future implementation.
 */

// TODO: Implement actual Naver OAuth flow when SDK is integrated
export async function loginWithNaver(): Promise<void> {
  Alert.alert('네이버 로그인', '네이버 로그인 기능은 곧 제공될 예정입니다.', [
    { text: '확인', style: 'default' },
  ]);
}

// TODO: Implement actual Kakao OAuth flow when SDK is integrated
export async function loginWithKakao(): Promise<void> {
  Alert.alert('카카오 로그인', '카카오 로그인 기능은 곧 제공될 예정입니다.', [
    { text: '확인', style: 'default' },
  ]);
}
