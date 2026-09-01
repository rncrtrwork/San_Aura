import { Clock3 } from 'lucide-react';
import type { FaqRevisionItem } from '@/lib/faqRules';

type FaqRevisionHistoryPanelProps = {
  items: FaqRevisionItem[];
  selectedItem: FaqRevisionItem | null;
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

function revisionHref(itemId: string): string {
  return `/admin/faq-rules?revisions=${itemId}`;
}

export function FaqRevisionHistoryPanel({ items, selectedItem }: FaqRevisionHistoryPanelProps) {
  return (
    <section className="mt-6 rounded-xl border border-admin-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
            Revision History
          </p>
          <h3 className="mt-1 font-serif text-2xl text-forest-900">FAQ version timeline</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-admin-muted">
            Review lightweight FAQ snapshots captured when editors create or update an answer.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-cream-alt px-3 py-1 text-xs font-bold text-admin-muted">
          <Clock3 aria-hidden="true" className="size-4" />
          {items.length} tracked
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-admin-border bg-cream-alt p-4 text-sm text-admin-muted">
          No FAQ revisions are available yet. Create an FAQ item to seed its first revision.
        </p>
      ) : (
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(15rem,0.85fr)_1fr]">
          <div className="space-y-2" aria-label="FAQ items with revisions">
            {items.map((item) => {
              const selected = item.id === selectedItem?.id;

              return (
                <a
                  key={item.id}
                  href={revisionHref(item.id)}
                  aria-current={selected ? 'page' : undefined}
                  className={`block rounded-lg border p-3 text-sm ${
                    selected
                      ? 'border-admin-accent bg-cream-alt text-forest-900'
                      : 'border-admin-border text-admin-muted hover:border-admin-accent/50 hover:text-forest-900'
                  }`}
                >
                  <span className="font-semibold">{item.question}</span>
                  <span className="mt-1 block text-xs">
                    {item.category} | {item.status} | {item.revisionCount} revisions
                  </span>
                </a>
              );
            })}
          </div>

          <div className="rounded-lg border border-admin-border bg-cream-alt/70 p-4">
            {selectedItem ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
                      Selected FAQ
                    </p>
                    <h4 className="mt-1 font-serif text-2xl text-forest-900">
                      {selectedItem.question}
                    </h4>
                    <p className="mt-1 text-xs text-admin-muted">/{selectedItem.slug}</p>
                  </div>
                  <a
                    href={revisionHref(selectedItem.id)}
                    className="rounded-full border border-admin-border bg-white px-3 py-1 text-xs font-bold text-admin-accent hover:border-admin-accent"
                  >
                    View all revisions
                  </a>
                </div>

                {selectedItem.revisions.length === 0 ? (
                  <p className="mt-4 rounded-lg bg-white p-4 text-sm text-admin-muted">
                    This FAQ item does not have saved revisions yet.
                  </p>
                ) : (
                  <ol className="mt-4 space-y-3">
                    {selectedItem.revisions.map((revision) => (
                      <li
                        key={`${revision.title}-${revision.editedAt}`}
                        className="rounded-lg bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-forest-900">{revision.title}</p>
                          <time
                            dateTime={revision.editedAt}
                            className="text-xs font-semibold text-admin-muted"
                          >
                            {dateFormatter.format(new Date(revision.editedAt))}
                          </time>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-admin-muted">
                          {revision.bodyPreview || 'No revision body preview available.'}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            ) : (
              <p className="rounded-lg bg-white p-4 text-sm text-admin-muted">
                Select a FAQ item to view revision history.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
