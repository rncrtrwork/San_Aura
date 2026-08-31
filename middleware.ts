import { NextResponse, type NextRequest } from 'next/server';
import { readStaffSession, STAFF_SESSION_COOKIE } from '@/server/auth/session';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const loginPath = '/admin/login';
  const isLoginPath = request.nextUrl.pathname === loginPath;
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

export const config = {
  matcher: ['/admin/:path*'],
};
