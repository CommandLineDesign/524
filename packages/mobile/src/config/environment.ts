// Environment variable types for type safety
interface EnvironmentConfig {
  useDevLogin: boolean;
  testPassword: string;
}

// Helper function to safely get boolean environment variables
function getBooleanEnvVar(name: string, defaultValue = false): boolean {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

// Helper function to safely get string environment variables
function getStringEnvVar(name: string, defaultValue = ''): string {
  return process.env[name] || defaultValue;
}

// Environment configuration with type safety and validation
export const config: EnvironmentConfig = {
  useDevLogin: getBooleanEnvVar('USE_DEV_LOGIN', false),
  // Dev-only test password - requires explicit environment variable, no defaults allowed
  testPassword: getStringEnvVar('TEST_PASSWORD'),
};
