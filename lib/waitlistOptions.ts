export const WAITLIST_STATUSES = [
  'pending',
  'contacted',
  'offered',
  'converted',
  'cancelled',
] as const;

export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number];
