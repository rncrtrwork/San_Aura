import Link from 'next/link';
import { PublicCmsSections } from '@/components/public/PublicCmsSections';
import { getPublicContentPage } from '@/server/public/getPublicContentPage';

export const dynamic = 'force-dynamic';

export default async function OurStoryPage() {
  const cmsPage = await getPublicContentPage('our-story');
  if (cmsPage) return <PublicCmsSections page={cmsPage} />;

  return (
    <>
      <section className="bg-forest-900 px-6 py-20 text-white md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-600">
            Our story
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight sm:text-6xl">
            A private Northwest Indiana retreat shaped by nature, community, and quiet renewal.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream">
            Sun Aura Resort blends wooded campsites, seasonal gatherings, and restorative space for
            adults looking for an easygoing escape close to home.
          </p>
        </div>
      </section>
      <section className="bg-cream px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-700">
              Room to belong
            </p>
            <h2 className="mt-3 font-serif text-4xl text-forest-900">
              Designed for guests who value privacy, simplicity, and a slower pace.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-ink-700">
            <p>
              The resort experience centers on respectful connection: a comfortable arrival, clear
              expectations, quiet natural spaces, and staff who can guide first-time guests through
              the stay with confidence.
            </p>
            <p>
              The new website carries that same tone forward with straightforward information,
              visible privacy guidance, and resort content that staff can keep current from the CMS.
            </p>
            <Link
              href="/history"
              className="inline-flex rounded-full bg-forest-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-forest-800"
            >
              Explore the resort history
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
