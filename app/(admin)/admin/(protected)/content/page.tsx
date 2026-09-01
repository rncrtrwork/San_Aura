import { FileText, Layers3 } from 'lucide-react';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import { getContentOverview } from '@/server/content/getContentOverview';

export const dynamic = 'force-dynamic';

type ContentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function contentPageHref(slug: string): string {
  return slug === 'home' ? '/admin/content' : `/admin/content?page=${slug}`;
}

export default async function ContentPage({ searchParams }: ContentPageProps) {
  await requirePagePermission('content.read');
  const overview = await getContentOverview(await searchParams);

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
          Website CMS
        </p>
        <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Website Content</h1>
        <p className="mt-2 max-w-2xl text-sm text-admin-muted">
          Manage public website pages, draft content, navigation labels, and section structure.
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="admin-card p-5" aria-labelledby="content-pages-heading">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-admin-muted">
                Pages
              </p>
              <h2 id="content-pages-heading" className="mt-1 font-serif text-2xl text-forest-900">
                Site structure
              </h2>
            </div>
            <span className="rounded-full bg-cream-alt px-3 py-1 text-xs font-bold text-admin-muted">
              {overview.pages.length}
            </span>
          </div>

          <nav aria-label="Website pages" className="mt-5 space-y-2">
            {overview.pages.map((page) => {
              const active = page.slug === overview.activeSlug;
              const lastEdited = page.lastEditedAt
                ? dateFormatter.format(new Date(page.lastEditedAt))
                : 'Not created';

              return (
                <a
                  key={page.slug}
                  href={contentPageHref(page.slug)}
                  aria-current={active ? 'page' : undefined}
                  className={`block rounded-xl border p-4 ${
                    active
                      ? 'border-admin-accent bg-cream-alt text-forest-900'
                      : 'border-admin-border bg-white text-admin-muted hover:border-admin-accent/50 hover:text-forest-900'
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{page.title}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold">
                      {page.publishStatus}
                    </span>
                  </span>
                  <span className="mt-2 block text-xs">Last edited: {lastEdited}</span>
                  <span className="mt-1 block text-xs">
                    {page.sectionCount} sections | Nav: {page.navLabel}
                  </span>
                </a>
              );
            })}
          </nav>
        </aside>

        <section className="admin-card p-6" aria-labelledby="content-selected-heading">
          <span className="grid size-12 place-items-center rounded-full bg-cream-alt text-admin-accent">
            <FileText aria-hidden="true" className="size-5" />
          </span>
          <h2 id="content-selected-heading" className="mt-4 font-serif text-3xl text-forest-900">
            {overview.selectedPage.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-admin-muted">
            This shell anchors the content builder around the client-approved pages. Section
            editing, draft autosave, preview, and publishing controls are added in the following
            tasks.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-admin-border bg-white p-4">
              <p className="text-sm font-semibold text-admin-muted">Selected status</p>
              <p className="mt-2 font-serif text-3xl text-forest-900">
                {overview.selectedPage.publishStatus}
              </p>
            </div>
            <div className="rounded-xl border border-admin-border bg-white p-4">
              <p className="text-sm font-semibold text-admin-muted">Page sections</p>
              <p className="mt-2 font-serif text-3xl text-forest-900">
                {overview.selectedPage.sectionCount}
              </p>
            </div>
            <div className="rounded-xl border border-admin-border bg-white p-4">
              <p className="text-sm font-semibold text-admin-muted">Total CMS sections</p>
              <p className="mt-2 font-serif text-3xl text-forest-900">{overview.totalSections}</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-admin-border bg-cream-alt/70 p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-white text-admin-accent">
                <Layers3 aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-forest-900">Content builder queue</p>
                <p className="text-xs text-admin-muted">
                  {overview.publishedCount} published pages | {overview.draftCount} drafts
                </p>
              </div>
            </div>
            {overview.selectedPage.sectionTypes.length === 0 ? (
              <p className="mt-4 text-sm text-admin-muted">
                No sections have been added to this page yet.
              </p>
            ) : (
              <ul className="mt-4 flex flex-wrap gap-2">
                {overview.selectedPage.sectionTypes.map((sectionType, index) => (
                  <li
                    key={`${sectionType}-${index}`}
                    className="rounded-full bg-white px-3 py-1 text-xs font-bold text-admin-muted"
                  >
                    {sectionType}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
