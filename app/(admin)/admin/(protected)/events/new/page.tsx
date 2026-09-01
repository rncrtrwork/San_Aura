import Link from 'next/link';
import { EventCreateForm } from '@/components/admin/EventCreateForm';
import { requirePagePermission } from '@/server/auth/pageAuthorization';

export const dynamic = 'force-dynamic';

export default async function NewEventPage() {
  await requirePagePermission('events.write');

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
        <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">Create Event</h1>
        <p className="mt-2 max-w-2xl text-sm text-admin-muted">
          Add a resort event draft with schedule, registration, capacity, and promotional image.
        </p>
      </header>
      <EventCreateForm />
    </div>
  );
}
