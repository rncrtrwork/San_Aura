import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type {
  ContentCtaSection,
  ContentHeroSection,
  ContentPreviewPage,
  ContentTimelineItem,
} from '@/lib/contentManager';
import { getPublicContentPage } from '@/server/public/getPublicContentPage';
import { getPublicFaqPage } from '@/server/public/getPublicFaqPage';
import { getPublicSeoMetadata } from '@/server/public/getPublicSeoMetadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return getPublicSeoMetadata('history', {
    title: 'History | Sun Aura Resort',
    description: 'Explore the history timeline for Sun Aura Resort.',
  });
}

type HistoryFaqItem = {
  id: string;
  question: string;
  answerHtml: string;
};

const fallbackHero: ContentHeroSection = {
  imageId: '',
  eyebrow: 'Resort history',
  heading: 'Our History',
  body:
    'From a quiet nature retreat to a modern adults-only resort community, Sun Aura’s story has always centered on open air, privacy, and easygoing connection.',
};

const fallbackTimeline: ContentTimelineItem[] = [
  {
    year: '1930s',
    title: 'A nature-first destination begins',
    description:
      'The La Porte property became known as a private outdoor retreat where guests could spend unhurried time among trees, water, and open air.',
  },
  {
    year: 'Around 1970',
    title: 'The giant leg becomes a landmark',
    description:
      'The working sundial known as the giant leg became one of the property’s most recognizable roadside landmarks.',
  },
  {
    year: '2015',
    title: 'A landmark restoration',
    description:
      'After new ownership took over, the giant leg was repaired, refinished, and restored in time for Memorial Day weekend.',
  },
  {
    year: '2021',
    title: 'More poolside space',
    description:
      'The resort added a conversation pool, expanding the pool area alongside the established Olympic-sized pool.',
  },
  {
    year: 'Present Day',
    title: 'A 300-acre resort community',
    description:
      'Sun Aura continues as an adults-only retreat with camping, cabins, wooded trails, weekend dances, and year-round hospitality.',
  },
];

const fallbackFaqItems: HistoryFaqItem[] = [
  {
    id: 'history-first-visit',
    question: 'Where should first-time guests start?',
    answerHtml:
      '<p>Start with the First Visit guide, then contact the office if you have questions about reservations, arrival, or resort expectations.</p>',
  },
  {
    id: 'history-privacy',
    question: 'Why is privacy such a big part of the resort story?',
    answerHtml:
      '<p>Sun Aura is built around guest comfort and discretion, so privacy-minded guidelines help keep the resort relaxed for everyone.</p>',
  },
  {
    id: 'history-events',
    question: 'Are events part of the resort tradition?',
    answerHtml:
      '<p>Yes. Weekend gatherings, dances, and seasonal activities are part of the community rhythm guests return for year after year.</p>',
  },
];

const timelineImageUrls = [
  '/images/gallery-sign.jpg',
  '/images/gallery-path.jpg',
  '/images/gallery-pool.png',
  '/images/gallery-cabin.jpg',
];

function activeHero(page: ContentPreviewPage | null): ContentHeroSection {
  const section = page?.sections.find((entry) => entry.active && entry.type === 'hero');
  if (!section || section.type !== 'hero') return fallbackHero;
  return section.hero;
}

function activeTimelineItems(page: ContentPreviewPage | null): ContentTimelineItem[] {
  const section = page?.sections.find((entry) => entry.active && entry.type === 'timeline');
  if (!section || section.type !== 'timeline' || section.timeline.items.length === 0) {
    return fallbackTimeline;
  }
  return section.timeline.items;
}

function activeCta(page: ContentPreviewPage | null): ContentCtaSection | null {
  const section = page?.sections.find((entry) => entry.active && entry.type === 'cta');
  if (!section || section.type !== 'cta') return null;
  return section.cta;
}

function safeLinkTarget(value: string): string {
  if (value.startsWith('/')) return value;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return url.toString();
  } catch {
    return '/contact';
  }
  return '/contact';
}

function TimelineCard({
  item,
  imageUrl,
  align,
}: {
  item: ContentTimelineItem;
  imageUrl: string;
  align: 'left' | 'right';
}) {
  return (
    <article
      className={`rounded-xl border border-line bg-white p-7 shadow-card md:p-9 ${
        align === 'left' ? 'lg:text-right' : ''
      }`}
    >
      <div
        className={`flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between ${
          align === 'left' ? 'lg:flex-row-reverse' : ''
        }`}
      >
        <div
          aria-hidden="true"
          className="h-20 w-28 shrink-0 rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />
        <p className="font-serif text-5xl leading-none text-forest-900">{item.year}</p>
      </div>
      <h2 className="mt-7 font-serif text-3xl text-forest-900">{item.title}</h2>
      <ul
        className={`mt-5 space-y-3 text-left text-lg leading-8 text-ink-700 ${
          align === 'left' ? 'lg:ml-auto lg:max-w-[90%]' : ''
        }`}
      >
        <li>{item.description}</li>
      </ul>
    </article>
  );
}

