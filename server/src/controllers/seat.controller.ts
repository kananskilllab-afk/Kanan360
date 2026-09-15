import { z } from 'zod';
import { Employee, Seat } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { writeAudit } from '../services/audit.service.js';

export const createSeatSchema = z.object({
  branchId: z.string().length(24),
  floorId: z.string().length(24),
  areaId: z.string().length(24),
  seatCode: z.string().min(3),
  geometryId: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number().optional() }),
});

export const assignSeatSchema = z.object({ employeeId: z.string().length(24) });

export const listSeats = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = {};
  if (req.query.areaId) filter.areaId = req.query.areaId;
  if (req.query.floorId) filter.floorId = req.query.floorId;
  if (req.query.branchId) filter.branchId = req.query.branchId;

  const seats = await Seat.find(filter)
    .populate({ path: 'employeeId', select: 'name employeeId designation profileImageUrl' })
    .lean();
  res.json({ seats });
});

export const createSeat = asyncHandler(async (req, res) => {
  const data = req.body as z.infer<typeof createSeatSchema>;
  const seat = await Seat.create({ ...data, geometryId: data.geometryId ?? data.seatCode, status: 'AVAILABLE' });
  await writeAudit({
    userId: req.user!.sub,
    action: 'SEAT_CREATE',
    entityType: 'Seat',
    entityId: String(seat._id),
    after: seat.toObject(),
  });
  res.status(201).json({ seat });
});

export const assignSeat = asyncHandler(async (req, res) => {
  const { employeeId } = req.body as z.infer<typeof assignSeatSchema>;

  const seat = await Seat.findById(req.params.id);
  if (!seat) throw ApiError.notFound('Seat not found');
  if (seat.employeeId) throw ApiError.conflict('This seat is already occupied — unassign it first');

  const employee = await Employee.findById(employeeId);
  if (!employee) throw ApiError.notFound('Employee not found');
  // Prevent double-occupancy: an already-seated employee must be relocated
  // via POST /employees/:id/move (which frees the old seat and records
  // AssignmentHistory), not silently re-pointed here.
  if (employee.seatId) {
    throw ApiError.conflict('This employee already has a seat — use Move Employee to relocate them');
  }

  const before = seat.toObject();
  seat.employeeId = employee._id;
  seat.status = 'OCCUPIED';
  await seat.save();

  employee.seatId = seat._id;
  employee.areaId = seat.areaId;
  employee.floorId = seat.floorId;
  employee.branchId = seat.branchId;
  await employee.save();

  await writeAudit({
    userId: req.user!.sub,
    action: 'SEAT_ASSIGN',
    entityType: 'Seat',
    entityId: String(seat._id),
    before,
    after: seat.toObject(),
  });
  res.json({ seat });
});

export const unassignSeat = asyncHandler(async (req, res) => {
  const seat = await Seat.findById(req.params.id);
  if (!seat) throw ApiError.notFound('Seat not found');

  const before = seat.toObject();
  if (seat.employeeId) {
    await Employee.findByIdAndUpdate(seat.employeeId, { $unset: { seatId: 1 } });
  }
  seat.employeeId = null;
  seat.status = 'AVAILABLE';
  await seat.save();

  await writeAudit({
    userId: req.user!.sub,
    action: 'SEAT_UNASSIGN',
    entityType: 'Seat',
    entityId: String(seat._id),
    before,
    after: seat.toObject(),
  });
  res.json({ seat });
});
