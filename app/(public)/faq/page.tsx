import Link from 'next/link';
import { getPublicFaqPage } from '@/server/public/getPublicFaqPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'FAQ | Sun Aura Resort',
  description: 'Find answers to common Sun Aura Resort guest questions.',
};

function FaqAnswer({ html }: { html: string }) {
  return (
    <div
      className="mt-3 space-y-4 text-sm leading-7 text-ink-700 [&_a]:font-semibold [&_a]:text-gold-700 [&_li]:ml-5 [&_li]:list-disc"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default async function FaqPage() {
  const faqPage = await getPublicFaqPage();
  const hasItems = faqPage.categories.some((category) => category.items.length > 0);

  return (
    <>
      <section className="bg-forest-900 px-6 py-20 text-white md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-600">
            Guest questions
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight sm:text-6xl">
            Clear answers before guests arrive.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream">
            Featured FAQs appear first, followed by category groups managed from the admin FAQ &
            Rules section.
          </p>
        </div>
      </section>
      <section className="bg-cream px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-[1180px] gap-10">
          {faqPage.featuredItems.length > 0 ? (
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-700">
                Featured
              </p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {faqPage.featuredItems.map((item) => (
                  <article key={item.id} className="rounded-[2rem] bg-forest-900 p-7 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-600">
                      {item.category}
                    </p>
                    <h2 className="mt-3 font-serif text-3xl">{item.question}</h2>
                    <FaqAnswer html={item.answer} />
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {hasItems ? (
            faqPage.categories.map((category) => (
              <section key={category.category} aria-labelledby={`${category.category}-heading`}>
                <h2
                  id={`${category.category}-heading`}
                  className="font-serif text-4xl text-forest-900"
                >
                  {category.category}
                </h2>
                <div className="mt-5 grid gap-4">
                  {category.items.map((item) => (
                    <details
                      key={item.id}
                      className="group rounded-[1.5rem] border border-line bg-[#fbfaf6] p-6 shadow-card"
                    >
                      <summary className="cursor-pointer list-none font-serif text-2xl text-forest-900">
                        {item.question}
                      </summary>
                      <FaqAnswer html={item.answer} />
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
                    </details>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-[2rem] border border-line bg-[#fbfaf6] p-10 text-center">
              <h2 className="font-serif text-3xl text-forest-900">FAQ content is coming soon</h2>
              <p className="mt-3 text-sm leading-6 text-ink-700">
                Resort staff can publish FAQ items from the admin content tools when ready.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
