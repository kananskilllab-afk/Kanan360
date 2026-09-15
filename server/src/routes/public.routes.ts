import { Router } from 'express';
import * as publicController from '../controllers/public.controller.js';

// Mounted at /api/public — no auth anywhere in this file, deliberately.
// The public website is not a login-gated app that happens to allow guest
// browsing; it has no concept of a signed-in visitor at all.
const router = Router();

router.get('/overview', publicController.getPublicOverview);
router.get('/branches', publicController.listPublicBranches);
router.get('/branches/:id', publicController.getPublicBranch);
router.get('/floors', publicController.listPublicFloors);
router.get('/areas', publicController.listPublicAreas);
router.get('/areas/code/:areaCode', publicController.getPublicAreaByCode);

export default router;
