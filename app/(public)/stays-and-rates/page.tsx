import Link from 'next/link';
import { publicStartingRateLabel } from '@/lib/publicStays';
import { stayTypeLabels } from '@/lib/stayTypes';
import { getPublicStayTypes } from '@/server/public/getPublicStayTypes';

export const dynamic = 'force-dynamic';

export default async function StaysAndRatesPage() {
  const stayTypes = await getPublicStayTypes();

  return (
    <>
      <section className="bg-forest-900 px-6 py-20 text-white md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-600">
            Stays & rates
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight sm:text-6xl">
            Choose the stay style that fits your Sun Aura visit.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream">
            Starting rates, minimum stays, and unit counts are pulled from admin-managed stay types.
          </p>
        </div>
      </section>
      <section className="bg-cream px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          {stayTypes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stayTypes.map((stayType) => (
                <article
                  key={stayType.id}
                  className="flex min-h-full flex-col rounded-[2rem] border border-line bg-[#fbfaf6] p-7 shadow-card"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-700">
                    {stayTypeLabels[stayType.siteType]}
                  </p>
                  <h2 className="mt-3 font-serif text-3xl text-forest-900">{stayType.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-ink-700">{stayType.description}</p>
                  <div className="mt-6 rounded-[1.25rem] bg-cream-alt p-4">
                    <p className="font-serif text-2xl text-forest-900">
                      {publicStartingRateLabel(stayType.startingRate)}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
                      {stayType.unitCount} units · {stayType.minimumStay} night minimum
                    </p>
                  </div>
                  {stayType.amenities.length > 0 ? (
                    <ul className="mt-5 grid gap-2">
                      {stayType.amenities.slice(0, 5).map((amenity) => (
                        <li key={amenity} className="flex gap-2 text-sm text-ink-700">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-600" />
                          <span>{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <Link
                    href={`/book?stayType=${stayType.siteType}`}
                    className="mt-auto inline-flex w-fit rounded-full bg-forest-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-forest-800"
                  >
                    Request this stay
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-line bg-[#fbfaf6] p-10 text-center">
              <h2 className="font-serif text-3xl text-forest-900">Stay types are being prepared</h2>
              <p className="mt-3 text-sm leading-6 text-ink-700">
                Active stay types and starting rates will appear here once staff publishes them.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
