import { model, models, Schema, type Model } from 'mongoose';
import { PERMISSIONS, ROLE_NAMES, type Permission, type RoleName } from '@/server/auth/permissions';

export type RoleDocument = {
  name: RoleName;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
};

const roleSchema = new Schema<RoleDocument>(
  {
    name: { type: String, enum: ROLE_NAMES, required: true, unique: true, trim: true },
    permissions: [{ type: String, enum: PERMISSIONS, required: true }],
  },
  { timestamps: true },
);

export const Role =
  (models.Role as Model<RoleDocument> | undefined) ?? model<RoleDocument>('Role', roleSchema);
