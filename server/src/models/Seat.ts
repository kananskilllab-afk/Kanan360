import { Schema, model } from 'mongoose';
import { SEAT_STATUSES } from '@kanan-baroda/shared';

const seatSchema = new Schema(
  {
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    floorId: { type: Schema.Types.ObjectId, ref: 'Floor', required: true, index: true },
    areaId: { type: Schema.Types.ObjectId, ref: 'Area', required: true, index: true },
    seatCode: { type: String, required: true, unique: true, trim: true }, // "VAD01-F1-A014-S07"
    geometryId: { type: String, required: true }, // instance/marker id in the GLB or SVG
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number },
    },
    status: { type: String, enum: SEAT_STATUSES, default: 'AVAILABLE', index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null, index: true },
    isDemoData: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Seat = model('Seat', seatSchema);
