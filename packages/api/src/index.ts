import { startServer } from './server';

// Main entry point for the API server
startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start API server', error);
  process.exit(1);
});
