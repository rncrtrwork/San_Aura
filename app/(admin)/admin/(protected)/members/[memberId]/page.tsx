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
import { getMemberDocuments } from '@/server/members/getMemberDocuments';
import { getMemberProfile } from '@/server/members/getMemberProfile';

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
  const { memberId } = await params;
  const member = await getMemberProfile(memberId);
  if (!member) {
    notFound();
  }
  const activeTab = parseTab((await searchParams).tab);
  const documents = activeTab === 'documents' ? await getMemberDocuments(memberId) : [];

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
        ) : undefined}
      </MemberDetailTabs>
    </div>
  );
}
