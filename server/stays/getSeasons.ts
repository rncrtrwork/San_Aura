import { connectToDatabase } from '@/lib/db';
import type { AdminSeason } from '@/lib/seasons';
import { Season } from '@/models/Season';

function dateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getSeasons(): Promise<AdminSeason[]> {
  await connectToDatabase();
  const seasons = await Season.find()
    .select('name startsOn endsOn rateOverrides active updatedAt')
    .sort({ startsOn: -1, name: 1 })
    .lean();

  return seasons.map((season) => ({
    id: season._id.toString(),
    name: season.name,
    startsOn: dateInputValue(season.startsOn),
    endsOn: dateInputValue(season.endsOn),
    rateOverrides: season.rateOverrides.map((override) => ({
      stayTypeId: override.stayTypeRef.toString(),
      baseRate: override.baseRate,
      weekendRate: override.weekendRate,
    })),
    active: season.active,
    updatedAt: season.updatedAt.toISOString(),
  }));
}
