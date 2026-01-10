import { type Router as IRouter, Router } from 'express';

import { DeviceController } from '../../controllers/deviceController.js';
import { requireAuth } from '../../middleware/auth.js';
import { createDeviceRateLimiter } from '../../middleware/rateLimiter.js';

const router = Router();
const deviceRateLimiter = createDeviceRateLimiter();

// Register device token (requires authentication)
router.post('/register', deviceRateLimiter, requireAuth(), DeviceController.registerDevice);

// Unregister device token
router.post('/unregister', deviceRateLimiter, requireAuth(), DeviceController.unregisterDevice);

// Unregister all devices (logout from all)
router.post(
  '/unregister-all',
  deviceRateLimiter,
  requireAuth(),
  DeviceController.unregisterAllDevices
);

export const deviceRouter: IRouter = router;
