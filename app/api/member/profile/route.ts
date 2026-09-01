import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Member } from '@/models/Member';
import { MEMBER_SESSION_COOKIE, readMemberSession } from '@/server/auth/session';
import {
  serializeMemberForPortal,
  type MemberPortalProfileResponse,
} from '@/server/members/serializeMemberForPortal';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value;
  const session = token ? await readMemberSession(token) : null;

  if (!session) {
    return NextResponse.json<MemberPortalProfileResponse>(
      { message: 'Authentication required' },
      { status: 401 },
    );
  }

  await connectToDatabase();
  const member = await Member.findById(session.memberId)
    .select('name email phone address membershipTier status renewalMonth joinDate')
    .lean();

  if (!member || member.status === 'inactive') {
    return NextResponse.json<MemberPortalProfileResponse>(
      { message: 'Member not found.' },
      { status: 404 },
    );
  }

  return NextResponse.json<MemberPortalProfileResponse>({
    profile: serializeMemberForPortal(member),
  });
}
