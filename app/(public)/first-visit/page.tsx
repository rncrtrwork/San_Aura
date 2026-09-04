import Link from 'next/link';
import { PublicCmsSections } from '@/components/public/PublicCmsSections';
import { getPublicContentPage } from '@/server/public/getPublicContentPage';
import { getPublicSeoMetadata } from '@/server/public/getPublicSeoMetadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return getPublicSeoMetadata('first-visit', {
    title: 'First Visit & Reservations | Sun Aura Resort',
    description: 'Review first-visit guidance and reservation expectations for Sun Aura Resort.',
  });
}

const visitSteps = [
  {
    title: 'Choose your stay',
    body: 'Review cabins, RV sites, tent sites, and seasonal rules before sending a reservation request.',
  },
  {
    title: 'Wait for confirmation',
    body: 'Booking requests create pending reservations so resort staff can confirm availability and details directly.',
  },
  {
    title: 'Arrive prepared',
    body: 'Bring required documents, respect the 21+ environment, and plan around posted check-in and checkout windows.',
  },
];

const guestNotes = [
  'Photography and video are prohibited across the property.',
  'Quiet, respectful conduct is expected in shared spaces.',
  'Pets, vehicles, and additional guests may require staff confirmation.',
  'Reservation changes should be requested before the cancellation window closes.',
];

export default async function FirstVisitPage() {
  const cmsPage = await getPublicContentPage('first-visit');
  if (cmsPage) return <PublicCmsSections page={cmsPage} />;

  return (
    <>
      <section className="bg-forest-900 px-6 py-20 text-white md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-600">
            First visit
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight sm:text-6xl">
            Everything guests need before requesting a stay.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream">
            A calm, professional guide for arrival details, reservation expectations, resort
            etiquette, and privacy-first policies.
          </p>
          <Link
            href="/resort-explore"
            className="mt-8 inline-flex rounded-full bg-gold-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-gold-700"
          >
            Start a booking request
          </Link>
        </div>
      </section>
      <section className="bg-cream px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-[1180px] gap-6 md:grid-cols-3">
          {visitSteps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[2rem] border border-line bg-[#fbfaf6] p-7"
            >
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold-700">
                Step {index + 1}
              </p>
              <h2 className="mt-3 font-serif text-3xl text-forest-900">{step.title}</h2>
              <p className="mt-3 leading-7 text-ink-700">{step.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-cream-alt px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-700">
              Reservations
            </p>
            <h2 className="mt-3 font-serif text-4xl text-forest-900">
              Requests are reviewed by resort staff before confirmation.
            </h2>
          </div>
          <div className="rounded-[2rem] border border-line bg-[#fbfaf6] p-7">
            <ul className="grid gap-4">
              {guestNotes.map((note) => (
                <li key={note} className="flex gap-3 text-sm leading-6 text-ink-700">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-gold-600" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
