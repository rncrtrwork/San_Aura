import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  MEMBER_SESSION_COOKIE,
  readMemberSession,
  type MemberSession,
} from '@/server/auth/session';

export async function requireMemberPageSession(): Promise<MemberSession> {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value;
  const session = token ? await readMemberSession(token) : null;
  if (!session) {
    redirect('/member/login');
  }

  return session;
}
