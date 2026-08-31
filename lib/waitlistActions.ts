import type { WaitlistStatus } from '@/lib/waitlistOptions';

export type WaitlistUpdateRequest = {
  status: WaitlistStatus;
  notes: string;
};

export type WaitlistUpdateResponse = {
  message?: string;
  status?: WaitlistStatus;
};
