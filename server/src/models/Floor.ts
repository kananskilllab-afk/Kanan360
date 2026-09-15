import { Schema, model } from 'mongoose';
import { FLOOR_STATUSES } from '@kanan-baroda/shared';

const floorSchema = new Schema(
  {
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    name: { type: String, required: true, trim: true },
    floorNumber: { type: Number, required: true },
    totalAreaSqFt: { type: Number, default: 0 },
    floorPlan2DUrl: { type: String },
    floorPlan3DUrl: { type: String },
    // Ties one SVG + one GLB + one metadata manifest to a single export
    // pass out of the CDR → SVG → GLB pipeline (ARCH-SPEC FLO·07).
    floorPlanMetaVersion: { type: String },
    status: { type: String, enum: FLOOR_STATUSES, default: 'ACTIVE' },
    isDemoData: { type: Boolean, default: false },
  },
  { timestamps: true },
);

floorSchema.index({ branchId: 1, floorNumber: 1 }, { unique: true });

export const Floor = model('Floor', floorSchema);
