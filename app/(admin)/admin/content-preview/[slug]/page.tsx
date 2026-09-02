import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { parseContentPageSlug } from '@/lib/contentManager';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import { getContentPreviewPage } from '@/server/content/getContentPreviewPage';

export const dynamic = 'force-dynamic';

type ContentPreviewRouteProps = {
  params: Promise<{ slug: string }>;
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

function editPageHref(slug: string): string {
  return slug === 'home' ? '/admin/content' : `/admin/content?page=${slug}`;
}

function timelineBackgroundClass(value: string): string {
  if (value === 'forest') return 'bg-forest-900 text-white';
  if (value === 'cream') return 'bg-cream-alt text-forest-900';
  return 'bg-cream text-forest-900';
}

export default async function ContentPreviewRoute({ params }: ContentPreviewRouteProps) {
  await requirePagePermission('content.read');
  const { slug: rawSlug } = await params;
  const slug = parseContentPageSlug(rawSlug);
  const page = await getContentPreviewPage(slug);
  if (!page) notFound();

  return (
    <main id="main-content" className="min-h-screen bg-cream text-ink-700">
      <div className="sticky top-0 z-40 border-b border-line bg-white/95 px-5 py-3 shadow-card backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <Link
            href={editPageHref(page.slug)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-4 py-2 text-sm font-bold text-forest-900 transition-colors hover:border-gold-600 hover:text-gold-700"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to editor
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-700">
              Draft preview
            </p>
            <p className="truncate font-serif text-xl text-forest-900">{page.title}</p>
          </div>
          <span className="rounded-full bg-cream-alt px-3 py-1 text-xs font-bold text-forest-900">
            {page.publishStatus === 'draft' ? 'Draft changes' : 'Published'}
          </span>
        </div>
      </div>

      <article>
        {page.sections.length === 0 ? (
          <section className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-5 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-700">
              Empty draft
            </p>
            <h1 className="mt-3 font-serif text-5xl text-forest-900">{page.title}</h1>
            <p className="mt-4 max-w-2xl leading-7 text-ink-700">
              This page does not have active sections yet. Add a hero, rich text, timeline, or CTA
              section in the content manager to preview the draft page.
            </p>
          </section>
        ) : null}

        {page.sections.map((section) => {
          if (section.type === 'hero') {
            const focalPoint = section.hero.image
              ? `${section.hero.image.focalPoint.x}% ${section.hero.image.focalPoint.y}%`
              : '50% 50%';

            return (
              <section
                key={section.key}
                className="relative isolate flex min-h-[72vh] items-center overflow-hidden bg-forest-900 px-5 py-24 text-white"
              >
                {section.hero.image ? (
                  <div
                    aria-label={section.hero.image.altText}
                    role="img"
                    className="absolute inset-0 -z-20 bg-cover bg-center"
                    style={{
                      backgroundImage: `url("${section.hero.image.url}")`,
                      backgroundPosition: focalPoint,
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 -z-10 bg-forest-900/70" />
                <div className="mx-auto max-w-6xl">
                  {section.hero.eyebrow ? (
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold-600">
                      {section.hero.eyebrow}
                    </p>
                  ) : null}
                  <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight sm:text-7xl">
                    {section.hero.heading}
                  </h1>
                  {section.hero.body ? (
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-cream">
                      {section.hero.body}
                    </p>
                  ) : null}
                </div>
              </section>
            );
          }

          if (section.type === 'richText') {
            return (
              <section key={section.key} className="px-5 py-20">
                <div
                  className="mx-auto max-w-3xl space-y-5 text-lg leading-8 text-ink-700 [&_a]:font-semibold [&_a]:text-gold-700 [&_blockquote]:border-l-4 [&_blockquote]:border-gold-600 [&_blockquote]:pl-5 [&_h2]:font-serif [&_h2]:text-4xl [&_h2]:text-forest-900 [&_h3]:font-serif [&_h3]:text-2xl [&_h3]:text-forest-900 [&_li]:ml-6 [&_li]:list-disc"
                  dangerouslySetInnerHTML={{ __html: section.richText.body }}
                />
              </section>
            );
          }

          if (section.type === 'timeline') {
            return (
              <section
                key={section.key}
                className={`px-5 py-20 ${timelineBackgroundClass(section.timeline.backgroundColor)}`}
              >
                <div className="mx-auto max-w-6xl">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold-700">
                    {section.timeline.sectionLabel}
                  </p>
                  <div
                    className={`mt-10 grid gap-6 ${
                      section.timeline.layout === 'stacked' ? 'max-w-3xl' : 'lg:grid-cols-2'
                    }`}
                  >
                    {section.timeline.items.map((item) => (
                      <article
                        key={`${section.key}-${item.year}-${item.title}`}
                        className="rounded-3xl border border-line bg-white/85 p-6 text-forest-900 shadow-card"
                      >
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold-700">
                          {item.year}
                        </p>
                        <h2 className="mt-3 font-serif text-3xl">{item.title}</h2>
                        <p className="mt-3 leading-7 text-ink-700">{item.description}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          if (section.type === 'cta') {
            return (
              <section key={section.key} className="bg-forest-900 px-5 py-20 text-white">
                <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 rounded-[2rem] border border-white/15 bg-white/10 p-8 shadow-card sm:p-10">
                  <h2 className="font-serif text-4xl">{section.cta.heading}</h2>
                  {section.cta.body ? (
                    <p className="max-w-2xl text-lg leading-8 text-cream">{section.cta.body}</p>
                  ) : null}
                  <a
                    href={section.cta.buttonUrl}
                    className="inline-flex items-center gap-2 rounded-full bg-gold-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-gold-700"
                  >
                    {section.cta.buttonLabel}
                    <ExternalLink aria-hidden="true" className="size-4" />
                  </a>
                </div>
              </section>
            );
          }

          return (
            <section key={section.key} className="px-5 py-20">
              <div className="mx-auto max-w-5xl rounded-[2rem] border border-line bg-white p-8 shadow-card">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-700">
                  Gallery
                </p>
                <h2 className="mt-3 font-serif text-4xl text-forest-900">
                  {section.gallery.heading || 'Gallery section'}
                </h2>
                <p className="mt-3 text-ink-700">
                  Gallery rendering will connect to approved website media in the public site phase.
                </p>
              </div>
            </section>
          );
        })}
      </article>

      <footer className="border-t border-line bg-cream-alt px-5 py-8">
        <div className="mx-auto max-w-6xl text-sm text-ink-700">
          Preview generated from draft CMS content. Last edited{' '}
          {dateFormatter.format(new Date(page.lastEditedAt))}.
        </div>
      </footer>
    </main>
  );
}
