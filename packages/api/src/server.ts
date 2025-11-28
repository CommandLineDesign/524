import http from 'http';

import { createApp } from './app';
import { env } from './config/env';
import { createLogger } from './utils/logger';
import { initializeChatSocket } from './websocket/chatSocket';

const logger = createLogger('server');

export async function startServer() {
  const app = await createApp();
  const server = http.createServer(app);

  initializeChatSocket(server);

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'API server listening');
  });

  return server;
}

