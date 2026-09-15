import { z } from 'zod';
import { Floor } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { recomputeBranchRollups } from '../services/rollup.service.js';
import { writeAudit } from '../services/audit.service.js';

export const createFloorSchema = z.object({
  branchId: z.string().length(24),
  name: z.string().min(1),
  floorNumber: z.number().int(),
  floorPlan2DUrl: z.string().optional(),
  floorPlan3DUrl: z.string().optional(),
  floorPlanMetaVersion: z.string().optional(),
});

export const updateFloorSchema = createFloorSchema.partial().omit({ branchId: true });

export const listFloors = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { status: 'ACTIVE' };
  if (req.query.branchId) filter.branchId = req.query.branchId;
  const floors = await Floor.find(filter).sort({ floorNumber: 1 }).lean();
  res.json({ floors });
});

export const getFloor = asyncHandler(async (req, res) => {
  const floor = await Floor.findById(req.params.id).lean();
  if (!floor) throw ApiError.notFound('Floor not found');
  res.json({ floor });
});

export const createFloor = asyncHandler(async (req, res) => {
  const data = req.body as z.infer<typeof createFloorSchema>;
  const floor = await Floor.create(data);
  await recomputeBranchRollups(data.branchId);
  await writeAudit({
    userId: req.user!.sub,
    action: 'FLOOR_CREATE',
    entityType: 'Floor',
    entityId: String(floor._id),
    after: floor.toObject(),
  });
  res.status(201).json({ floor });
});

export const updateFloor = asyncHandler(async (req, res) => {
  const before = await Floor.findById(req.params.id).lean();
  if (!before) throw ApiError.notFound('Floor not found');

  const floor = await Floor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  await writeAudit({
    userId: req.user!.sub,
    action: 'FLOOR_UPDATE',
    entityType: 'Floor',
    entityId: String(req.params.id),
    before,
    after: floor?.toObject(),
  });
  res.json({ floor });
});
