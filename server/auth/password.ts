import { compare, hash } from 'bcryptjs';

const PASSWORD_HASH_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12) {
    throw new Error('Password must contain at least 12 characters');
  }

  return hash(password, PASSWORD_HASH_ROUNDS);
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}
