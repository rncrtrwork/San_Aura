import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { createStaffSession, setStaffSessionCookie } from '@/server/auth/session';

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const emailValue = formData.get('email');
  const passwordValue = formData.get('password');

  if (typeof emailValue !== 'string' || typeof passwordValue !== 'string') {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  const email = emailValue.trim().toLowerCase();
  await connectToDatabase();
  const user = await User.findOne({ email, active: true }).select('+passwordHash');

  if (!user || !(await user.verifyPassword(passwordValue))) {
    return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = await createStaffSession({
    userId: user.id,
    roleId: user.roleId.toString(),
    email: user.email,
  });
  const response = NextResponse.json({ success: true });
  setStaffSessionCookie(response, token);

  return response;
}
