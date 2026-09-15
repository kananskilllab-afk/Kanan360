import { Router } from 'express';
import * as areaController from '../controllers/area.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

// Mounted at /api/admin/areas — requires the Super Admin session. The
// public equivalent (no employee detail) lives in public.routes.ts.
const router = Router();

router.use(requireAuth);

router.get('/', areaController.listAreas);
router.get('/code/:areaCode', areaController.getAreaByCode);
router.get('/:id', areaController.getArea);
router.post('/', validateBody(areaController.createAreaSchema), areaController.createArea);
router.put('/:id', validateBody(areaController.updateAreaSchema), areaController.updateArea);
router.patch('/:id/deactivate', areaController.deactivateArea);

export default router;
