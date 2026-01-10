import { type Router as IRouter, Response, Router } from 'express';

import { type AuthRequest, requireAuth } from '../../middleware/auth.js';
import { ConversationService } from '../../services/conversationService.js';
import { MessageService } from '../../services/messageService.js';
import { uploadMessageImage } from '../../services/uploadService.js';

/**
 * Type guard to check if user has primaryRole (ensured by auth middleware)
 */
function hasPrimaryRole(
  user: AuthRequest['user']
): user is NonNullable<AuthRequest['user']> & { primaryRole: string } {
  return user !== undefined && 'primaryRole' in user && typeof user.primaryRole === 'string';
}

const router = Router();

// Pagination constants
const CONVERSATIONS_DEFAULT_LIMIT = 20;
const CONVERSATIONS_MAX_LIMIT = 50;
const MESSAGES_DEFAULT_LIMIT = 50;
const MESSAGES_MAX_LIMIT = 100;

// Apply authentication to all messaging routes
router.use(requireAuth());

// Initialize services
const conversationService = new ConversationService();
const messageService = new MessageService();

// Conversation routes

/**
 * GET /api/v1/conversations
 * Get user's conversations with pagination
 */
router.get('/conversations', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !hasPrimaryRole(req.user)) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const userId = req.user.id;
    const userRole = req.user.primaryRole;

    const rawLimit = Number(req.query.limit);
    const rawOffset = Number(req.query.offset);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), CONVERSATIONS_MAX_LIMIT)
      : CONVERSATIONS_DEFAULT_LIMIT;
    const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

    const result = await conversationService.getUserConversations(
      userId,
      userRole as 'customer' | 'artist',
      { limit, offset }
    );

    res.json({
      success: true,
      data: result.conversations,
      pagination: {
        limit,
        offset,
        hasMore: result.hasMore,
        total: result.total,
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
    });
  }
});

/**
 * GET /api/v1/conversations/:id
 * Get conversation details
 */
router.get('/conversations/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const conversationId = req.params.id;
    const userId = req.user.id;

    const conversation = await conversationService.getConversation(conversationId, userId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found or access denied',
      });
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation',
    });
  }
});

/**
 * POST /api/v1/conversations
 * Create or get existing conversation
 */
router.post('/conversations', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { artistId, bookingId } = req.body;
    const customerId = req.user.id;

    if (!artistId) {
      return res.status(400).json({
        success: false,
        error: 'artistId is required',
      });
    }

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'bookingId is required',
      });
    }

    if (artistId === customerId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create conversation with self',
      });
    }

    const conversation = await conversationService.getOrCreateConversation(
      customerId,
      artistId,
      bookingId
    );

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation',
    });
  }
});

/**
 * PUT /api/v1/conversations/:id/read
 * Mark messages as read in conversation
 */
router.put('/conversations/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !hasPrimaryRole(req.user)) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const conversationId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.primaryRole;

    const conversation = await conversationService.markAsRead(
      conversationId,
      userId,
      userRole as 'customer' | 'artist'
    );

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark conversation as read',
    });
  }
});

/**
 * POST /api/v1/conversations/:id/archive
 * Archive conversation
 */
router.post('/conversations/:id/archive', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const conversationId = req.params.id;
    const userId = req.user.id;

    const conversation = await conversationService.archiveConversation(conversationId, userId);

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error archiving conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive conversation',
    });
  }
});

// Message routes

/**
 * GET /api/v1/conversations/:id/messages
 * Get messages for a conversation
 */
router.get('/conversations/:id/messages', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const conversationId = req.params.id;
    const userId = req.user.id;

    const rawLimit = Number(req.query.limit);
    const rawOffset = Number(req.query.offset);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), MESSAGES_MAX_LIMIT)
      : MESSAGES_DEFAULT_LIMIT;
    const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

    const result = await messageService.getMessages(conversationId, userId, { limit, offset });

    res.json({
      success: true,
      data: result.messages,
      pagination: {
        limit,
        offset,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
    });
  }
});

/**
 * POST /api/v1/conversations/:id/messages
 * Send a message
 */
router.post('/conversations/:id/messages', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !hasPrimaryRole(req.user)) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const conversationId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.primaryRole;

    const { messageType, content, images, bookingId } = req.body;

    if (!messageType || !['text', 'image', 'system'].includes(messageType)) {
      return res.status(400).json({
        success: false,
        error: 'Valid messageType is required (text, image, or system)',
      });
    }

    if (messageType === 'text' && !content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required for text messages',
      });
    }

    const message = await messageService.sendMessage({
      conversationId,
      senderId: userId,
      senderRole: userRole as 'customer' | 'artist',
      messageType,
      content,
      images,
      bookingId,
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
    });
  }
});

/**
 * PUT /api/v1/messages/:id/read
 * Mark a specific message as read
 */
router.put('/messages/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const messageId = req.params.id;
    const userId = req.user.id;

    const message = await messageService.markMessageAsRead(messageId, userId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or access denied',
      });
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark message as read',
    });
  }
});

/**
 * GET /api/v1/messages/unread-count
 * Get total unread message count for user
 */
router.get('/messages/unread-count', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !hasPrimaryRole(req.user)) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const userId = req.user.id;
    const userRole = req.user.primaryRole;

    const count = await messageService.getTotalUnreadCount(
      userId,
      userRole as 'customer' | 'artist'
    );

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count',
    });
  }
});

// Image upload endpoint

/**
 * POST /api/v1/messaging/upload-image
 * Upload image for messaging
 */
router.post('/upload-image', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { fileName, fileType, fileSize, conversationId } = req.body;

    if (!fileName || !fileType || !conversationId) {
      return res.status(400).json({
        success: false,
        error: 'fileName, fileType, and conversationId are required',
      });
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (!fileSize || typeof fileSize !== 'number' || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file size. Maximum allowed size is 10MB.',
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(fileType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      });
    }

    // Validate user has access to the conversation
    const hasAccess = await conversationService.validateConversationAccess(
      conversationId,
      req.user.id
    );
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to conversation',
      });
    }

    // Generate signed URL for S3 upload
    const uploadResult = await uploadMessageImage({
      fileName,
      fileType,
      fileSize,
      conversationId,
      userId: req.user.id,
    });

    res.json({
      success: true,
      data: uploadResult,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate upload URL',
    });
  }
});

export const messagingRouter: IRouter = router;
