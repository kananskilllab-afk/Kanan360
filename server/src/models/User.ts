import { Schema, model, type InferSchemaType, type Types } from 'mongoose';
import { ROLES } from '@kanan-baroda/shared';

// The Super Admin identity — exactly one document is ever expected to
// exist (bootstrapped by the seed script). There is no registration flow
// and no other role: see ARCH-SPEC "CRITICAL ACCESS REQUIREMENT".
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true, default: 'SUPER_ADMIN' },
    lastLoginAt: { type: Date },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId };

export const User = model('User', userSchema);
