import { PublicBookingForm } from '@/components/public/PublicBookingForm';
import { getPublicBookingOptions } from '@/server/public/getPublicBookingOptions';

export const dynamic = 'force-dynamic';

export default async function BookPage() {
  const stayTypes = await getPublicBookingOptions();

  return (
    <>
      <section className="bg-forest-900 px-6 py-20 text-white md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-600">
            Book a stay
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight sm:text-6xl">
            Request dates, choose an available site, and let staff confirm the details.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream">
            This MVP flow checks resort availability and creates a pending reservation request. No
            payment is captured online.
          </p>
        </div>
      </section>
      <section className="bg-cream px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <PublicBookingForm stayTypes={stayTypes} />
        </div>
      </section>
    </>
  );
}
