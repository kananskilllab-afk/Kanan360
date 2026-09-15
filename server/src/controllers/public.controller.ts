// No auth on any route in this controller — see routes/public.routes.ts.
// Every response here is deliberately scrubbed of anything that isn't
// "permitted area information": no employee names, emails, or IDs, no
// audit trail, no write access. That boundary is enforced by never
// selecting those fields here, not by trusting the client to hide them
// (ARCH-SPEC "CRITICAL ACCESS REQUIREMENT" / "IMPORTANT DATA SEPARATION").
import { Area, Branch, Floor, Seat } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { pct } from '../utils/metrics.js';

export const listPublicBranches = asyncHandler(async (_req, res) => {
  const branches = await Branch.find({ status: 'ACTIVE' })
    .select('code name location address totalFloors totalAreaSqFt thumbnailUrl')
    .sort({ code: 1 })
    .lean();

  const [seatStats, areaCounts] = await Promise.all([
    Seat.aggregate<{ _id: string; total: number; occupied: number }>([
      {
        $group: {
          _id: '$branchId',
          total: { $sum: 1 },
          occupied: { $sum: { $cond: [{ $eq: ['$status', 'OCCUPIED'] }, 1, 0] } },
        },
      },
    ]),
    Area.aggregate<{ _id: string; count: number }>([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: '$branchId', count: { $sum: 1 } } },
    ]),
  ]);
  const statsByBranch = new Map(seatStats.map((s) => [String(s._id), s]));
  const areaCountByBranch = new Map(areaCounts.map((a) => [String(a._id), a.count]));

  res.json({
    branches: branches.map((b) => {
      const stats = statsByBranch.get(String(b._id));
      const total = stats?.total ?? 0;
      const occupied = stats?.occupied ?? 0;
      return {
        ...b,
        totalAreas: areaCountByBranch.get(String(b._id)) ?? 0,
        totalSeats: total,
        occupiedSeats: occupied,
        availableSeats: total - occupied,
        utilization: pct(occupied, total),
      };
    }),
  });
});

export const getPublicBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findOne({ _id: req.params.id, status: 'ACTIVE' })
    .select('code name location address totalFloors totalAreaSqFt thumbnailUrl')
    .lean();
  if (!branch) throw ApiError.notFound('Branch not found');
  res.json({ branch });
});

export const listPublicFloors = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { status: 'ACTIVE' };
  if (req.query.branchId) filter.branchId = req.query.branchId;
  const floors = await Floor.find(filter)
    .select('branchId name floorNumber totalAreaSqFt floorPlan2DUrl floorPlan3DUrl')
    .sort({ floorNumber: 1 })
    .lean();
  res.json({ floors });
});

async function withPublicOccupancy(areas: Array<Record<string, unknown> & { _id: unknown }>) {
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
      utilization: pct(occupied, capacity),
    };
  });
}

// Fields intentionally excluded vs. the admin equivalent: managerId
// resolves to an Employee — never populated or returned here.
const PUBLIC_AREA_FIELDS =
  'branchId floorId areaCode name type departmentId areaSqFt seatingCapacity geometryId layout status';

export const listPublicAreas = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { status: 'ACTIVE' };
  if (req.query.floorId) filter.floorId = req.query.floorId;
  if (req.query.branchId) filter.branchId = req.query.branchId;
  const areas = await Area.find(filter)
    .select(PUBLIC_AREA_FIELDS)
    .populate('departmentId', 'name colorToken')
    .lean();
  res.json({ areas: await withPublicOccupancy(areas) });
});

// The lookup a 3D scene click resolves through — same role as
// GET /api/admin/areas/code/:areaCode, minus anything non-public
// (ARCH-SPEC IDX·03).
export const getPublicAreaByCode = asyncHandler(async (req, res) => {
  const area = await Area.findOne({ areaCode: req.params.areaCode, status: 'ACTIVE' })
    .select(PUBLIC_AREA_FIELDS)
    .populate('departmentId', 'name colorToken')
    .lean();
  if (!area) throw ApiError.notFound(`No area is linked to geometry id "${req.params.areaCode}"`);
  const [withStats] = await withPublicOccupancy([area]);
  res.json({ area: withStats });
});

export const getPublicOverview = asyncHandler(async (_req, res) => {
  const [totalBranches, totalFloors, totalAreas, seatStats] = await Promise.all([
    Branch.countDocuments({ status: 'ACTIVE' }),
    Floor.countDocuments({ status: 'ACTIVE' }),
    Area.countDocuments({ status: 'ACTIVE' }),
    Seat.aggregate<{ _id: string; count: number }>([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);
  const seatCounts = Object.fromEntries(seatStats.map((s) => [s._id, s.count]));
  const totalSeats = seatStats.reduce((sum, s) => sum + s.count, 0);
  const occupiedSeats = seatCounts.OCCUPIED ?? 0;

  res.json({
    totalBranches,
    totalFloors,
    totalAreas,
    totalSeats,
    occupiedSeats,
    availableSeats: seatCounts.AVAILABLE ?? 0,
    overallUtilization: pct(occupiedSeats, totalSeats),
  });
});
