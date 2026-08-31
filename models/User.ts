import { model, models, Schema, type Model, type Types } from 'mongoose';
import { hashPassword, verifyPassword } from '@/server/auth/password';

export type UserDocument = {
  name: string;
  email: string;
  passwordHash: string;
  roleId: Types.ObjectId;
  active: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserMethods = {
  setPassword(password: string): Promise<void>;
  verifyPassword(password: string): Promise<boolean>;
};

type UserModel = Model<UserDocument, object, UserMethods>;

const userSchema = new Schema<UserDocument, UserModel, UserMethods>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true, index: true },
    active: { type: Boolean, default: true, index: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.methods.setPassword = async function setUserPassword(password: string): Promise<void> {
  this.passwordHash = await hashPassword(password);
};

userSchema.methods.verifyPassword = function verifyUserPassword(
  password: string,
): Promise<boolean> {
  return verifyPassword(password, this.passwordHash);
};

export const User =
  (models.User as UserModel | undefined) ?? model<UserDocument, UserModel>('User', userSchema);
