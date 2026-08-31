import { NextResponse } from 'next/server';
import { clearStaffSessionCookie } from '@/server/auth/session';

export function POST(): NextResponse {
  const response = NextResponse.json({ success: true });
  clearStaffSessionCookie(response);
  return response;
}
