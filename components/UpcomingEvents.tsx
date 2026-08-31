import { events } from '@/lib/content';
import { EventCard } from './EventCard';
import { SectionHeading } from './SectionHeading';

export function UpcomingEvents() {
  return (
    <section id="events" className="border-t border-line bg-cream px-6 py-14 md:px-10 md:py-20 lg:px-12 lg:pb-8 lg:pt-9">
      <div className="mx-auto max-w-[1360px]">
        <SectionHeading title="Upcoming Events" linkLabel="View All Events" href="#events" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {events.map((event) => <EventCard key={event.title} {...event} />)}
        </div>
      </div>
    </section>
  );
}
