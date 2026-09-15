import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/overview', analyticsController.getOverview);
router.get('/branches', analyticsController.getBranchAnalytics);
router.get('/utilization', analyticsController.getUtilization);

export default router;
