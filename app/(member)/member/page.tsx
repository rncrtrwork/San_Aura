import { redirect } from 'next/navigation';
import { MemberDashboardCards } from '@/components/member/MemberDashboardCards';
import { MemberDocumentsTab } from '@/components/member/MemberDocumentsTab';
import { MemberElectricBillingTab } from '@/components/member/MemberElectricBillingTab';
import { MemberInfoTab } from '@/components/member/MemberInfoTab';
import { MemberLogoutButton } from '@/components/member/MemberLogoutButton';
import { MemberPaymentHistoryTab } from '@/components/member/MemberPaymentHistoryTab';
import { MemberPortalTabs } from '@/components/member/MemberPortalTabs';
import { MemberUpdateRequestForm } from '@/components/member/MemberUpdateRequestForm';
import { parseMemberPortalTab } from '@/lib/memberPortal';
import { requireMemberPageSession } from '@/server/auth/memberAuthorization';
import { getMemberElectricHistory } from '@/server/electricBilling/getMemberElectricHistory';
import { getMemberDashboard } from '@/server/memberPortal/getMemberDashboard';
import { getMemberDocuments } from '@/server/members/getMemberDocuments';
import { getMemberPayments } from '@/server/members/getMemberPayments';
import { getMemberProfile } from '@/server/members/getMemberProfile';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Member Dashboard | Sun Aura Resort',
  description: 'View Sun Aura Resort membership balance, status, and renewal details.',
};

type MemberPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MemberPage({ searchParams }: MemberPageProps) {
  const session = await requireMemberPageSession();
  const activeTab = parseMemberPortalTab((await searchParams).tab);
  const dashboard = await getMemberDashboard(session.memberId);
  if (!dashboard) {
    redirect('/member/login');
  }
  const paymentHistory =
    activeTab === 'payments' ? await getMemberPayments(session.memberId) : null;
  const electricHistory =
    activeTab === 'electric' ? await getMemberElectricHistory(session.memberId) : null;
  const documents = activeTab === 'documents' ? await getMemberDocuments(session.memberId) : null;
  const profile = activeTab === 'membership' ? await getMemberProfile(session.memberId) : null;

  return (
    <main id="main-content" className="min-h-screen bg-cream px-6 py-8 text-forest-900 md:px-10">
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
        <MemberPortalTabs activeTab={activeTab} />

        <div className="mt-8">
          {activeTab === 'payments' && paymentHistory ? (
            <MemberPaymentHistoryTab paymentHistory={paymentHistory} />
          ) : activeTab === 'electric' && electricHistory ? (
            <MemberElectricBillingTab history={electricHistory} />
          ) : activeTab === 'documents' && documents ? (
            <MemberDocumentsTab documents={documents} />
          ) : activeTab === 'membership' && profile ? (
            <MemberInfoTab profile={profile} />
          ) : activeTab === 'requests' ? (
            <MemberUpdateRequestForm />
          ) : (
            <MemberDashboardCards dashboard={dashboard} />
          )}
        </div>
      </div>
    </main>
  );
}
