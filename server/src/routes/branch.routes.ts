import { Router } from 'express';
import * as branchController from '../controllers/branch.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

// Mounted at /api/admin/branches — every route here requires the Super
// Admin session. Public, unauthenticated reads live in public.routes.ts.
const router = Router();

router.use(requireAuth);

router.get('/', branchController.listBranches);
router.get('/:id', branchController.getBranch);
router.post('/', validateBody(branchController.createBranchSchema), branchController.createBranch);
router.put('/:id', validateBody(branchController.updateBranchSchema), branchController.updateBranch);
router.delete('/:id', branchController.deactivateBranch);

export default router;
