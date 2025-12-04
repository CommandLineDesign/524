import type { Server as HttpServer } from 'http';

import type { ChatMessage } from '@524/shared/messaging';
import { Server } from 'socket.io';

import { env } from '../config/env.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('websocket');

let io: Server | null = null;

export function initializeChatSocket(server: HttpServer) {
  if (io) {
    return io;
  }

  // Parse CORS_ORIGIN to handle comma-separated values or wildcard
  const corsOrigin = env.CORS_ORIGIN === '*' 
    ? '*' 
    : env.CORS_ORIGIN.includes(',')
    ? env.CORS_ORIGIN.split(',').map((origin: string) => origin.trim())
    : env.CORS_ORIGIN;

  io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Client connected');

    socket.on('join:booking', (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
    });

    socket.on('chat:message', (message: ChatMessage) => {
      io?.to(`booking:${message.bookingId}`).emit('chat:message', message);
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Client disconnected');
    });
  });

  return io;
}

