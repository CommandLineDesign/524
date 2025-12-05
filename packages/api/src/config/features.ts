// Feature flags for development
export const features = {
  // Set to false to use mock auth (no external providers needed)
  // Set to true when Kakao/Naver/Apple accounts are ready
  USE_REAL_AUTH: process.env.USE_REAL_AUTH === 'true',

  // Mock auth settings
  MOCK_AUTH: {
    // Auto-login in development without credentials
    AUTO_LOGIN: process.env.NODE_ENV === 'development',

    // Default mock user roles for testing
    DEFAULT_CUSTOMER_ID: 'mock-customer-1',
    DEFAULT_ARTIST_ID: 'mock-artist-1',
    DEFAULT_ADMIN_ID: 'mock-admin-1',
  },

  // Other feature flags
  ENABLE_SMS: process.env.ENABLE_SMS === 'true',
  ENABLE_PUSH_NOTIFICATIONS: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true',
  ENABLE_PAYMENTS: process.env.ENABLE_PAYMENTS === 'true',
};
