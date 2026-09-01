import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { Payment } from '@/models/Payment';

export async function getMemberLedgerBalance(memberId: string): Promise<number> {
  if (!Types.ObjectId.isValid(memberId)) {
    return 0;
  }

  await connectToDatabase();
  const balanceResult = await Payment.aggregate<{ balance: number }>([
    { $match: { memberRef: new Types.ObjectId(memberId) } },
    {
      $group: {
        _id: null,
        balance: {
          $sum: {
            $cond: [{ $eq: ['$entryKind', 'charge'] }, '$amount', { $multiply: ['$amount', -1] }],
          },
        },
      },
    },
  ]);

  return balanceResult[0]?.balance ?? 0;
}
