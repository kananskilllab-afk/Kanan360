import { Schema, model } from 'mongoose';
import { AREA_STATUSES, AREA_TYPES } from '@kanan-baroda/shared';

// The canonical node in the system — see ARCH-SPEC IDX·03. `areaCode` is
// the exact string that also appears as an SVG element id and a GLB mesh
// name; business data here is never derived from geometry, and geometry
// is never derived from business data.
//
// `layout` is the one deliberate exception, and only until the real
// CDR→SVG→GLB pipeline (ARCH-SPEC FLO·07) exists: for a branch whose
// floor plan has been digitized from an actual architectural drawing, it
// stores that room's real top-left position and footprint in feet, so
// the 3D scene can render its true shape and placement instead of a
// procedurally packed rectangle. It's absent for every area that hasn't
// been digitized — those keep using the procedural layout. When a real
// GLB exists for a floor, this field stops being read at all; nothing
// else in the schema changes.
const areaSchema = new Schema(
  {
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    floorId: { type: Schema.Types.ObjectId, ref: 'Floor', required: true, index: true },
    areaCode: { type: String, required: true, unique: true, trim: true }, // e.g. "VAD01-F1-A014"
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: AREA_TYPES, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    areaSqFt: { type: Number, required: true },
    seatingCapacity: { type: Number, default: 0 },
    // Equal to areaCode today; kept as its own field so a future re-key of
    // areaCode never silently breaks the SVG/GLB join (ARCH-SPEC IDX·03).
    geometryId: { type: String, required: true },
    layout: {
      x: { type: Number }, // top-left corner, feet, floor-local origin
      z: { type: Number },
      widthFt: { type: Number },
      depthFt: { type: Number },
    },
    managerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    status: { type: String, enum: AREA_STATUSES, default: 'ACTIVE' },
    isDemoData: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Area = model('Area', areaSchema);
