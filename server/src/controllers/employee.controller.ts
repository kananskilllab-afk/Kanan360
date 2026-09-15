import { z } from 'zod';
import { EMPLOYEE_STATUSES } from '@kanan-baroda/shared';
import { AssignmentHistory, Employee, Seat } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { writeAudit } from '../services/audit.service.js';

export const createEmployeeSchema = z.object({
  employeeId: z.string().min(3),
  employeeCode: z.string().min(3),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.string().length(24),
  designation: z.string().min(2),
  branchId: z.string().length(24),
  floorId: z.string().length(24),
  areaId: z.string().length(24),
  managerId: z.string().length(24).optional(),
  joiningDate: z.coerce.date(),
  profileImageUrl: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  status: z.enum(EMPLOYEE_STATUSES).optional(),
});

export const moveEmployeeSchema = z.object({
  to: z.object({
    branchId: z.string().length(24),
    floorId: z.string().length(24),
    areaId: z.string().length(24),
    seatId: z.string().length(24).optional(),
  }),
  reason: z.string().optional(),
});

export const listEmployees = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { status: { $ne: 'INACTIVE' } };
  if (req.query.branchId) filter.branchId = req.query.branchId;
  if (req.query.department) filter.department = req.query.department;
  if (req.query.q) {
    filter.$text = { $search: String(req.query.q) };
  }

  const employees = await Employee.find(filter)
    .populate('department', 'name code colorToken')
    .sort({ name: 1 })
    .limit(200)
    .lean();
  res.json({ employees });
});

export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('department', 'name code colorToken')
    .populate('managerId', 'name designation')
    .lean();
  if (!employee) throw ApiError.notFound('Employee not found');
  res.json({ employee });
});

export const createEmployee = asyncHandler(async (req, res) => {
  const data = req.body as z.infer<typeof createEmployeeSchema>;
  const employee = await Employee.create(data);
  await writeAudit({
    userId: req.user!.sub,
    action: 'EMPLOYEE_CREATE',
    entityType: 'Employee',
    entityId: String(employee._id),
    after: employee.toObject(),
  });
  res.status(201).json({ employee });
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const before = await Employee.findById(req.params.id).lean();
  if (!before) throw ApiError.notFound('Employee not found');

  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  await writeAudit({
    userId: req.user!.sub,
    action: 'EMPLOYEE_UPDATE',
    entityType: 'Employee',
    entityId: String(req.params.id),
    before,
    after: employee?.toObject(),
  });
  res.json({ employee });
});

// The one endpoint that can relocate an employee across branch / floor /
// area / seat in a single step, always leaving a ledger entry behind
// (ARCH-SPEC "Employee Movement").
export const moveEmployee = asyncHandler(async (req, res) => {
  const { to, reason } = req.body as z.infer<typeof moveEmployeeSchema>;

  const employee = await Employee.findById(req.params.id);
  if (!employee) throw ApiError.notFound('Employee not found');

  const from = {
    branchId: employee.branchId,
    floorId: employee.floorId,
    areaId: employee.areaId,
    seatId: employee.seatId,
  };

  if (employee.seatId) {
    await Seat.findByIdAndUpdate(employee.seatId, { $unset: { employeeId: 1 }, status: 'AVAILABLE' });
  }
  if (to.seatId) {
    const targetSeat = await Seat.findById(to.seatId);
    if (!targetSeat) throw ApiError.notFound('Target seat not found');
    if (targetSeat.employeeId) throw ApiError.conflict('Target seat is already occupied');
    targetSeat.employeeId = employee._id;
    targetSeat.status = 'OCCUPIED';
    await targetSeat.save();
  }

  employee.branchId = to.branchId as never;
  employee.floorId = to.floorId as never;
  employee.areaId = to.areaId as never;
  employee.seatId = to.seatId as never;
  await employee.save();

  await AssignmentHistory.create({
    employeeId: employee._id,
    from,
    to,
    movedBy: req.user!.sub,
    reason,
  });
  await writeAudit({
    userId: req.user!.sub,
    action: 'EMPLOYEE_MOVE',
    entityType: 'Employee',
    entityId: String(employee._id),
    before: from,
    after: to,
  });

  res.json({ employee });
});

export const getEmployeeHistory = asyncHandler(async (req, res) => {
  const history = await AssignmentHistory.find({ employeeId: req.params.id })
    .sort({ movedAt: -1 })
    .populate('movedBy', 'name email')
    .lean();
  res.json({ history });
});
