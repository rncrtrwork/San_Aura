import { CalendarDays, MapPin } from 'lucide-react';
import { EventRegistrationForm } from '@/components/EventRegistrationForm';
import { Header } from '@/components/Header';
import { InfoFooterRow } from '@/components/InfoFooterRow';
import { SiteFooter } from '@/components/SiteFooter';
import { getPublicEvents } from '@/server/events/getPublicEvents';

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

function eventDate(event: { startsAt: string; endsAt: string }): string {
  const startsAt = new Date(event.startsAt);
  const endsAt = new Date(event.endsAt);
  return `${dateFormatter.format(startsAt)} · ${timeFormatter.format(startsAt)}-${timeFormatter.format(endsAt)}`;
}

export default async function EventsPage() {
  const events = await getPublicEvents();

  return (
    <>
      <Header />
      <main>
        <section className="bg-forest-900 px-6 py-16 text-white md:px-10 lg:px-12">
          <div className="mx-auto max-w-[1360px]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-600">
              Resort programming
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">Upcoming Events</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
              Gather for seasonal socials, lake days, wellness walks, and member gatherings across
              the resort.
            </p>
          </div>
        </section>
        <section className="bg-cream px-6 py-14 md:px-10 md:py-16 lg:px-12">
          <div className="mx-auto grid max-w-[1360px] gap-6">
            {events.length === 0 ? (
              <div className="rounded-lg border border-line bg-[#fbfaf6] p-10 text-center">
                <p className="font-serif text-3xl text-forest-900">No published events yet</p>
                <p className="mt-2 text-sm text-ink-700">
                  Check back soon for the next resort gathering.
                </p>
              </div>
            ) : (
              events.map((event) => (
                <article
                  key={event.id}
                  className="grid overflow-hidden rounded-lg border border-line bg-[#fbfaf6] md:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1fr)]"
                >
                  <div
                    className="min-h-72 bg-cover bg-center"
                    style={{
                      backgroundImage: event.imageUrl
                        ? `url("${event.imageUrl}")`
                        : "url('/images/event-lake-enhanced.png')",
                    }}
                    aria-hidden="true"
                  />
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap gap-3 text-sm font-semibold text-ink-700">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays aria-hidden="true" className="size-4 text-gold-700" />
                        {eventDate(event)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin aria-hidden="true" className="size-4 text-gold-700" />
                        {event.location}
                      </span>
                    </div>
                    <h2 className="mt-4 font-serif text-3xl text-forest-900">{event.title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-700">
                      {event.description}
                    </p>
                    {event.registrationRequired ? (
                      <p className="mt-4 text-sm font-bold text-forest-900">
                        {event.capacity === null
                          ? 'Registration open'
                          : `${event.capacity} spots remaining`}
                      </p>
                    ) : null}
                    <EventRegistrationForm event={event} />
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
      <div
        className="bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/images/footer-bg.png')",
          backgroundPosition: 'center 100%',
        }}
      >
        <InfoFooterRow />
        <SiteFooter />
      </div>
    </>
  );
}
