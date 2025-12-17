import { randomUUID } from 'node:crypto';
import type { Server as HttpServer } from 'node:http';
import { userRoles, users } from '@524/database';
import { eq, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import type { ChatMessage } from '@524/shared/messaging';
import { Server, Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
  userId: string;
  userRole: string;
  userRoles: string[];
}

import { MOCK_USERS } from '../auth/mock-auth.js';
import { env } from '../config/env.js';
import { features } from '../config/features.js';
import { db } from '../db/client.js';
import { ConversationService } from '../services/conversationService.js';
import { createLogger } from '../utils/logger.js';
import { selectPrimaryRole } from '../utils/roleHelpers.js';

const logger = createLogger('websocket');

let io: Server | null = null;

interface TokenPayload {
  user_id: string;
  role: 'customer' | 'artist' | 'admin' | 'support';
  roles?: string[];
  phone_number: string;
  token_version?: number;
  mock?: boolean;
}

// Track connected users for targeted emissions
const connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds

// Rate limiting for message sending (user + conversation -> { count, resetTime })
const messageRateLimit = new Map<string, { count: number; resetTime: number }>();
// Rate limiting constants from environment
const RATE_LIMIT_WINDOW_MS = env.RATE_LIMIT_WINDOW_MS;
const RATE_LIMIT_MAX_MESSAGES = env.RATE_LIMIT_MAX_MESSAGES;

const conversationService = new ConversationService();

/**
 * Check if user has exceeded rate limit for messaging in this conversation
 * Accounts for multiple concurrent connections from the same user
 */
function checkRateLimit(userId: string, conversationId: string): boolean {
  const key = `${userId}:${conversationId}`;
  const now = Date.now();
  const limit = messageRateLimit.get(key);

  // Get the number of concurrent connections for this user
  const userConnections = connectedUsers.get(userId);
  const connectionCount = userConnections ? userConnections.size : 1;
  // Divide the rate limit by number of connections (minimum 1)
  const adjustedMaxMessages = Math.max(1, Math.floor(RATE_LIMIT_MAX_MESSAGES / connectionCount));

  if (!limit || now > limit.resetTime) {
    // Reset or initialize limit
    messageRateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (limit.count >= adjustedMaxMessages) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Calculate adaptive cleanup interval based on connection count
 */
function calculateCleanupInterval(totalConnections: number, totalUsers: number): number {
  if (totalConnections === 0) {
    return 5 * 60 * 1000; // 5 minutes when no connections
  }
  if (totalUsers < 10) {
    return 2 * 60 * 1000; // 2 minutes for light activity
  }
  return 60 * 1000; // 1 minute for normal/high activity
}

/**
 * Create an adaptive cleanup scheduler for WebSocket connections and rate limits
 */
function createAdaptiveCleanupScheduler(
  connectedUsers: Map<string, Set<string>>,
  messageRateLimit: Map<string, { count: number; resetTime: number }>,
  getIo: () => Server | null
) {
  let cleanupTimeout: NodeJS.Timeout | null = null;

  function scheduleCleanup() {
    if (cleanupTimeout) {
      clearTimeout(cleanupTimeout);
    }

    const totalConnections = Array.from(connectedUsers.values()).reduce(
      (sum, sockets) => sum + sockets.size,
      0
    );
    const totalUsers = connectedUsers.size;
    const intervalMs = calculateCleanupInterval(totalConnections, totalUsers);

    cleanupTimeout = setTimeout(() => {
      performCleanup();
      scheduleCleanup();
    }, intervalMs);
  }

  function performCleanup() {
    const now = Date.now();
    const io = getIo();

    // Clean up disconnected sockets
    for (const [userId, sockets] of connectedUsers.entries()) {
      for (const socketId of sockets) {
        const socket = io?.sockets.sockets.get(socketId);
        if (!socket || !socket.connected) {
          sockets.delete(socketId);
        }
      }
      if (sockets.size === 0) {
        connectedUsers.delete(userId);
      }
    }

    // Clean up expired rate limits
    for (const [key, limit] of messageRateLimit.entries()) {
      if (now > limit.resetTime) {
        messageRateLimit.delete(key);
      }
    }
  }

  return {
    start: scheduleCleanup,
    stop: () => {
      if (cleanupTimeout) {
        clearTimeout(cleanupTimeout);
        cleanupTimeout = null;
      }
    },
  };
}

export function initializeChatSocket(server: HttpServer) {
  if (io) {
    return io;
  }

  // Parse CORS_ORIGIN to handle comma-separated values or wildcard
  const corsOrigin =
    env.CORS_ORIGIN === '*'
      ? '*'
      : env.CORS_ORIGIN.includes(',')
        ? env.CORS_ORIGIN.split(',').map((origin: string) => origin.trim())
        : env.CORS_ORIGIN;

  io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
    // Add connection state recovery
    connectionStateRecovery: {
      // the backup duration of the sessions and the packets
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      // whether to skip middlewares upon successful recovery
      skipMiddlewares: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token as string;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, env.JWT_SECRET || 'dev-secret') as TokenPayload;

      let userId: string;
      let userRole: string;
      let roles: string[];

      // Handle mock authentication
      if (decoded.mock && !features.USE_REAL_AUTH) {
        const mockUser = MOCK_USERS[decoded.user_id];
        if (!mockUser) {
          return next(new Error('Mock user not found'));
        }
        userId = mockUser.id;
        userRole = mockUser.role;
        roles = [mockUser.role];
      } else {
        // Real authentication: fetch user from database
        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            phoneNumber: users.phoneNumber,
            isBanned: users.isBanned,
            banReason: users.banReason,
            bannedAt: users.bannedAt,
            tokenVersion: users.tokenVersion,
            roles: sql<
              string[]
            >`coalesce(array_agg(distinct ${userRoles.role})::text[], ARRAY[]::text[])`,
          })
          .from(users)
          .leftJoin(userRoles, eq(users.id, userRoles.userId))
          .where(eq(users.id, decoded.user_id))
          .groupBy(users.id);

        if (!user) {
          return next(new Error('User not found'));
        }

        if (user.isBanned) {
          return next(new Error('Account banned'));
        }

        const tokenVersionFromToken = decoded.token_version ?? 1;
        const tokenVersionFromDb = user.tokenVersion ?? 1;
        if (tokenVersionFromToken !== tokenVersionFromDb) {
          return next(new Error('Session invalidated'));
        }

        userId = user.id;
        roles = user.roles ?? [];
        userRole = selectPrimaryRole(roles);
      }

      // Attach user info to socket
      (socket as AuthenticatedSocket).userId = userId;
      (socket as AuthenticatedSocket).userRole = userRole;
      (socket as AuthenticatedSocket).userRoles = roles;

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new Error('Invalid token'));
      }
      if (error instanceof jwt.TokenExpiredError) {
        return next(new Error('Token expired'));
      }
      logger.error({ error, socketId: socket.id }, 'Socket authentication failed');
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const { userId, userRole } = authSocket;
    logger.info({ socketId: socket.id, userId, userRole }, 'Client connected');

    // Track connected user
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId)?.add(socket.id);

    // Join user-specific room for targeted notifications
    socket.join(`user:${userId}`);

    // Join conversation room
    socket.on('join:conversation', async (conversationId: string) => {
      try {
        // Validate user has access to this conversation
        const hasAccess = await conversationService.validateConversationAccess(
          conversationId,
          userId
        );

        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied to conversation' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        logger.info({ socketId: socket.id, conversationId, userId }, 'Joined conversation room');

        // Emit join confirmation
        socket.emit('conversation:joined', { conversationId });
      } catch (error) {
        logger.error({ error, socketId: socket.id, conversationId }, 'Error joining conversation');
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Leave conversation room
    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      logger.info({ socketId: socket.id, conversationId, userId }, 'Left conversation room');
    });

    // Send real-time message
    socket.on(
      'message:send',
      async (messageData: {
        conversationId: string;
        messageType: 'text' | 'image' | 'system';
        content?: string;
        images?: string[];
        bookingId?: string;
      }) => {
        try {
          // Check rate limit
          if (!checkRateLimit(userId, messageData.conversationId)) {
            socket.emit('error', {
              message: 'Rate limit exceeded. Please slow down your messages.',
            });
            return;
          }

          // Validate access
          const hasAccess = await conversationService.validateConversationAccess(
            messageData.conversationId,
            userId
          );
          if (!hasAccess) {
            socket.emit('error', { message: 'Access denied to conversation' });
            return;
          }

          // Validate message content
          if (messageData.content) {
            // Check content length (max 2000 characters)
            if (messageData.content.length > 2000) {
              socket.emit('error', {
                message: 'Message content exceeds maximum length of 2000 characters',
              });
              return;
            }
            // Basic content filtering - reject messages with excessive special characters
            const specialCharRatio =
              (messageData.content.match(/[^a-zA-Z0-9\s]/g) || []).length /
              messageData.content.length;
            if (specialCharRatio > 0.5) {
              socket.emit('error', { message: 'Message contains too many special characters' });
              return;
            }
          }

          // Create the message object
          const chatMessage: ChatMessage = {
            id: randomUUID(), // Generate proper UUID for message ID
            conversationId: messageData.conversationId,
            senderId: userId,
            senderRole: userRole as 'customer' | 'artist',
            messageType: messageData.messageType,
            content: messageData.content || '',
            images: messageData.images,
            bookingId: messageData.bookingId,
            sentAt: new Date().toISOString(),
          };

          // Emit to all users in the conversation (including sender for consistency)
          io?.to(`conversation:${messageData.conversationId}`).emit('message:new', chatMessage);

          // Emit delivery confirmation to sender
          socket.emit('message:delivered', {
            messageId: chatMessage.id,
            deliveredAt: new Date().toISOString(),
          });

          logger.info(
            { socketId: socket.id, conversationId: messageData.conversationId, userId },
            'Message sent via WebSocket'
          );
        } catch (error) {
          logger.error({ error, socketId: socket.id, userId }, 'Error sending message');
          socket.emit('error', { message: 'Failed to send message' });
        }
      }
    );

    // Typing indicators
    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user:typing', {
        userId,
        userRole,
        conversationId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user:typing', {
        userId,
        userRole,
        conversationId,
        isTyping: false,
      });
    });

    // Mark message as read
    socket.on('message:read', async (data: { messageId: string; conversationId: string }) => {
      try {
        // Validate access to conversation
        const hasAccess = await conversationService.validateConversationAccess(
          data.conversationId,
          userId
        );
        if (!hasAccess) {
          return;
        }

        // Emit read receipt to conversation participants
        socket.to(`conversation:${data.conversationId}`).emit('message:read', {
          messageId: data.messageId,
          readBy: userId,
          readAt: new Date().toISOString(),
        });

        logger.info(
          { socketId: socket.id, messageId: data.messageId, userId },
          'Message marked as read'
        );
      } catch (error) {
        logger.error(
          { error, socketId: socket.id, messageId: data.messageId },
          'Error marking message as read'
        );
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, userId, reason }, 'Client disconnected');

      // Remove from connected users tracking
      const userSockets = connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          connectedUsers.delete(userId);
        }
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      logger.error({ error, socketId: socket.id, userId }, 'Socket error');
    });
  });

  // Start the adaptive cleanup scheduler
  const cleanupScheduler = createAdaptiveCleanupScheduler(
    connectedUsers,
    messageRateLimit,
    () => io
  );
  cleanupScheduler.start();

  return io;
}

/**
 * Get the Socket.IO server instance
 */
export function getChatSocket(): Server | null {
  return io;
}

/**
 * Check if a user is currently connected
 */
export function isUserConnected(userId: string): boolean {
  return connectedUsers.has(userId) && (connectedUsers.get(userId)?.size ?? 0) > 0;
}

/**
 * Emit event to specific user (all their connected sockets)
 */
export function emitToUser(userId: string, event: string, data: unknown) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Emit event to conversation participants
 */
export function emitToConversation(conversationId: string, event: string, data: unknown) {
  if (io) {
    io.to(`conversation:${conversationId}`).emit(event, data);
  }
}
