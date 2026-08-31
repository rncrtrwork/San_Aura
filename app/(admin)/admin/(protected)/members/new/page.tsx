import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { MemberCreateForm } from '@/components/admin/MemberCreateForm';

export default function NewMemberPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/members"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-admin-muted hover:text-admin-accent"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to members
        </Link>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
          Membership
        </p>
        <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Add Member</h1>
      </header>
      <MemberCreateForm />
    </div>
  );
}
