import { Schema, model } from 'mongoose';
import { AUDIT_ACTIONS } from '@kanan-baroda/shared';

// Append-only. Written by services on every administrative mutation —
// never by controllers directly — so no write path can skip it.
const auditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, enum: AUDIT_ACTIONS, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
  },
  { timestamps: false },
);

export const AuditLog = model('AuditLog', auditLogSchema);
