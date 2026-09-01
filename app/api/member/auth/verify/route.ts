import { NextResponse, type NextRequest } from 'next/server';
import { readMemberSession, setMemberSessionCookie } from '@/server/auth/session';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? '';
  const session = token ? await readMemberSession(token) : null;
  if (!session) {
    return NextResponse.redirect(new URL('/member/login', request.url));
  }

  const response = NextResponse.redirect(new URL('/member', request.url));
  setMemberSessionCookie(response, token);
  return response;
}
