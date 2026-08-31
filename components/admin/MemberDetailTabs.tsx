import { BadgeDollarSign, Bolt, FileText, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const MEMBER_DETAIL_TABS = ['documents', 'payments', 'electric', 'notes'] as const;
export type MemberDetailTab = (typeof MEMBER_DETAIL_TABS)[number];

type MemberDetailTabsProps = {
  memberId: string;
  activeTab: MemberDetailTab;
  children?: ReactNode;
};

const tabs = [
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'payments', label: 'Payments', icon: BadgeDollarSign },
  { id: 'electric', label: 'Electric', icon: Bolt },
  { id: 'notes', label: 'Notes', icon: LockKeyhole },
] satisfies Array<{ id: MemberDetailTab; label: string; icon: typeof FileText }>;

export function MemberDetailTabs({ memberId, activeTab, children }: MemberDetailTabsProps) {
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? 'Documents';

  return (
    <section className="admin-card overflow-hidden">
      <nav
        aria-label="Member details"
        className="flex overflow-x-auto border-b border-admin-border"
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = id === activeTab;
          return (
            <Link
              key={id}
              href={`/admin/members/${memberId}?tab=${id}`}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-w-max items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition-colors ${
                active
                  ? 'border-admin-accent text-admin-accent'
                  : 'border-transparent text-admin-muted hover:text-forest-900'
              }`}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      {children ?? (
        <div className="grid min-h-56 place-items-center px-6 py-12 text-center">
          <div>
            <p className="font-serif text-2xl text-forest-900">{activeLabel}</p>
            <p className="mt-2 text-sm text-admin-muted">
              Member {activeLabel.toLowerCase()} will appear in this workspace.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
