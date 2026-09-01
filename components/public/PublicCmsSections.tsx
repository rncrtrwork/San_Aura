import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ContentPreviewPage } from '@/lib/contentManager';

type PublicCmsSectionsProps = {
  page: ContentPreviewPage;
};

function timelineBackgroundClass(value: string): string {
  if (value === 'forest') return 'bg-forest-900 text-white';
  if (value === 'cream') return 'bg-cream-alt text-forest-900';
  return 'bg-cream text-forest-900';
}

function safeLinkTarget(value: string): string {
  if (value.startsWith('/')) return value;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return url.toString();
  } catch {
    return '/';
  }
  return '/';
}

export function PublicCmsSections({ page }: PublicCmsSectionsProps) {
  return (
    <article aria-label={page.title}>
      {page.sections.map((section) => {
        if (section.type === 'hero') {
          const focalPoint = section.hero.image
            ? `${section.hero.image.focalPoint.x}% ${section.hero.image.focalPoint.y}%`
            : '50% 50%';

          return (
            <section
              key={section.key}
              className="relative isolate flex min-h-[680px] items-center overflow-hidden bg-forest-900 px-6 py-24 text-white md:px-10 lg:px-12"
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
              <div className="absolute inset-0 -z-10 bg-forest-900/65" />
              <div className="mx-auto w-full max-w-[1360px]">
                {section.hero.eyebrow ? (
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold-600">
                    {section.hero.eyebrow}
                  </p>
                ) : null}
                <h1 className="mt-4 max-w-4xl font-serif text-[46px] leading-[1.05] sm:text-6xl lg:text-7xl">
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
            <section key={section.key} className="bg-cream px-6 py-16 md:px-10 md:py-20 lg:px-12">
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
              className={`px-6 py-16 md:px-10 md:py-20 lg:px-12 ${timelineBackgroundClass(
                section.timeline.backgroundColor,
              )}`}
            >
              <div className="mx-auto max-w-[1180px]">
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
            <section key={section.key} className="bg-forest-900 px-6 py-16 text-white md:px-10">
              <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 rounded-[2rem] border border-white/15 bg-white/10 p-8 shadow-card sm:p-10">
                <h2 className="font-serif text-4xl">{section.cta.heading}</h2>
                {section.cta.body ? (
                  <p className="max-w-2xl text-lg leading-8 text-cream">{section.cta.body}</p>
                ) : null}
                <Link
                  href={safeLinkTarget(section.cta.buttonUrl)}
                  className="inline-flex items-center gap-2 rounded-full bg-gold-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-gold-700"
                >
                  {section.cta.buttonLabel}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </section>
          );
        }

        return (
          <section key={section.key} className="bg-cream px-6 py-16 md:px-10">
            <div className="mx-auto max-w-5xl rounded-[2rem] border border-line bg-white p-8 shadow-card">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-700">
                Gallery
              </p>
              <h2 className="mt-3 font-serif text-4xl text-forest-900">
                {section.gallery.heading || 'Resort moments'}
              </h2>
              <p className="mt-3 text-ink-700">
                Approved website gallery media appears on the full gallery page.
              </p>
            </div>
          </section>
        );
      })}
    </article>
  );
}
