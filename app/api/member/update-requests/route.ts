import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import {
  validateMemberUpdateRequest,
  type MemberUpdateRequestCreateInput,
  type MemberUpdateRequestCreateResponse,
} from '@/lib/memberUpdateRequests';
import { Member } from '@/models/Member';
import { MemberUpdateRequest } from '@/models/MemberUpdateRequest';
import { MEMBER_SESSION_COOKIE, readMemberSession } from '@/server/auth/session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value;
  const session = token ? await readMemberSession(token) : null;

  if (!session) {
    return NextResponse.json<MemberUpdateRequestCreateResponse>(
      { message: 'Authentication required' },
      { status: 401 },
    );
  }

  let body: MemberUpdateRequestCreateInput | null;
  try {
    body = (await request.json()) as MemberUpdateRequestCreateInput;
  } catch {
    return NextResponse.json<MemberUpdateRequestCreateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateMemberUpdateRequest(body);
  if (typeof validation === 'string') {
    return NextResponse.json<MemberUpdateRequestCreateResponse>(
      { message: validation },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const memberExists = await Member.exists({ _id: session.memberId, status: { $ne: 'inactive' } });
  if (!memberExists) {
    return NextResponse.json<MemberUpdateRequestCreateResponse>(
      { message: 'Member not found.' },
      { status: 404 },
    );
  }

  const updateRequest = await MemberUpdateRequest.create({
    memberRef: session.memberId,
    topic: validation.topic,
    message: validation.message,
    status: 'open',
  });

  return NextResponse.json<MemberUpdateRequestCreateResponse>(
    {
      id: updateRequest._id.toString(),
      message: 'Your request was sent to Sun Aura Resort staff.',
    },
    { status: 201 },
  );
}
