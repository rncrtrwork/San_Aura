import { NextResponse, type NextRequest } from 'next/server';
import type { MemberLoginRequestResponse } from '@/lib/memberAuth';
import { isValidMemberEmail, normalizeMemberEmail } from '@/lib/memberAuth';
import { connectToDatabase } from '@/lib/db';
import { Member } from '@/models/Member';
import { createMemberSession } from '@/server/auth/session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const emailValue = formData.get('email');
  if (typeof emailValue !== 'string') {
    return NextResponse.json<MemberLoginRequestResponse>(
      { message: 'Email is required.' },
      { status: 400 },
    );
  }

  const email = normalizeMemberEmail(emailValue);
  if (!isValidMemberEmail(email)) {
    return NextResponse.json<MemberLoginRequestResponse>(
      { message: 'Enter a valid member email.' },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const member = await Member.findOne({ email, status: 'active' }).select('_id email name').lean();
  if (!member) {
    return NextResponse.json<MemberLoginRequestResponse>({
      message: 'If that email belongs to an active member, access is ready.',
    });
  }

  const token = await createMemberSession({
    memberId: member._id.toString(),
    email: member.email,
  });
  const verifyUrl = new URL('/api/member/auth/verify', request.url);
  verifyUrl.searchParams.set('token', token);

  return NextResponse.json<MemberLoginRequestResponse>({
    message: 'Use the secure member link to continue.',
    magicLink: verifyUrl.toString(),
  });
}
