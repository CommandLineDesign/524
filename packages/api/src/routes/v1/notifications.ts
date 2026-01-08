import { type Router as ExpressRouter, Router } from 'express';

import { NotificationController } from '../../controllers/notificationController.js';
import { requireAuth } from '../../middleware/auth.js';

const router: ExpressRouter = Router();

// Notification preferences
router.get('/preferences', requireAuth(), NotificationController.getPreferences);
router.put('/preferences', requireAuth(), NotificationController.updatePreferences);

// Notification inbox
router.get('/', requireAuth(), NotificationController.getNotifications);
router.get('/unread-count', requireAuth(), NotificationController.getUnreadCount);
router.post('/:id/read', requireAuth(), NotificationController.markAsRead);
router.post('/read-all', requireAuth(), NotificationController.markAllAsRead);

export const notificationRouter: ExpressRouter = router;
