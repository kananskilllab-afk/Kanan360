import { Types } from 'mongoose';
import { Area, Branch, Floor } from '../models/index.js';

// Branch.totalFloors / totalAreaSqFt and Floor.totalAreaSqFt are derived
// rollups (ARCH-SPEC DAT·02) — recomputed here after any write that could
// change them, rather than trusted from client input.

export async function recomputeFloorArea(floorId: string): Promise<void> {
  const agg = await Area.aggregate<{ _id: null; total: number }>([
    { $match: { floorId: new Types.ObjectId(floorId), status: 'ACTIVE' } },
    { $group: { _id: null, total: { $sum: '$areaSqFt' } } },
  ]);
  await Floor.findByIdAndUpdate(floorId, { totalAreaSqFt: agg[0]?.total ?? 0 });
}

export async function recomputeBranchRollups(branchId: string): Promise<void> {
  const [floorCount, areaAgg] = await Promise.all([
    Floor.countDocuments({ branchId, status: 'ACTIVE' }),
    Floor.aggregate<{ _id: null; total: number }>([
      { $match: { branchId: new Types.ObjectId(branchId), status: 'ACTIVE' } },
      { $group: { _id: null, total: { $sum: '$totalAreaSqFt' } } },
    ]),
  ]);
  await Branch.findByIdAndUpdate(branchId, {
    totalFloors: floorCount,
    totalAreaSqFt: areaAgg[0]?.total ?? 0,
  });
}
