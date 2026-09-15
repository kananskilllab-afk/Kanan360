import { z } from 'zod';
import { AREA_TYPES } from '@kanan-baroda/shared';
import { Area, Employee, Seat } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { recomputeFloorArea, recomputeBranchRollups } from '../services/rollup.service.js';
import { writeAudit } from '../services/audit.service.js';

export const createAreaSchema = z.object({
  branchId: z.string().length(24),
  floorId: z.string().length(24),
  areaCode: z.string().min(3),
  name: z.string().min(1),
  type: z.enum(AREA_TYPES),
  departmentId: z.string().length(24).optional(),
  areaSqFt: z.number().positive(),
  seatingCapacity: z.number().int().min(0).default(0),
  geometryId: z.string().optional(),
  managerId: z.string().length(24).optional(),
});

export const updateAreaSchema = createAreaSchema.partial().omit({ branchId: true, floorId: true, areaCode: true });

async function withOccupancy(areas: Array<Record<string, unknown> & { _id: unknown }>) {
  const areaIds = areas.map((a) => a._id);
  const seatStats = await Seat.aggregate<{ _id: unknown; total: number; occupied: number }>([
    { $match: { areaId: { $in: areaIds } } },
    {
      $group: {
        _id: '$areaId',
        total: { $sum: 1 },
        occupied: { $sum: { $cond: [{ $eq: ['$status', 'OCCUPIED'] }, 1, 0] } },
      },
    },
  ]);
  const byArea = new Map(seatStats.map((s) => [String(s._id), s]));
  return areas.map((a) => {
    const stats = byArea.get(String(a._id));
    const occupied = stats?.occupied ?? 0;
    const capacity = (a.seatingCapacity as number) ?? 0;
    return {
      ...a,
      occupiedSeats: occupied,
      availableSeats: Math.max(capacity - occupied, 0),
      utilization: capacity ? Math.round((occupied / capacity) * 1000) / 10 : 0,
    };
  });
}

export const listAreas = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { status: 'ACTIVE' };
  if (req.query.floorId) filter.floorId = req.query.floorId;
  if (req.query.branchId) filter.branchId = req.query.branchId;
  const areas = await Area.find(filter).lean();
  res.json({ areas: await withOccupancy(areas) });
});

export const getArea = asyncHandler(async (req, res) => {
  const area = await Area.findById(req.params.id).lean();
  if (!area) throw ApiError.notFound('Area not found');
  const [withStats] = await withOccupancy([area]);
  const employees = await Employee.find({ areaId: area._id, status: { $ne: 'INACTIVE' } })
    .select('name employeeId designation profileImageUrl seatId status')
    .lean();
  res.json({ area: withStats, employees });
});

// The lookup the 2D and 3D renderers fall back to on a cache miss — see
// ARCH-SPEC IDX·03. This is the one place a raw SVG id / GLB mesh name
// turns into a full business record.
export const getAreaByCode = asyncHandler(async (req, res) => {
  const area = await Area.findOne({ areaCode: req.params.areaCode }).lean();
  if (!area) throw ApiError.notFound(`No area is linked to geometry id "${req.params.areaCode}"`);
  const [withStats] = await withOccupancy([area]);
  const employees = await Employee.find({ areaId: area._id, status: { $ne: 'INACTIVE' } })
    .select('name employeeId designation profileImageUrl seatId status')
    .lean();
  res.json({ area: withStats, employees });
});

export const createArea = asyncHandler(async (req, res) => {
  const data = req.body as z.infer<typeof createAreaSchema>;
  const existing = await Area.findOne({ areaCode: data.areaCode });
  if (existing) throw ApiError.conflict(`Area code "${data.areaCode}" is already assigned`);

  const area = await Area.create({ ...data, geometryId: data.geometryId ?? data.areaCode });
  await recomputeFloorArea(data.floorId);
  await recomputeBranchRollups(data.branchId);
  await writeAudit({
    userId: req.user!.sub,
    action: 'AREA_CREATE',
    entityType: 'Area',
    entityId: String(area._id),
    after: area.toObject(),
  });
  res.status(201).json({ area });
});

export const updateArea = asyncHandler(async (req, res) => {
  const before = await Area.findById(req.params.id).lean();
  if (!before) throw ApiError.notFound('Area not found');

  const area = await Area.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (area) {
    await recomputeFloorArea(String(area.floorId));
    await recomputeBranchRollups(String(area.branchId));
  }
  await writeAudit({
    userId: req.user!.sub,
    action: 'AREA_UPDATE',
    entityType: 'Area',
    entityId: String(req.params.id),
    before,
    after: area?.toObject(),
  });
  res.json({ area });
});

export const deactivateArea = asyncHandler(async (req, res) => {
  const area = await Area.findByIdAndUpdate(req.params.id, { status: 'INACTIVE' }, { new: true });
  if (!area) throw ApiError.notFound('Area not found');
  await recomputeFloorArea(String(area.floorId));
  await recomputeBranchRollups(String(area.branchId));
  await writeAudit({
    userId: req.user!.sub,
    action: 'AREA_DEACTIVATE',
    entityType: 'Area',
    entityId: String(req.params.id),
  });
  res.json({ area });
});
