import { Schema, model } from 'mongoose';
import { BRANCH_STATUSES } from '@kanan-baroda/shared';

const branchSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    geo: {
      lat: { type: Number },
      lng: { type: Number },
    },
    // Derived rollups, refreshed whenever a Floor under this branch changes
    // (see services/rollup.service.ts) — never hand-edited.
    totalFloors: { type: Number, default: 0 },
    totalAreaSqFt: { type: Number, default: 0 },
    thumbnailUrl: { type: String },
    status: { type: String, enum: BRANCH_STATUSES, default: 'ACTIVE' },
    isDemoData: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Branch = model('Branch', branchSchema);
