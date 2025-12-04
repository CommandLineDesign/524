import http from 'http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { createLogger } from './utils/logger.js';
import { initializeChatSocket } from './websocket/chatSocket.js';

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

