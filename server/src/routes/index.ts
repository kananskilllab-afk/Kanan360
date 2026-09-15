import { Router } from 'express';
import authRoutes from './auth.routes.js';
import publicRoutes from './public.routes.js';
import branchRoutes from './branch.routes.js';
import floorRoutes from './floor.routes.js';
import areaRoutes from './area.routes.js';
import seatRoutes from './seat.routes.js';
import employeeRoutes from './employee.routes.js';
import departmentRoutes from './department.routes.js';
import analyticsRoutes from './analytics.routes.js';
import searchRoutes from './search.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', service: 'kanan-baroda-api' }));

// Auth — the only door. No registration route exists anywhere in this API.
router.use('/auth', authRoutes);

// Public — no auth. Everything the public 3D site reads lives here.
router.use('/public', publicRoutes);

// Admin — every route below requires the one Super Admin session
// (enforced inside each router, not by this mount point alone).
router.use('/admin/branches', branchRoutes);
router.use('/admin/floors', floorRoutes);
router.use('/admin/areas', areaRoutes);
router.use('/admin/seats', seatRoutes);
router.use('/admin/employees', employeeRoutes);
router.use('/admin/departments', departmentRoutes);
router.use('/admin/analytics', analyticsRoutes);
router.use('/admin/search', searchRoutes);
router.use('/admin', adminRoutes); // /admin/audit-logs

export default router;
