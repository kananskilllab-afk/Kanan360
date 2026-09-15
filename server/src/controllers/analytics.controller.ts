import { Area, Branch, Floor, Seat } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pct, usedSqFt } from '../utils/metrics.js';

export const getOverview = asyncHandler(async (_req, res) => {
  const [totalBranches, totalFloors, areas, seatStats] = await Promise.all([
    Branch.countDocuments({ status: 'ACTIVE' }),
    Floor.countDocuments({ status: 'ACTIVE' }),
    Area.find({ status: 'ACTIVE' }).select('areaSqFt seatingCapacity').lean(),
    Seat.aggregate<{ _id: string; count: number }>([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const seatCounts = Object.fromEntries(seatStats.map((s) => [s._id, s.count]));
  const totalSeats = seatStats.reduce((sum, s) => sum + s.count, 0);
  const occupiedSeats = seatCounts.OCCUPIED ?? 0;
  const availableSeats = seatCounts.AVAILABLE ?? 0;

  const totalOfficeAreaSqFt = areas.reduce((sum, a) => sum + a.areaSqFt, 0);
  // Occupancy at the area level is approximated from the branch-wide seat
  // ratio here (fast, single query); the per-area figure in getArea() is
  // exact.
  const usedAreaSqFt = totalOfficeAreaSqFt * (totalSeats ? occupiedSeats / totalSeats : 0);

  res.json({
    totalBranches,
    totalFloors,
    totalAreas: areas.length,
    totalSeats,
    occupiedSeats,
    availableSeats,
    totalOfficeAreaSqFt: Math.round(totalOfficeAreaSqFt),
    usedAreaSqFt: Math.round(usedAreaSqFt),
    availableAreaSqFt: Math.round(totalOfficeAreaSqFt - usedAreaSqFt),
    overallUtilization: pct(occupiedSeats, totalSeats),
    seatsByStatus: {
      AVAILABLE: seatCounts.AVAILABLE ?? 0,
      OCCUPIED: seatCounts.OCCUPIED ?? 0,
      RESERVED: seatCounts.RESERVED ?? 0,
      MAINTENANCE: seatCounts.MAINTENANCE ?? 0,
      NOT_ASSIGNED: seatCounts.NOT_ASSIGNED ?? 0,
    },
  });
});

export const getBranchAnalytics = asyncHandler(async (_req, res) => {
  const branches = await Branch.find({ status: 'ACTIVE' }).lean();

  const seatStats = await Seat.aggregate<{ _id: string; total: number; occupied: number }>([
    {
      $group: {
        _id: '$branchId',
        total: { $sum: 1 },
        occupied: { $sum: { $cond: [{ $eq: ['$status', 'OCCUPIED'] }, 1, 0] } },
      },
    },
  ]);
  const byBranch = new Map(seatStats.map((s) => [String(s._id), s]));

  res.json({
    branches: branches.map((b) => {
      const stats = byBranch.get(String(b._id));
      const total = stats?.total ?? 0;
      const occupied = stats?.occupied ?? 0;
      return {
        branchId: String(b._id),
        code: b.code,
        name: b.name,
        totalSeats: total,
        occupiedSeats: occupied,
        availableSeats: total - occupied,
        totalAreaSqFt: b.totalAreaSqFt,
        utilization: pct(occupied, total),
      };
    }),
  });
});

export const getUtilization = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { status: 'ACTIVE' };
  if (req.query.branchId) filter.branchId = req.query.branchId;
  if (req.query.floorId) filter.floorId = req.query.floorId;

  const areas = await Area.find(filter).populate('departmentId', 'name colorToken').lean();
  const seatStats = await Seat.aggregate<{ _id: string; total: number; occupied: number }>([
    { $match: filter.floorId ? { floorId: filter.floorId } : filter.branchId ? { branchId: filter.branchId } : {} },
    {
      $group: {
        _id: '$areaId',
        total: { $sum: 1 },
        occupied: { $sum: { $cond: [{ $eq: ['$status', 'OCCUPIED'] }, 1, 0] } },
      },
    },
  ]);
  const byArea = new Map(seatStats.map((s) => [String(s._id), s]));

  const departmentTotals = new Map<string, { name: string; colorToken: string; areaSqFt: number; used: number }>();

  const areaRows = areas.map((a) => {
    const stats = byArea.get(String(a._id));
    const occupied = stats?.occupied ?? 0;
    const used = usedSqFt(a.areaSqFt, a.seatingCapacity, occupied);
    const dept = a.departmentId as unknown as { _id: string; name: string; colorToken: string } | undefined;
    if (dept) {
      const entry = departmentTotals.get(String(dept._id)) ?? {
        name: dept.name,
        colorToken: dept.colorToken,
        areaSqFt: 0,
        used: 0,
      };
      entry.areaSqFt += a.areaSqFt;
      entry.used += used;
      departmentTotals.set(String(dept._id), entry);
    }
    return {
      areaId: String(a._id),
      areaCode: a.areaCode,
      name: a.name,
      areaSqFt: a.areaSqFt,
      seatingCapacity: a.seatingCapacity,
      occupiedSeats: occupied,
      availableSeats: Math.max(a.seatingCapacity - occupied, 0),
      usedAreaSqFt: used,
      utilization: pct(occupied, a.seatingCapacity),
    };
  });

  res.json({
    areas: areaRows,
    departments: Array.from(departmentTotals.entries()).map(([id, d]) => ({
      departmentId: id,
      name: d.name,
      colorToken: d.colorToken,
      areaSqFt: Math.round(d.areaSqFt),
      utilization: pct(d.used, d.areaSqFt),
    })),
  });
});
