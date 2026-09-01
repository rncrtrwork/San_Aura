import { NextResponse, type NextRequest } from 'next/server';
import {
  MEMBER_SESSION_COOKIE,
  readMemberSession,
  readStaffSession,
  STAFF_SESSION_COOKIE,
} from '@/server/auth/session';

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const loginPath = '/admin/login';
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPath = request.nextUrl.pathname === loginPath;

  if (isAdminPath) {
    const token = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
    const session = token ? await readStaffSession(token) : null;

    if (!session && !isLoginPath) {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    if (session && isLoginPath) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
  }

  const memberLoginPath = '/member/login';
  const isMemberLoginPath = request.nextUrl.pathname === memberLoginPath;
  const memberToken = request.cookies.get(MEMBER_SESSION_COOKIE)?.value;
  const memberSession = memberToken ? await readMemberSession(memberToken) : null;

  if (!memberSession && !isMemberLoginPath) {
    return NextResponse.redirect(new URL(memberLoginPath, request.url));
  }

  if (memberSession && isMemberLoginPath) {
    return NextResponse.redirect(new URL('/member', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/member/:path*'],
};
