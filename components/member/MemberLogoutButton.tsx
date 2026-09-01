'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function MemberLogoutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogout() {
    setSubmitting(true);
    await fetch('/api/member/auth/logout', { method: 'POST' });
    router.replace('/member/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={submitting}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-forest-900 hover:border-gold-600 disabled:opacity-60"
    >
      <LogOut aria-hidden="true" className="size-4" />
      {submitting ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
