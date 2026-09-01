import { notFound } from 'next/navigation';
import Link from 'next/link';
import { EventEditPanel } from '@/components/admin/EventEditPanel';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import { getEventDetail } from '@/server/events/getEventDetail';

export const dynamic = 'force-dynamic';

type EventDetailPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  await requirePagePermission('events.read');
  const { eventId } = await params;
  const event = await getEventDetail(eventId);
  if (!event) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/events"
          className="text-sm font-semibold text-admin-muted hover:text-admin-accent"
        >
          Back to events
        </Link>
        <p className="mb-2 mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
          Programming
        </p>
        <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Edit Event</h1>
      </header>
      <EventEditPanel event={event} />
    </div>
  );
}
