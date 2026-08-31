import { BedDouble, CircleDollarSign, LogOut, Luggage } from 'lucide-react';
import { KpiCard } from '@/components/admin/KpiCard';
import { OccupancyChart } from '@/components/admin/OccupancyChart';
import { TodaysTasks } from '@/components/admin/TodaysTasks';
import { getOccupancySeries } from '@/server/dashboard/getOccupancySeries';
import { getOverviewMetrics } from '@/server/dashboard/getOverviewMetrics';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return <AdminOverview />;
}

async function AdminOverview() {
  const [metrics, occupancy] = await Promise.all([getOverviewMetrics(), getOccupancySeries()]);
  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-7">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-admin-accent">
          Overview
        </p>
        <h1 className="font-serif text-4xl text-forest-900 sm:text-5xl">
          Here&apos;s what&apos;s happening
        </h1>
      </header>
      <section aria-label="Resort performance" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Occupancy"
          value={`${metrics.occupancyPercent}%`}
          delta={metrics.occupancyDelta}
          comparison={`${Math.abs(metrics.occupancyDelta)} pts vs last week`}
          icon={BedDouble}
        />
        <KpiCard
          label="Arrivals Today"
          value={metrics.arrivalsToday.toString()}
          delta={metrics.arrivalsDelta}
          comparison={`${Math.abs(metrics.arrivalsDelta)} vs yesterday`}
          icon={Luggage}
        />
        <KpiCard
          label="Departures Today"
          value={metrics.departuresToday.toString()}
          delta={metrics.departuresDelta}
          comparison={`${Math.abs(metrics.departuresDelta)} vs yesterday`}
          icon={LogOut}
        />
        <KpiCard
          label="Revenue This Week"
          value={currency.format(metrics.revenueThisWeek)}
          delta={metrics.revenueDeltaPercent}
          comparison={`${Math.abs(metrics.revenueDeltaPercent)}% vs last week`}
          icon={CircleDollarSign}
        />
      </section>
      <OccupancyChart data={occupancy} />
      <div className="grid gap-6 xl:grid-cols-2">
        <TodaysTasks />
      </div>
    </div>
  );
}
