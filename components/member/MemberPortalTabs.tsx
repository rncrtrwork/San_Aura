import Link from 'next/link';
import { MEMBER_PORTAL_TAB_DEFINITIONS, type MemberPortalTab } from '@/lib/memberPortal';

type MemberPortalTabsProps = {
  activeTab: MemberPortalTab;
};

export function MemberPortalTabs({ activeTab }: MemberPortalTabsProps) {
  return (
    <nav className="mt-8 flex gap-2 overflow-x-auto" aria-label="Member portal sections">
      {MEMBER_PORTAL_TAB_DEFINITIONS.map((tab) => {
        const active = tab.value === activeTab;

        return (
          <Link
            key={tab.value}
            href={tab.value === 'dashboard' ? '/member' : `/member?tab=${tab.value}`}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
              active
                ? 'border-forest-900 bg-forest-900 text-white'
                : 'border-line bg-white text-forest-900 hover:border-gold-600'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
