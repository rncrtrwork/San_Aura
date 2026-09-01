import Link from 'next/link';
import { publicAddressLines, publicMailtoHref, publicTelHref } from '@/lib/publicContact';
import { getPublicContactInfo } from '@/server/public/getPublicContactInfo';
import { getPublicSeoMetadata } from '@/server/public/getPublicSeoMetadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return getPublicSeoMetadata('contact', {
    title: 'Contact | Sun Aura Resort',
    description: 'Contact Sun Aura Resort for reservation, membership, and visit questions.',
  });
}

export default async function ContactPage() {
  const contact = await getPublicContactInfo();
  const addressLines = publicAddressLines(contact);

  return (
    <>
      <section className="bg-forest-900 px-6 py-20 text-white md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-600">Contact</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight sm:text-6xl">
            Reach {contact.resortName} before your visit.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream">
            Send questions about reservations, memberships, events, or first-time arrival details.
          </p>
        </div>
      </section>
      <section className="bg-cream px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2rem] border border-line bg-[#fbfaf6] p-8 shadow-card">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-700">
              Property information
            </p>
            <h2 className="mt-3 font-serif text-4xl text-forest-900">{contact.resortName}</h2>
            <address className="mt-6 not-italic leading-7 text-ink-700">
              {addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <div className="mt-8 grid gap-3 text-sm font-semibold text-forest-900">
              <Link href={publicTelHref(contact.phone)}>{contact.phone}</Link>
              <Link href={publicMailtoHref(contact.email)}>{contact.email}</Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-line bg-forest-900 p-8 text-white shadow-card">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-600">
              Arrival timing
            </p>
            <dl className="mt-6 grid gap-5">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-cream">
                  Check-in
                </dt>
                <dd className="mt-1 font-serif text-3xl">{contact.checkInTime}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-cream">
                  Checkout
                </dt>
                <dd className="mt-1 font-serif text-3xl">{contact.checkOutTime}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-cream">
                  Key return
                </dt>
                <dd className="mt-1 font-serif text-3xl">{contact.keyReturnTime}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
