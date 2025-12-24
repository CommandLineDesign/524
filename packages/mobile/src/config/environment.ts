export const config = {
  testPassword: process.env.EXPO_PUBLIC_TEST_PASSWORD || 'password@1234',
  useDevLogin: process.env.EXPO_PUBLIC_USE_DEV_LOGIN === 'true',
};
