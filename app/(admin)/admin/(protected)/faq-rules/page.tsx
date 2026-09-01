import { CircleHelp, FileText, Scale } from 'lucide-react';
import { FaqCategoryTree } from '@/components/admin/FaqCategoryTree';
import { FaqItemCreateForm } from '@/components/admin/FaqItemCreateForm';
import { FaqRevisionHistoryPanel } from '@/components/admin/FaqRevisionHistoryPanel';
import { ManagedContentTabPanel } from '@/components/admin/ManagedContentTabPanel';
import { FAQ_RULE_TABS, type FaqRuleTab } from '@/lib/faqRules';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import { getFaqRulesOverview } from '@/server/faqRules/getFaqRulesOverview';

export const dynamic = 'force-dynamic';

type FaqRulesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const tabLabels: Record<FaqRuleTab, string> = {
  faq: 'FAQ',
  rules: 'Resort Rules',
  policies: 'Policies',
};

const tabDescriptions: Record<FaqRuleTab, string> = {
  faq: 'Guest-facing answers organized by category, status, SEO details, and featured placement.',
  rules: 'Property rules for reservations, arrival, pets, privacy, amenities, and safety.',
  policies:
    'Long-form policy pages for privacy, cancellations, accessibility, and operating terms.',
};

const tabIcons = {
  faq: CircleHelp,
  rules: Scale,
  policies: FileText,
} as const;

function tabHref(tab: FaqRuleTab): string {
  return tab === 'faq' ? '/admin/faq-rules' : `/admin/faq-rules?tab=${tab}`;
}

export default async function FaqRulesPage({ searchParams }: FaqRulesPageProps) {
  await requirePagePermission('content.read');
  const overview = await getFaqRulesOverview(await searchParams);
  const ActiveIcon = tabIcons[overview.activeTab];

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
          Help Content
        </p>
        <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">FAQ & Rules</h1>
        <p className="mt-2 max-w-2xl text-sm text-admin-muted">
          Manage public guest guidance, resort rules, and policy content from one editorial
          workspace.
        </p>
      </header>

      <nav
        aria-label="FAQ and rules sections"
        className="flex overflow-x-auto border-b border-admin-border"
      >
        {FAQ_RULE_TABS.map((tab) => {
          const active = tab === overview.activeTab;
          const Icon = tabIcons[tab];
          return (
            <a
              key={tab}
              href={tabHref(tab)}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-w-max items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
                active
                  ? 'border-admin-accent text-admin-accent'
                  : 'border-transparent text-admin-muted hover:text-forest-900'
              }`}
            >
              <Icon aria-hidden="true" className="size-4" />
              {tabLabels[tab]}
              <span className="rounded-full bg-cream-alt px-2 py-0.5 text-xs text-admin-muted">
                {overview.counts[tab]}
              </span>
            </a>
          );
        })}
      </nav>

      <div className="grid items-start gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <FaqCategoryTree tab={overview.activeTab} categories={overview.categories} />

        <section className="admin-card p-6" aria-labelledby="faq-rules-section-heading">
          <span className="grid size-12 place-items-center rounded-full bg-cream-alt text-admin-accent">
            <ActiveIcon aria-hidden="true" className="size-5" />
          </span>
          <h2 id="faq-rules-section-heading" className="mt-4 font-serif text-3xl text-forest-900">
            {tabLabels[overview.activeTab]}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-admin-muted">
            {tabDescriptions[overview.activeTab]}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {FAQ_RULE_TABS.map((tab) => (
              <div key={tab} className="rounded-xl border border-admin-border bg-white p-4">
                <p className="text-sm font-semibold text-admin-muted">{tabLabels[tab]}</p>
                <p className="mt-2 font-serif text-4xl text-forest-900">{overview.counts[tab]}</p>
                <p className="mt-1 text-xs text-admin-muted">Current items</p>
              </div>
            ))}
          </div>
          {overview.activeTab === 'faq' ? (
            <>
              <FaqItemCreateForm categories={overview.categories} />
              <FaqRevisionHistoryPanel
                items={overview.faqRevisionItems}
                selectedItem={overview.selectedRevisionItem}
              />
            </>
          ) : null}
          {overview.activeTab === 'rules' ? (
            <ManagedContentTabPanel
              tab="rules"
              label="Resort Rules"
              singularLabel="Resort Rule"
              categories={overview.categories}
              items={overview.managedContentItems}
            />
          ) : null}
          {overview.activeTab === 'policies' ? (
            <ManagedContentTabPanel
              tab="policies"
              label="Policies"
              singularLabel="Policy"
              categories={overview.categories}
              items={overview.managedContentItems}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}
