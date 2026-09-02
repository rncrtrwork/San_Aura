import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';
import {
  createMemberSession,
  createStaffSession,
  MEMBER_SESSION_COOKIE,
  STAFF_SESSION_COOKIE,
} from '@/server/auth/session';

process.env.SESSION_SECRET = 'sun-aura-test-session-secret-at-least-32';

function requestFor(path: string): NextRequest {
  return new NextRequest(`http://localhost${path}`);
}

function redirectPath(response: Response): string {
  const location = response.headers.get('location');
  assert.ok(location);
  return new URL(location).pathname;
}

test('staff routes redirect unauthenticated requests to staff login', async () => {
  const response = await proxy(requestFor('/admin/members'));

  assert.equal(response.status, 307);
  assert.equal(redirectPath(response), '/admin/login');
});

test('member routes redirect unauthenticated requests to member login', async () => {
  const response = await proxy(requestFor('/member?tab=payments'));

  assert.equal(response.status, 307);
  assert.equal(redirectPath(response), '/member/login');
});

test('staff sessions do not satisfy member route protection', async () => {
  const request = requestFor('/member');
  request.cookies.set(
    STAFF_SESSION_COOKIE,
    await createStaffSession({
      userId: 'staff-1',
      roleId: 'role-1',
      email: 'staff@example.com',
    }),
  );

  const response = await proxy(request);

  assert.equal(response.status, 307);
  assert.equal(redirectPath(response), '/member/login');
});

test('member sessions do not satisfy staff route protection', async () => {
  const request = requestFor('/admin');
  request.cookies.set(
    MEMBER_SESSION_COOKIE,
    await createMemberSession({
      memberId: 'member-1',
      email: 'member@example.com',
    }),
  );

  const response = await proxy(request);

  assert.equal(response.status, 307);
  assert.equal(redirectPath(response), '/admin/login');
});

test('authenticated users are redirected away from their matching login pages', async () => {
  const staffRequest = requestFor('/admin/login');
  staffRequest.cookies.set(
    STAFF_SESSION_COOKIE,
    await createStaffSession({
      userId: 'staff-1',
      roleId: 'role-1',
      email: 'staff@example.com',
    }),
  );
  const memberRequest = requestFor('/member/login');
  memberRequest.cookies.set(
    MEMBER_SESSION_COOKIE,
    await createMemberSession({
      memberId: 'member-1',
      email: 'member@example.com',
    }),
  );

  const staffResponse = await proxy(staffRequest);
  const memberResponse = await proxy(memberRequest);

  assert.equal(redirectPath(staffResponse), '/admin');
  assert.equal(redirectPath(memberResponse), '/member');
});
