import type { PaymentMethod, PaymentType } from '@/lib/paymentOptions';

export type MemberPaymentCreateRequest = {
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  date: string;
  periodStart: string;
  periodEnd: string;
  externalReference: string;
  notes: string;
};

export type MemberPaymentCreateResponse = {
  id?: string;
  message?: string;
};
