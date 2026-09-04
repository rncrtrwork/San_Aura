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

type VisitorVisitLean = Pick<
  VisitorVisitDocument,
  | 'browserName'
  | 'browserVersion'
  | 'operatingSystem'
  | 'country'
  | 'region'
  | 'city'
  | 'ipAddress'
  | 'createdAt'
> & {
  _id: { toString(): string };
};

function startOfToday(): Date {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
}

function mapEntry(entry: VisitorVisitLean): VisitorLogEntry {
  return {
    id: entry._id.toString(),
    browserName: entry.browserName,
    browserVersion: entry.browserVersion,
    operatingSystem: entry.operatingSystem,
    country: entry.country,
    region: entry.region,
    city: entry.city,
    ipAddress: entry.ipAddress,
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function getVisitorLog(): Promise<VisitorLog> {
  await connectToDatabase();

  const [totalVisits, visitsToday, uniqueIpAddresses, entries] = await Promise.all([
    VisitorVisit.countDocuments(),
    VisitorVisit.countDocuments({ createdAt: { $gte: startOfToday() } }),
    VisitorVisit.distinct<string>('ipAddress'),
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
