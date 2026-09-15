import { Schema, model } from 'mongoose';
import { EMPLOYEE_STATUSES } from '@kanan-baroda/shared';

const employeeSchema = new Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true }, // "KB-EMP-1042"
    employeeCode: { type: String, required: true, unique: true, trim: true }, // HR/payroll code
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    designation: { type: String, required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    floorId: { type: Schema.Types.ObjectId, ref: 'Floor', required: true },
    areaId: { type: Schema.Types.ObjectId, ref: 'Area', required: true },
    seatId: { type: Schema.Types.ObjectId, ref: 'Seat' },
    managerId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    status: { type: String, enum: EMPLOYEE_STATUSES, default: 'ACTIVE' },
    joiningDate: { type: Date, required: true },
    profileImageUrl: { type: String },
    // Every seeded record is stamped so it can never be mistaken for a
    // real HR record (ARCH-SPEC RSK·10).
    isDemoData: { type: Boolean, default: false },
  },
  { timestamps: true },
);

employeeSchema.index({ name: 'text', employeeId: 'text', employeeCode: 'text' });

export const Employee = model('Employee', employeeSchema);
