import { connectToDatabase } from '@/lib/db';
import { VisitorVisit, type VisitorVisitDocument } from '@/models/VisitorVisit';

export type VisitorAnalyticsGroup = {
  label: string;
  count: number;
};

export type VisitorLocationAnalyticsGroup = {
  country: string;
  region: string;
  city: string;
  count: number;
};

export type VisitorAnalyticsVisit = {
  id: string;
  browserName: string;
  browserVersion: string;
  operatingSystem: string;
  country: string;
  region: string;
  city: string;
  createdAt: string;
};

export type VisitorAnalytics = {
  totalVisits: number;
  visitsToday: number;
  visitsLastSevenDays: number;
  topBrowsers: VisitorAnalyticsGroup[];
  topOperatingSystems: VisitorAnalyticsGroup[];
  topLocations: VisitorLocationAnalyticsGroup[];
  recentVisits: VisitorAnalyticsVisit[];
};

type VisitorVisitLean = Pick<
  VisitorVisitDocument,
  'browserName' | 'browserVersion' | 'operatingSystem' | 'country' | 'region' | 'city' | 'createdAt'
> & {
  _id: { toString(): string };
};

type LabelCountAggregate = {
  _id: string;
  count: number;
};

type LocationCountAggregate = {
  _id: {
    country: string;
    region: string;
    city: string;
  };
  count: number;
};

function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function recentDate(daysBack: number): Date {
  const value = startOfDay(new Date());
  value.setDate(value.getDate() - daysBack);
  return value;
}

function mapLabelGroup(group: LabelCountAggregate): VisitorAnalyticsGroup {
  return {
    label: group._id || 'Unknown',
    count: group.count,
  };
}

function mapLocationGroup(group: LocationCountAggregate): VisitorLocationAnalyticsGroup {
  return {
    country: group._id.country || 'Unknown',
    region: group._id.region || 'Unknown',
    city: group._id.city || 'Unknown',
    count: group.count,
  };
}

function mapVisit(visit: VisitorVisitLean): VisitorAnalyticsVisit {
  return {
    id: visit._id.toString(),
    browserName: visit.browserName,
    browserVersion: visit.browserVersion,
    operatingSystem: visit.operatingSystem,
    country: visit.country,
    region: visit.region,
    city: visit.city,
    createdAt: visit.createdAt.toISOString(),
  };
}

export async function getVisitorAnalytics(): Promise<VisitorAnalytics> {
  await connectToDatabase();

  const todayStart = startOfDay(new Date());
  const sevenDaysStart = recentDate(6);
  const [
    totalVisits,
    visitsToday,
    visitsLastSevenDays,
    topBrowsers,
    topOperatingSystems,
    topLocations,
    recentVisits,
  ] = await Promise.all([
    VisitorVisit.countDocuments(),
    VisitorVisit.countDocuments({ createdAt: { $gte: todayStart } }),
    VisitorVisit.countDocuments({ createdAt: { $gte: sevenDaysStart } }),
    VisitorVisit.aggregate<LabelCountAggregate>([
      { $group: { _id: '$browserName', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 8 },
    ]),
    VisitorVisit.aggregate<LabelCountAggregate>([
      { $group: { _id: '$operatingSystem', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 8 },
    ]),
    VisitorVisit.aggregate<LocationCountAggregate>([
      {
        $group: {
          _id: { country: '$country', region: '$region', city: '$city' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, '_id.country': 1, '_id.region': 1, '_id.city': 1 } },
      { $limit: 10 },
    ]),
    VisitorVisit.find().sort({ createdAt: -1 }).limit(100).lean<VisitorVisitLean[]>(),
  ]);

  return {
    totalVisits,
    visitsToday,
    visitsLastSevenDays,
    topBrowsers: topBrowsers.map(mapLabelGroup),
    topOperatingSystems: topOperatingSystems.map(mapLabelGroup),
    topLocations: topLocations.map(mapLocationGroup),
    recentVisits: recentVisits.map(mapVisit),
  };
}
