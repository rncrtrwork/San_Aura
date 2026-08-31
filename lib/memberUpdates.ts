import type { MemberStatus } from '@/lib/memberOptions';

export type MemberStatusUpdateRequest = {
  status: MemberStatus;
  renewalMonth: number;
};

export type MemberStatusUpdateResponse = {
  message?: string;
};
