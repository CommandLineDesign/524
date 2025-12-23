import React from 'react';

import { config } from '../config/environment';
import { DevLoginScreen } from './DevLoginScreen';
import { NewLoginScreen } from './NewLoginScreen';

/**
 * Login Screen Router
 *
 * Conditionally renders the appropriate login screen based on the USE_DEV_LOGIN environment variable:
 * - When USE_DEV_LOGIN=true: Shows the development login screen with test accounts
 * - When USE_DEV_LOGIN=false or undefined: Shows the production login screen from Figma design
 */
export function LoginScreen() {
  if (config.useDevLogin) {
    return <DevLoginScreen />;
  }

  return <NewLoginScreen />;
}
