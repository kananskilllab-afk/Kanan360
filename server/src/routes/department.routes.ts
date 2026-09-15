import { Router } from 'express';
import * as departmentController from '../controllers/department.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

// Mounted at /api/admin/departments — requires the Super Admin session.
const router = Router();

router.use(requireAuth);

router.get('/', departmentController.listDepartments);
router.post('/', validateBody(departmentController.createDepartmentSchema), departmentController.createDepartment);
router.put('/:id', validateBody(departmentController.updateDepartmentSchema), departmentController.updateDepartment);

export default router;
