import { z } from 'zod';
import { Area, Branch, Seat } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { writeAudit } from '../services/audit.service.js';

export const createBranchSchema = z.object({
  code: z.string().min(2).max(12),
  name: z.string().min(2),
  location: z.string().min(2),
  address: z.string().min(2),
  geo: z.object({ lat: z.number(), lng: z.number() }).optional(),
  thumbnailUrl: z.string().url().optional(),
});

export const updateBranchSchema = createBranchSchema.partial();

export const listBranches = asyncHandler(async (_req, res) => {
  const branches = await Branch.find({ status: 'ACTIVE' }).sort({ code: 1 }).lean();

  // Seat occupancy is computed live (not stored on Branch) so it's always
  // consistent with the Seat collection — see ARCH-SPEC DAT·02.
  const seatStats = await Seat.aggregate<{
    _id: string;
    total: number;
    occupied: number;
  }>([
    {
      $group: {
        _id: '$branchId',
        total: { $sum: 1 },
        occupied: { $sum: { $cond: [{ $eq: ['$status', 'OCCUPIED'] }, 1, 0] } },
      },
    },
  ]);
  const statsByBranch = new Map(seatStats.map((s) => [String(s._id), s]));

  const areaCounts = await Area.aggregate<{ _id: string; count: number }>([
    { $match: { status: 'ACTIVE' } },
    { $group: { _id: '$branchId', count: { $sum: 1 } } },
  ]);
  const areaCountByBranch = new Map(areaCounts.map((a) => [String(a._id), a.count]));

  res.json({
    branches: branches.map((b) => {
      const stats = statsByBranch.get(String(b._id));
      return {
        ...b,
        totalAreas: areaCountByBranch.get(String(b._id)) ?? 0,
        totalSeats: stats?.total ?? 0,
        occupiedSeats: stats?.occupied ?? 0,
        availableSeats: (stats?.total ?? 0) - (stats?.occupied ?? 0),
        utilization: stats?.total ? Math.round((stats.occupied / stats.total) * 1000) / 10 : 0,
      };
    }),
  });
});

export const getBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id).lean();
  if (!branch) throw ApiError.notFound('Branch not found');
  res.json({ branch });
});

export const createBranch = asyncHandler(async (req, res) => {
  const data = req.body as z.infer<typeof createBranchSchema>;
  const existing = await Branch.findOne({ code: data.code.toUpperCase() });
  if (existing) throw ApiError.conflict(`Branch code "${data.code}" is already in use`);

  const branch = await Branch.create(data);
  await writeAudit({
    userId: req.user!.sub,
    action: 'BRANCH_CREATE',
    entityType: 'Branch',
    entityId: String(branch._id),
    after: branch.toObject(),
  });
  res.status(201).json({ branch });
});

export const updateBranch = asyncHandler(async (req, res) => {
  const before = await Branch.findById(req.params.id).lean();
  if (!before) throw ApiError.notFound('Branch not found');

  const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  await writeAudit({
    userId: req.user!.sub,
    action: 'BRANCH_UPDATE',
    entityType: 'Branch',
    entityId: String(req.params.id),
    before,
    after: branch?.toObject(),
  });
  res.json({ branch });
});

export const deactivateBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findByIdAndUpdate(req.params.id, { status: 'INACTIVE' }, { new: true });
  if (!branch) throw ApiError.notFound('Branch not found');
  await writeAudit({
    userId: req.user!.sub,
    action: 'BRANCH_DEACTIVATE',
    entityType: 'Branch',
    entityId: String(req.params.id),
  });
  res.json({ branch });
});
