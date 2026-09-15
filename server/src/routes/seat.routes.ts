import { Router } from 'express';
import * as seatController from '../controllers/seat.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

// Mounted at /api/admin/seats — requires the Super Admin session.
const router = Router();

router.use(requireAuth);

router.get('/', seatController.listSeats);
router.post('/', validateBody(seatController.createSeatSchema), seatController.createSeat);
router.post('/:id/assign', validateBody(seatController.assignSeatSchema), seatController.assignSeat);
router.post('/:id/unassign', seatController.unassignSeat);

export default router;
