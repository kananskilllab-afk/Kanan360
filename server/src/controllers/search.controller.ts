import { Area, Branch, Employee } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Admin-only (mounted under /api/admin) — fans out across the three
// things the Super Admin searches for while managing seating. Employee
// records carry PII and are never exposed on the public site.
export const globalSearch = asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (q.length < 2) {
    return res.json({ employees: [], areas: [], branches: [] });
  }

  const [employees, areas, branches] = await Promise.all([
    Employee.find({ $text: { $search: q } })
      .select('name employeeId designation branchId floorId areaId seatId profileImageUrl')
      .limit(8)
      .lean(),
    Area.find({ name: { $regex: q, $options: 'i' }, status: 'ACTIVE' })
      .select('name areaCode branchId floorId type')
      .limit(6)
      .lean(),
    Branch.find({ $or: [{ name: { $regex: q, $options: 'i' } }, { code: { $regex: q, $options: 'i' } }] })
      .select('name code location')
      .limit(4)
      .lean(),
  ]);

  res.json({ employees, areas, branches });
});
