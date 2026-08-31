import type { MembershipTier, MemberStatus } from '@/models/Member';

export type MemberCreateRequest = {
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipTier: MembershipTier;
  status: MemberStatus;
  renewalMonth: number;
  vehicle: {
    make: string;
    model: string;
    year: number | null;
    plate: string;
    state: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
};

export type MemberCreateResponse = {
  id?: string;
  message?: string;
};
