import Link from 'next/link';
import type { PublicManagedContentPage as PublicManagedContentPageData } from '@/lib/publicManagedContent';

type PublicManagedContentPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  emptyTitle: string;
  page: PublicManagedContentPageData;
};

function ManagedContentBody({ html }: { html: string }) {
  return (
    <div
      className="mt-3 space-y-4 text-sm leading-7 text-ink-700 [&_a]:font-semibold [&_a]:text-gold-700 [&_li]:ml-5 [&_li]:list-disc"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function PublicManagedContentPage({
  eyebrow,
  title,
  intro,
  emptyTitle,
  page,
}: PublicManagedContentPageProps) {
  const hasItems = page.categories.some((category) => category.items.length > 0);

  return (
    <>
      <section className="bg-forest-900 px-6 py-20 text-white md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-600">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream">{intro}</p>
        </div>
      </section>
      <section className="bg-cream px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-[1180px] gap-10">
          {hasItems ? (
            page.categories.map((category) => (
              <section key={category.category} aria-labelledby={`${category.category}-heading`}>
                <h2
                  id={`${category.category}-heading`}
                  className="font-serif text-4xl text-forest-900"
                >
                  {category.category}
                </h2>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {category.items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-[2rem] border border-line bg-[#fbfaf6] p-7 shadow-card"
                    >
                      <h3 className="font-serif text-3xl text-forest-900">{item.title}</h3>
                      <ManagedContentBody html={item.body} />
                      {item.relatedLinks.length > 0 ? (
                        <div className="mt-5 flex flex-wrap gap-3">
                          {item.relatedLinks.map((link) => (
                            <Link
                              key={`${item.id}-${link.url}`}
                              href={link.url}
                              className="rounded-full border border-line px-4 py-2 text-xs font-bold text-forest-900 hover:border-gold-600"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-[2rem] border border-line bg-[#fbfaf6] p-10 text-center">
              <h2 className="font-serif text-3xl text-forest-900">{emptyTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-ink-700">
                Resort staff can publish this content from the admin FAQ & Rules tools.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
