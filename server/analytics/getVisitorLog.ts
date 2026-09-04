import { connectToDatabase } from '@/lib/db';
import { VisitorVisit, type VisitorVisitDocument } from '@/models/VisitorVisit';

export type VisitorLogEntry = {
  id: string;
  browserName: string;
  browserVersion: string;
  operatingSystem: string;
  country: string;
  region: string;
  city: string;
  ipAddress: string;
  createdAt: string;
};

export type VisitorLogSummary = {
  totalVisits: number;
  visitsToday: number;
  uniqueIpCount: number;
};

export type VisitorLog = {
  summary: VisitorLogSummary;
  entries: VisitorLogEntry[];
};

type VisitorVisitLean = Pick<VisitorVisitDocument, 'createdAt'> &
  Pick<
    Partial<VisitorVisitDocument>,
    | 'browserName'
    | 'browserVersion'
    | 'operatingSystem'
    | 'country'
    | 'region'
    | 'city'
    | 'ipAddress'
  > & {
    _id: { toString(): string };
  };

function textOrUnknown(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : 'Unknown';
}

function startOfToday(): Date {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
}

function mapEntry(entry: VisitorVisitLean): VisitorLogEntry {
  return {
    id: entry._id.toString(),
    browserName: textOrUnknown(entry.browserName),
    browserVersion: entry.browserVersion?.trim() ?? '',
    operatingSystem: textOrUnknown(entry.operatingSystem),
    country: textOrUnknown(entry.country),
    region: textOrUnknown(entry.region),
    city: textOrUnknown(entry.city),
    ipAddress: textOrUnknown(entry.ipAddress),
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function getVisitorLog(): Promise<VisitorLog> {
  await connectToDatabase();

  const [totalVisits, visitsToday, uniqueIpAddresses, entries] = await Promise.all([
    VisitorVisit.countDocuments(),
    VisitorVisit.countDocuments({ createdAt: { $gte: startOfToday() } }),
    VisitorVisit.distinct<string>('ipAddress', { ipAddress: { $nin: ['', null, 'Unknown'] } }),
    VisitorVisit.find().sort({ createdAt: -1 }).limit(200).lean<VisitorVisitLean[]>(),
  ]);

  return {
    summary: {
      totalVisits,
      visitsToday,
      uniqueIpCount: uniqueIpAddresses.length,
    },
    entries: entries.map(mapEntry),
  };
}
