import { Router } from 'express';
import * as floorController from '../controllers/floor.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

// Mounted at /api/admin/floors — requires the Super Admin session.
const router = Router();

router.use(requireAuth);

router.get('/', floorController.listFloors);
router.get('/:id', floorController.getFloor);
router.post('/', validateBody(floorController.createFloorSchema), floorController.createFloor);
router.put('/:id', validateBody(floorController.updateFloorSchema), floorController.updateFloor);

export default router;
