import { type Router as IRouter, Router } from 'express';

import { CustomerController } from '../../controllers/customerController.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

// Customer profile routes - require authenticated customer
router.get('/me/profile', requireAuth(['customer']), CustomerController.getMyProfile);
router.patch('/me/profile', requireAuth(['customer']), CustomerController.updateMyProfile);

export const customerRouter: IRouter = router;
