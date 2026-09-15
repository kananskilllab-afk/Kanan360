import { z } from 'zod';
import { Department } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { writeAudit } from '../services/audit.service.js';

export const createDepartmentSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(12),
  colorToken: z.string().min(1),
  headOfDepartmentId: z.string().length(24).optional(),
  branchIds: z.array(z.string().length(24)).default([]),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const listDepartments = asyncHandler(async (_req, res) => {
  const departments = await Department.find().sort({ name: 1 }).lean();
  res.json({ departments });
});

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  await writeAudit({
    userId: req.user!.sub,
    action: 'DEPARTMENT_CREATE',
    entityType: 'Department',
    entityId: String(department._id),
    after: department.toObject(),
  });
  res.status(201).json({ department });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const before = await Department.findById(req.params.id).lean();
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  await writeAudit({
    userId: req.user!.sub,
    action: 'DEPARTMENT_UPDATE',
    entityType: 'Department',
    entityId: String(req.params.id),
    before,
    after: department?.toObject(),
  });
  res.json({ department });
});
