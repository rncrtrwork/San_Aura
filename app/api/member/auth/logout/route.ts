import { NextResponse } from 'next/server';
import { clearMemberSessionCookie } from '@/server/auth/session';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearMemberSessionCookie(response);
  return response;
}
