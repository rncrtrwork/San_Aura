import { redirect } from 'next/navigation';
import { MemberLogoutButton } from '@/components/member/MemberLogoutButton';
import {
  MEMBER_STATUS_LABELS,
  MEMBER_TIER_LABELS,
  memberBalanceLabel,
  memberRenewalMonthLabel,
} from '@/lib/memberPortal';
import { requireMemberPageSession } from '@/server/auth/memberAuthorization';
import { getMemberDashboard } from '@/server/memberPortal/getMemberDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Member Dashboard | Sun Aura Resort',
  description: 'View Sun Aura Resort membership balance, status, and renewal details.',
};

export default async function MemberPage() {
  const session = await requireMemberPageSession();
  const dashboard = await getMemberDashboard(session.memberId);
  if (!dashboard) {
    redirect('/member/login');
  }

  return (
    <main className="min-h-screen bg-cream px-6 py-8 text-forest-900 md:px-10">
      <div className="mx-auto max-w-[1180px]">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-700">
              Member portal
            </p>
            <h1 className="mt-2 font-serif text-5xl">Welcome, {dashboard.profile.name}</h1>
            <p className="mt-3 text-sm text-ink-700">{dashboard.profile.email}</p>
          </div>
          <MemberLogoutButton />
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Balance</p>
            <p className="mt-3 font-serif text-4xl">{memberBalanceLabel(dashboard.balance)}</p>
          </article>
          <article className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">
              Membership
            </p>
            <p className="mt-3 font-serif text-3xl">
              {MEMBER_TIER_LABELS[dashboard.profile.membershipTier]}
            </p>
          </article>
          <article className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Status</p>
            <p className="mt-3 font-serif text-3xl">
              {MEMBER_STATUS_LABELS[dashboard.profile.status]}
            </p>
          </article>
          <article className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Renewal</p>
            <p className="mt-3 font-serif text-3xl">
              {memberRenewalMonthLabel(dashboard.profile.renewalMonth)}
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
