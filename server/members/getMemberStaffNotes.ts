import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { Member } from '@/models/Member';

export async function getMemberStaffNotes(memberId: string): Promise<string> {
  if (!Types.ObjectId.isValid(memberId)) {
    return '';
  }

  await connectToDatabase();
  const member = await Member.findById(memberId).select('+staffNotes').lean();
  return member?.staffNotes ?? '';
}
