import { getPublicEvents } from '@/server/events/getPublicEvents';
import { EventCard } from './EventCard';
import { SectionHeading } from './SectionHeading';

const eventFallbackImages = [
  '/images/event-forest-enhanced.jpg',
  '/images/event-lake-enhanced.png',
  '/images/event-lights-enhanced.png',
  '/images/event-flowers-enhanced.png',
];

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

function eventTime(startsAt: string, endsAt: string): string {
  return `${timeFormatter.format(new Date(startsAt))} – ${timeFormatter.format(new Date(endsAt))}`;
}

export async function UpcomingEvents() {
  const events = (await getPublicEvents()).slice(0, 4);

  return (
    <section
      id="events"
      className="border-t border-line bg-cream px-6 py-14 md:px-10 md:py-20 lg:px-12 lg:pb-8 lg:pt-9"
    >
      <div className="mx-auto max-w-[1360px]">
        <SectionHeading title="Upcoming Events" linkLabel="View All Events" href="/events" />
        {events.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                date={dateFormatter.format(new Date(event.startsAt))}
                title={event.title}
                time={eventTime(event.startsAt, event.endsAt)}
                image={event.imageUrl || eventFallbackImages[index % eventFallbackImages.length]}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-[#fbfaf6] p-8 text-center">
            <p className="font-serif text-2xl text-forest-900">No published events yet</p>
            <p className="mt-2 text-sm text-ink-700">
              Events published from the admin dashboard will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
