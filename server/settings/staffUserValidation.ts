import { Types } from 'mongoose';
import type { StaffUserCreateRequest, StaffUserUpdateRequest } from '@/lib/settingsManager';

export type StaffUserCreateValidationResult =
  | { valid: true; data: StaffUserCreateRequest }
  | { valid: false; message: string };

export type StaffUserUpdateValidationResult =
  | { valid: true; data: StaffUserUpdateRequest }
  | { valid: false; message: string };

type StaffUserCreateInput = Partial<StaffUserCreateRequest>;
type StaffUserUpdateInput = Partial<StaffUserUpdateRequest>;

function textValue(value: string | undefined, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function validateStaffUserCreate(
  input: StaffUserCreateInput | null,
): StaffUserCreateValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Staff invite details are required.' };
  }

  const name = textValue(input.name, 120);
  const email = textValue(input.email, 254).toLowerCase();
  const roleId = textValue(input.roleId, 80);
  const temporaryPassword = textValue(input.temporaryPassword, 200);

  if (!name || !email || !roleId || !temporaryPassword) {
    return { valid: false, message: 'Name, email, role, and temporary password are required.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, message: 'Enter a valid staff email.' };
  }
  if (!Types.ObjectId.isValid(roleId)) {
    return { valid: false, message: 'Select a valid staff role.' };
  }
  if (temporaryPassword.length < 10) {
    return { valid: false, message: 'Temporary password must be at least 10 characters.' };
  }

  return { valid: true, data: { name, email, roleId, temporaryPassword } };
}

export function validateStaffUserUpdate(
  input: StaffUserUpdateInput | null,
): StaffUserUpdateValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, message: 'Staff user updates are required.' };
  }

  const roleId = textValue(input.roleId, 80);
  if (!Types.ObjectId.isValid(roleId) || typeof input.active !== 'boolean') {
    return { valid: false, message: 'Select a valid role and account status.' };
  }

  return { valid: true, data: { roleId, active: input.active } };
}
