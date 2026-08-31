import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ReservationCreateForm } from '@/components/admin/ReservationCreateForm';
import { requirePagePermission } from '@/server/auth/pageAuthorization';
import { getReservationFormOptions } from '@/server/reservations/getReservationFormOptions';

export const dynamic = 'force-dynamic';

export default async function NewReservationPage() {
  await requirePagePermission('reservations.write');
  const options = await getReservationFormOptions();
  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/reservations"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-admin-muted hover:text-admin-accent"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to reservations
        </Link>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
          Operations
        </p>
        <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">New Reservation</h1>
      </header>
      <ReservationCreateForm stayTypes={options.stayTypes} sites={options.sites} />
    </div>
  );
}
