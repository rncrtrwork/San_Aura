import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import {
  Payment,
  type LedgerEntryKind,
  type PaymentMethod,
  type PaymentType,
} from '@/models/Payment';

export type MemberPaymentItem = {
  id: string;
  amount: number;
  entryKind: LedgerEntryKind;
  type: PaymentType;
  method: PaymentMethod;
  externalReference: string;
  date: string;
  periodStart: string | null;
  periodEnd: string | null;
  notes: string;
};

export async function getMemberPayments(memberId: string): Promise<MemberPaymentItem[]> {
  if (!Types.ObjectId.isValid(memberId)) {
    return [];
  }

  await connectToDatabase();
  const payments = await Payment.find({ memberRef: memberId })
    .select('amount entryKind type method externalReference date appliesToPeriod notes')
    .sort({ date: -1, createdAt: -1 })
    .limit(100)
    .lean();

  return payments.map((payment) => ({
    id: payment._id.toString(),
    amount: payment.amount,
    entryKind: payment.entryKind,
    type: payment.type,
    method: payment.method,
    externalReference: payment.externalReference,
    date: payment.date.toISOString(),
    periodStart: payment.appliesToPeriod?.start.toISOString() ?? null,
    periodEnd: payment.appliesToPeriod?.end.toISOString() ?? null,
    notes: payment.notes,
  }));
}
