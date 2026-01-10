import { type Router as IRouter, Router } from 'express';

import { OnboardingController } from '../../controllers/onboardingController.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/state', requireAuth(), OnboardingController.getState);
router.post('/responses', requireAuth(), OnboardingController.saveResponse);
router.post('/complete', requireAuth(), OnboardingController.complete);

export const onboardingRouter: IRouter = router;
