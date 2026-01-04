import { QueryClient } from '@tanstack/react-query';

import { AuthenticationError } from '../api/client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on authentication errors - the API client handles token refresh
        if (error instanceof AuthenticationError) {
          return false;
        }
        // For other errors, retry once
        return failureCount < 1;
      },
      staleTime: 1000 * 30,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on auth errors
        if (error instanceof AuthenticationError) {
          return false;
        }
        return false; // Generally don't retry mutations
      },
    },
  },
});