function HistoryTimeline({ items }: { items: ContentTimelineItem[] }) {
  return (
    <section className="bg-white px-6 pb-24 pt-8 md:px-10 md:pb-28 lg:px-12">
      <div className="relative mx-auto max-w-[1360px]">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 hidden h-full w-1 -translate-x-1/2 rounded-full bg-line lg:block"
        />
        <ol className="grid gap-8 md:gap-10">
          {items.map((item, index) => {
            const align = index % 2 === 0 ? 'left' : 'right';
            const imageUrl = timelineImageUrls[index % timelineImageUrls.length];

            return (
              <li
                key={`${item.year}-${item.title}`}
                className="relative pl-9 lg:grid lg:grid-cols-[1fr_88px_1fr] lg:items-center lg:gap-0 lg:pl-0"
              >
                <div
                  aria-hidden="true"
                  className="absolute bottom-[-2rem] left-1 top-8 w-px bg-line lg:hidden"
                />
                <span
                  aria-hidden="true"
                  className="absolute left-[-1px] top-8 size-3 rounded-full bg-gold-600 ring-8 ring-white lg:hidden"
                />
                {align === 'left' ? (
                  <TimelineCard item={item} imageUrl={imageUrl} align={align} />
                ) : (
                  <div className="hidden lg:block" />
                )}
                <div
                  aria-hidden="true"
                  className="relative z-10 hidden items-center justify-center lg:flex"
                >
                  <span className="h-px flex-1 bg-line" />
                  <span className="size-4 rounded-full bg-gold-600 ring-8 ring-white" />
                  <span className="h-px flex-1 bg-line" />
                </div>
                {align === 'right' ? (
                  <TimelineCard item={item} imageUrl={imageUrl} align={align} />
                ) : (
                  <div className="hidden lg:block" />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function faqPreviewItems(
  faqPage: Awaited<ReturnType<typeof getPublicFaqPage>>,
): HistoryFaqItem[] {
  const orderedItems = faqPage.categories.flatMap((category) => category.items);
  const featuredIds = new Set(faqPage.featuredItems.map((item) => item.id));
  const items = [
    ...faqPage.featuredItems,
    ...orderedItems.filter((item) => !featuredIds.has(item.id)),
  ].slice(0, 5);

  if (items.length === 0) return fallbackFaqItems;

  return items.map((item) => ({
    id: item.id,
    question: item.question,
    answerHtml: item.answer,
  }));
}

function HistoryFaq({ items }: { items: HistoryFaqItem[] }) {
  return (
    <section className="bg-cream-alt px-6 py-20 md:px-10 md:py-24 lg:px-12">
      <div className="mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-forest-900">FAQ</p>
          <h2 className="mt-4 font-serif text-5xl leading-tight text-gold-700 md:text-6xl">
            You’ve Got Questions.
            <br />
            We’ve Got Answers.
          </h2>
          <div
            aria-hidden="true"
            className="mt-10 aspect-[1.62/1] max-w-xl rounded-lg bg-cover bg-center shadow-card"
            style={{ backgroundImage: "url('/images/stay-cabin-enhanced-v2.png')" }}
          />
        </div>
        <div className="rounded-xl border border-line bg-[#fbfaf6]">
          {items.map((item) => (
            <details key={item.id} className="group border-b border-line last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-6 text-left text-lg font-bold uppercase tracking-[0.12em] text-forest-900 md:px-8">
                <span>{item.question}</span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-6 shrink-0 text-gold-700 transition-transform group-open:rotate-90"
                />
              </summary>
              <div
                className="px-6 pb-6 text-base leading-7 text-ink-700 md:px-8 [&_a]:font-semibold [&_a]:text-gold-700 [&_li]:ml-5 [&_li]:list-disc"
                dangerouslySetInnerHTML={{ __html: item.answerHtml }}
              />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function HistoryCta({ cta }: { cta: ContentCtaSection }) {
  return (
    <section className="bg-white px-6 pb-20 md:px-10 lg:px-12">
      <div className="mx-auto flex max-w-[1180px] flex-col items-start gap-6 rounded-[2rem] bg-forest-900 p-8 text-white shadow-card sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-serif text-4xl">{cta.heading}</h2>
          {cta.body ? <p className="mt-3 max-w-2xl leading-7 text-cream">{cta.body}</p> : null}
        </div>
        <Link
          href={safeLinkTarget(cta.buttonUrl)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-gold-700"
        >
          {cta.buttonLabel}
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  );
}

export default async function HistoryPage() {
  const [cmsPage, faqPage] = await Promise.all([getPublicContentPage('history'), getPublicFaqPage()]);
  const hero = activeHero(cmsPage);
  const timelineItems = activeTimelineItems(cmsPage);
  const cta = activeCta(cmsPage);
  const faqItems = faqPreviewItems(faqPage);

  return (
    <>
      <section className="bg-[#fbfaf6] px-6 pb-24 pt-20 md:px-10 md:pb-32 lg:px-12">
        <div className="mx-auto max-w-[1180px] text-center">
          {hero.eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-forest-900">
              {hero.eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 font-serif text-6xl leading-none text-gold-700 md:text-7xl">
            {hero.heading}
          </h1>
          {hero.body ? (
            <p className="mx-auto mt-7 max-w-4xl text-xl leading-9 text-ink-700">{hero.body}</p>
          ) : null}
        </div>
      </section>
      <HistoryTimeline items={timelineItems} />
      {cta ? <HistoryCta cta={cta} /> : null}
      <HistoryFaq items={faqItems} />
    </>
  );
}
