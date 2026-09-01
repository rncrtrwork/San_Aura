import type { ReservationStatus } from '@/models/Reservation';
import type { SiteStatus, SiteType } from '@/models/Site';

export type LoadProfileSite = {
  id: string;
  type: SiteType;
  status: SiteStatus;
};

export type LoadProfileReservation = {
  id: string;
  siteId: string;
  checkIn: Date;
  checkOut: Date;
  status: ReservationStatus;
};

export type LoadProfileBlock = {
  id: string;
  siteId: string;
  startDate: Date;
  endDate: Date;
};

export type CalendarMapLoadFixtures = {
  sites: LoadProfileSite[];
  reservations: LoadProfileReservation[];
  blocks: LoadProfileBlock[];
  rangeStart: Date;
  rangeEnd: Date;
};

export type CalendarMapLoadSummary = {
  siteCount: number;
  activeReservationCount: number;
  blockedSiteCount: number;
  availableSiteCount: number;
  mapStatusCounts: Record<SiteStatus, number>;
};

const siteTypes: SiteType[] = ['cabin', 'rv', 'tent'];
const siteStatuses: SiteStatus[] = ['available', 'occupied', 'maintenance', 'blocked'];

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function buildCalendarMapLoadFixtures(
  siteCount = 187,
  seasonDays = 180,
): CalendarMapLoadFixtures {
  const rangeStart = new Date('2026-05-01T12:00:00.000Z');
  const rangeEnd = addDays(rangeStart, seasonDays);
  const sites = Array.from({ length: siteCount }, (_, index): LoadProfileSite => {
    const type = siteTypes[index % siteTypes.length];
    const status = siteStatuses[index % siteStatuses.length];
    return {
      id: `site-${index + 1}`,
      type,
      status,
    };
  });
  const reservations = sites.flatMap((site, siteIndex): LoadProfileReservation[] =>
    Array.from({ length: 3 }, (_, reservationIndex) => {
      const checkIn = addDays(rangeStart, (siteIndex + reservationIndex * 19) % seasonDays);
      return {
        id: `reservation-${siteIndex + 1}-${reservationIndex + 1}`,
        siteId: site.id,
        checkIn,
        checkOut: addDays(checkIn, 3 + (siteIndex % 4)),
        status: reservationIndex === 2 && siteIndex % 11 === 0 ? 'cancelled' : 'confirmed',
      };
    }),
  );
  const blocks = sites
    .filter((site, index) => site.status === 'maintenance' || index % 23 === 0)
    .map((site, index): LoadProfileBlock => {
      const startDate = addDays(rangeStart, index % 60);
      return {
        id: `block-${site.id}`,
        siteId: site.id,
        startDate,
        endDate: addDays(startDate, 5),
      };
    });

  return { sites, reservations, blocks, rangeStart, rangeEnd };
}

export function summarizeCalendarMapLoad(
  fixtures: CalendarMapLoadFixtures,
): CalendarMapLoadSummary {
  const activeReservations = fixtures.reservations.filter(
    (reservation) =>
      reservation.checkIn < fixtures.rangeEnd &&
      reservation.checkOut > fixtures.rangeStart &&
      reservation.status !== 'cancelled',
  );
  const reservedSiteIds = new Set(activeReservations.map((reservation) => reservation.siteId));
  const blockedSiteIds = new Set(
    fixtures.blocks
      .filter((block) => block.startDate < fixtures.rangeEnd && block.endDate > fixtures.rangeStart)
      .map((block) => block.siteId),
  );
  const mapStatusCounts = fixtures.sites.reduce<Record<SiteStatus, number>>(
    (counts, site) => ({
      ...counts,
      [site.status]: counts[site.status] + 1,
    }),
    { available: 0, occupied: 0, maintenance: 0, blocked: 0 },
  );
  const availableSiteCount = fixtures.sites.filter(
    (site) =>
      site.status !== 'maintenance' &&
      site.status !== 'blocked' &&
      !reservedSiteIds.has(site.id) &&
      !blockedSiteIds.has(site.id),
  ).length;

  return {
    siteCount: fixtures.sites.length,
    activeReservationCount: activeReservations.length,
    blockedSiteCount: blockedSiteIds.size,
    availableSiteCount,
    mapStatusCounts,
  };
}
