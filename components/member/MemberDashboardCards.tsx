import {
  MEMBER_STATUS_LABELS,
  MEMBER_TIER_LABELS,
  memberBalanceLabel,
  memberRenewalMonthLabel,
  type MemberPortalDashboard,
} from '@/lib/memberPortal';

type MemberDashboardCardsProps = {
  dashboard: MemberPortalDashboard;
};

export function MemberDashboardCards({ dashboard }: MemberDashboardCardsProps) {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Balance</p>
        <p className="mt-3 font-serif text-4xl">{memberBalanceLabel(dashboard.balance)}</p>
      </article>
      <article className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Membership</p>
        <p className="mt-3 font-serif text-3xl">
          {MEMBER_TIER_LABELS[dashboard.profile.membershipTier]}
        </p>
      </article>
      <article className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Status</p>
        <p className="mt-3 font-serif text-3xl">{MEMBER_STATUS_LABELS[dashboard.profile.status]}</p>
      </article>
      <article className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Renewal</p>
        <p className="mt-3 font-serif text-3xl">
          {memberRenewalMonthLabel(dashboard.profile.renewalMonth)}
        </p>
      </article>
    </section>
  );
}
