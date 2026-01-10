import { type Router as IRouter, Router } from 'express';

import { AdminArtistController } from '../../controllers/adminArtistController.js';
import { AdminBookingController } from '../../controllers/adminBookingController.js';
import { AdminReviewController } from '../../controllers/adminReviewController.js';
import { AdminUserController } from '../../controllers/adminUserController.js';
import { type AuthRequest } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/auth.js';
import { auditLogRepository } from '../../repositories/auditLogRepository.js';
import { ConversationService } from '../../services/conversationService.js';
import { MessageService } from '../../services/messageService.js';
import { validateUUIDParam } from '../../utils/validation.js';

// Initialize services
const conversationService = new ConversationService();
const messageService = new MessageService();

const router = Router();

router.get('/pending-artists', requireAdmin(), AdminArtistController.listPendingArtists);
router.get('/pending-artists/:artistId', requireAdmin(), AdminArtistController.getPendingArtist);
router.patch(
  '/pending-artists/:artistId',
  requireAdmin(),
  AdminArtistController.updatePendingArtist
);
router.post(
  '/pending-artists/:artistId/activate',
  requireAdmin(),
  AdminArtistController.activatePendingArtist
);

router.get('/users', requireAdmin(), AdminUserController.listUsers);
router.get('/users/:id', requireAdmin(), AdminUserController.getUser);
router.put('/users/:id', requireAdmin(), AdminUserController.updateUser);
router.post('/users/:id/ban', requireAdmin(), AdminUserController.banUser);
router.post('/users/:id/unban', requireAdmin(), AdminUserController.unbanUser);

router.get('/bookings', requireAdmin(), AdminBookingController.listBookings);
router.get('/bookings/:bookingId', requireAdmin(), AdminBookingController.getBookingDetail);

router.get('/artists', requireAdmin(), AdminArtistController.listArtists);
router.get('/artists/:artistId', requireAdmin(), AdminArtistController.getArtist);
router.put('/artists/:artistId', requireAdmin(), AdminArtistController.updateArtist);

router.get('/reviews', requireAdmin(), AdminReviewController.listReviews);
router.get('/reviews/:id', requireAdmin(), AdminReviewController.getReview);

// Admin messaging endpoints
router.get('/conversations', requireAdmin(), async (req: AuthRequest, res) => {
  try {
    // Parse pagination parameters
    const MAX_LIMIT = 100;
    const DEFAULT_LIMIT = 50;
    const rawLimit = Number(req.query.limit);
    const rawOffset = Number(req.query.offset);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT)
      : DEFAULT_LIMIT;
    const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

    // Get conversations with pagination
    const conversations = await conversationService.getAllConversations({
      limit,
      offset,
    });

    // Audit log admin access
    await auditLogRepository.create({
      userId: req.user?.id,
      action: 'VIEW_CONVERSATIONS_LIST',
      resourceType: 'conversation',
      resourceId: '00000000-0000-0000-0000-000000000000',
      details: {
        action: 'list_conversations_paginated',
        recordCount: conversations.conversations.length,
        limit,
        offset,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      data: conversations.conversations,
      pagination: {
        limit,
        offset,
        total: conversations.total,
        hasMore: conversations.hasMore,
      },
    });
  } catch (error) {
    console.error('Error fetching admin conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
    });
  }
});

router.get('/conversations/:id', requireAdmin(), async (req: AuthRequest, res) => {
  try {
    const conversationId = req.params.id;

    // Validate conversationId format
    const validation = validateUUIDParam(conversationId, 'conversationId');
    if (!validation.isValid && validation.error) {
      return res.status(validation.error.status).json({
        success: false,
        error: validation.error.message,
      });
    }

    // Admin can view any conversation
    const conversation = await conversationService.getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    // Audit log admin access
    await auditLogRepository.create({
      userId: req.user?.id,
      action: 'VIEW_CONVERSATION',
      resourceType: 'conversation',
      resourceId: conversationId,
      details: {
        action: 'view_conversation_details',
        customerId: conversation.customerId,
        artistId: conversation.artistId,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error fetching admin conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation',
    });
  }
});

router.get('/conversations/:id/messages', requireAdmin(), async (req: AuthRequest, res) => {
  try {
    const conversationId = req.params.id;

    // Validate conversationId format
    const validation = validateUUIDParam(conversationId, 'conversationId');
    if (!validation.isValid && validation.error) {
      return res.status(validation.error.status).json({
        success: false,
        error: validation.error.message,
      });
    }

    // Parse pagination parameters
    const MAX_LIMIT = 100;
    const DEFAULT_LIMIT = 50;
    const rawLimit = Number(req.query.limit);
    const rawOffset = Number(req.query.offset);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT)
      : DEFAULT_LIMIT;
    const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

    // Admin can view messages from any conversation
    const result = await messageService.getMessagesForConversation(conversationId, {
      limit,
      offset,
    });

    // Audit log admin access
    await auditLogRepository.create({
      userId: req.user?.id,
      action: 'VIEW_CONVERSATION_MESSAGES',
      resourceType: 'conversation',
      resourceId: conversationId,
      details: {
        action: 'view_conversation_messages_paginated',
        messageCount: result.messages.length,
        limit,
        offset,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

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
    console.error('Error fetching admin messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
    });
  }
});

export const adminRouter: IRouter = router;
