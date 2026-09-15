import { Schema, model } from 'mongoose';

const departmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    headOfDepartmentId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    // Key into the shared status/theme token set so a department's chart
    // and floor-plan color come from one place (ARCH-SPEC DAT·02).
    colorToken: { type: String, required: true },
    branchIds: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
  },
  { timestamps: true },
);

export const Department = model('Department', departmentSchema);
