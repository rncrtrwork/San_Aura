import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import type { NextResponse } from 'next/server';

export const STAFF_SESSION_COOKIE = 'sun_aura_staff_session';
export const STAFF_SESSION_MAX_AGE = 60 * 60 * 8;
export const MEMBER_SESSION_COOKIE = 'sun_aura_member_session';
export const MEMBER_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

type StaffSessionInput = {
  userId: string;
  roleId: string;
  email: string;
};

export type StaffSession = JWTPayload & StaffSessionInput;

type MemberSessionInput = {
  memberId: string;
  email: string;
};

export type MemberSession = JWTPayload & MemberSessionInput;

function getSessionKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must contain at least 32 characters');
  }

  return new TextEncoder().encode(secret);
}

export async function createStaffSession(input: StaffSessionInput): Promise<string> {
  return new SignJWT({
    userId: input.userId,
    roleId: input.roleId,
    email: input.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(input.userId)
    .setIssuer('sun-aura-resort')
    .setAudience('sun-aura-admin')
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSessionKey());
}

export async function readStaffSession(token: string): Promise<StaffSession | null> {
  try {
    const { payload } = await jwtVerify<StaffSession>(token, getSessionKey(), {
      issuer: 'sun-aura-resort',
      audience: 'sun-aura-admin',
    });

    if (
      typeof payload.userId !== 'string' ||
      typeof payload.roleId !== 'string' ||
      typeof payload.email !== 'string'
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function createMemberSession(input: MemberSessionInput): Promise<string> {
  return new SignJWT({
    memberId: input.memberId,
    email: input.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(input.memberId)
    .setIssuer('sun-aura-resort')
    .setAudience('sun-aura-member')
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSessionKey());
}

export async function readMemberSession(token: string): Promise<MemberSession | null> {
  try {
    const { payload } = await jwtVerify<MemberSession>(token, getSessionKey(), {
      issuer: 'sun-aura-resort',
      audience: 'sun-aura-member',
    });

    if (typeof payload.memberId !== 'string' || typeof payload.email !== 'string') {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function setStaffSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: STAFF_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: STAFF_SESSION_MAX_AGE,
  });
}

export function clearStaffSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: STAFF_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

export function setMemberSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: MEMBER_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: MEMBER_SESSION_MAX_AGE,
  });
}

export function clearMemberSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: MEMBER_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}
