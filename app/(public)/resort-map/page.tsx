import { PublicResortMap } from '@/components/public/PublicResortMap';
import { getPublicResortMap } from '@/server/public/getPublicResortMap';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Resort Map | Sun Aura Resort',
  description: 'Explore a read-only public map of Sun Aura Resort sites and status.',
};

export default async function ResortMapPage() {
  const sites = await getPublicResortMap();

  return (
    <>
      <section className="bg-forest-900 px-6 py-20 text-white md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-600">
            Resort map
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight sm:text-6xl">
            A read-only guide to cabins, RV sites, tent areas, and site status.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream">
            Guests can review the resort layout and current site status without exposing admin map
            controls.
          </p>
        </div>
      </section>
      <PublicResortMap sites={sites} />
    </>
  );
}
