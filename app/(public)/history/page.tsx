import { PublicCmsSections } from '@/components/public/PublicCmsSections';
import { getPublicContentPage } from '@/server/public/getPublicContentPage';

export const dynamic = 'force-dynamic';

const fallbackTimeline = [
  {
    year: '1930s',
    title: 'A nature-first destination begins',
    description:
      'The La Porte property became known as a private outdoor retreat where guests could spend unhurried time among trees, water, and open air.',
  },
  {
    year: '1970s',
    title: 'A resort community takes shape',
    description:
      'Seasonal camping, social gatherings, and repeat visitors helped shape the welcoming resort rhythm guests still recognize today.',
  },
  {
    year: 'Today',
    title: 'Sun Aura Resort looks ahead',
    description:
      'The modern resort experience keeps privacy and community at the center while improving reservations, communication, and guest information.',
  },
];

export default async function HistoryPage() {
  const cmsPage = await getPublicContentPage('history');
  if (cmsPage) return <PublicCmsSections page={cmsPage} />;

  return (
    <>
      <section className="bg-forest-900 px-6 py-20 text-white md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-600">
            Resort history
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight sm:text-6xl">
            A long-running retreat with a renewed digital welcome.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream">
            This page is ready to render the dedicated CMS timeline seeded for the client. Until
            that content is published, guests see a concise history overview.
          </p>
        </div>
      </section>
      <section className="bg-cream px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="mx-auto max-w-[1000px]">
          <div className="grid gap-6">
            {fallbackTimeline.map((item) => (
              <article
                key={item.year}
                className="rounded-[2rem] border border-line bg-[#fbfaf6] p-6 shadow-card md:p-8"
              >
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold-700">
                  {item.year}
                </p>
                <h2 className="mt-3 font-serif text-3xl text-forest-900">{item.title}</h2>
                <p className="mt-3 leading-7 text-ink-700">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
