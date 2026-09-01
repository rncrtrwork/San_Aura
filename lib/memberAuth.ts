export type MemberLoginRequestResponse = {
  message?: string;
  magicLink?: string;
};

export function normalizeMemberEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidMemberEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value) && value.length <= 254;
}
