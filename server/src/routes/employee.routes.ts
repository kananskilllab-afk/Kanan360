import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

// Mounted at /api/admin/employees — requires the Super Admin session.
// Employee records (names, contact info) are never exposed publicly.
const router = Router();

router.use(requireAuth);

router.get('/', employeeController.listEmployees);
router.get('/:id', employeeController.getEmployee);
router.get('/:id/history', employeeController.getEmployeeHistory);
router.post('/', validateBody(employeeController.createEmployeeSchema), employeeController.createEmployee);
router.put('/:id', validateBody(employeeController.updateEmployeeSchema), employeeController.updateEmployee);
router.post('/:id/move', validateBody(employeeController.moveEmployeeSchema), employeeController.moveEmployee);

export default router;
