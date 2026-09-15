import { Schema, model } from 'mongoose';

const locationRef = {
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  floorId: { type: Schema.Types.ObjectId, ref: 'Floor' },
  areaId: { type: Schema.Types.ObjectId, ref: 'Area' },
  seatId: { type: Schema.Types.ObjectId, ref: 'Seat' },
};

// Append-only ledger — never mutated, never deleted (ARCH-SPEC DAT·02).
const assignmentHistorySchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    from: locationRef,
    to: locationRef,
    movedAt: { type: Date, default: Date.now },
    movedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String },
  },
  { timestamps: false },
);

export const AssignmentHistory = model('AssignmentHistory', assignmentHistorySchema);
