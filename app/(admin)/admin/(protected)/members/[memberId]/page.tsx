import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MEMBER_DETAIL_TABS,
  MemberDetailTabs,
  type MemberDetailTab,
} from '@/components/admin/MemberDetailTabs';
import { MemberProfileSummary } from '@/components/admin/MemberProfileSummary';
import { MemberDocumentsPanel } from '@/components/admin/MemberDocumentsPanel';
import { MemberElectricPanel } from '@/components/admin/MemberElectricPanel';
import { MemberNotesPanel } from '@/components/admin/MemberNotesPanel';
import { MemberPaymentsPanel } from '@/components/admin/MemberPaymentsPanel';
import { getElectricReadingOptions } from '@/server/electricBilling/getElectricReadingOptions';
import { getMemberElectricHistory } from '@/server/electricBilling/getMemberElectricHistory';
import { getMemberDocuments } from '@/server/members/getMemberDocuments';
import { getMemberProfile } from '@/server/members/getMemberProfile';
import { getMemberPayments } from '@/server/members/getMemberPayments';
import { getMemberStaffNotes } from '@/server/members/getMemberStaffNotes';
import { requirePagePermission } from '@/server/auth/pageAuthorization';

export const dynamic = 'force-dynamic';

type MemberDetailPageProps = {
  params: Promise<{ memberId: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

function parseTab(value: string | string[] | undefined): MemberDetailTab {
  const selected = typeof value === 'string' ? value : '';
  return MEMBER_DETAIL_TABS.find((tab) => tab === selected) ?? 'documents';
}

export default async function MemberDetailPage({ params, searchParams }: MemberDetailPageProps) {
  await requirePagePermission('members.read');
  const { memberId } = await params;
  const member = await getMemberProfile(memberId);
  if (!member) {
    notFound();
  }
  const activeTab = parseTab((await searchParams).tab);
  const documents = activeTab === 'documents' ? await getMemberDocuments(memberId) : [];
  const paymentHistory =
    activeTab === 'payments' ? await getMemberPayments(memberId) : { payments: [], balance: 0 };
  const electricHistory =
    activeTab === 'electric'
      ? await getMemberElectricHistory(memberId)
      : { readings: [], charges: [] };
  const electricOptions =
    activeTab === 'electric'
      ? await getElectricReadingOptions(memberId)
      : { sites: [], defaultSiteId: '' };
  const staffNotes = activeTab === 'notes' ? await getMemberStaffNotes(memberId) : '';

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 text-sm font-semibold text-admin-muted hover:text-admin-accent"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to members
        </Link>
      </header>
      <MemberProfileSummary member={member} />
      <MemberDetailTabs memberId={member.id} activeTab={activeTab}>
        {activeTab === 'documents' ? (
          <MemberDocumentsPanel memberId={member.id} initialDocuments={documents} />
        ) : activeTab === 'payments' ? (
          <MemberPaymentsPanel
            memberId={member.id}
            payments={paymentHistory.payments}
            balance={paymentHistory.balance}
          />
        ) : activeTab === 'electric' ? (
          <MemberElectricPanel
            memberId={member.id}
            history={electricHistory}
            siteOptions={electricOptions.sites}
            defaultSiteId={electricOptions.defaultSiteId}
          />
        ) : activeTab === 'notes' ? (
          <MemberNotesPanel memberId={member.id} initialNotes={staffNotes} />
        ) : undefined}
      </MemberDetailTabs>
    </div>
  );
}
