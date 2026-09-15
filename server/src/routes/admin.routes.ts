import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.js';

// Mounted at /api/admin/audit-logs — requires the Super Admin session.
// No user-management routes here on purpose: there is exactly one Super
// Admin account, created once by the seed script, with no in-app way to
// create another (ARCH-SPEC "CRITICAL ACCESS REQUIREMENT").
const router = Router();

router.use(requireAuth);

router.get('/audit-logs', adminController.listAuditLogs);

export default router;
