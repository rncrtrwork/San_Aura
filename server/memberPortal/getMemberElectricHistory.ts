import { Types } from 'mongoose';
import type { ElectricBillingMode } from '@/models/Member';
import { connectToDatabase } from '@/lib/db';
import { ElectricReading } from '@/models/ElectricReading';
import { Payment } from '@/models/Payment';
import { Site } from '@/models/Site';

export type MemberElectricReadingItem = {
  id: string;
  siteCode: string;
  meterValue: number;
  readingDate: string;
  kwhUsed: number;
  billingMode: ElectricBillingMode;
  resultingCharge: number;
};

export type MemberElectricChargeItem = {
  id: string;
  amount: number;
  date: string;
  periodStart: string | null;
  periodEnd: string | null;
};

export type MemberElectricHistory = {
  readings: MemberElectricReadingItem[];
  charges: MemberElectricChargeItem[];
};

type ElectricReadingLean = {
  _id: Types.ObjectId;
  siteRef: Types.ObjectId | null;
  meterValue: number;
  readingDate: Date;
  kwhUsed: number;
  billingMode: ElectricBillingMode;
  resultingCharge: number;
};

type ElectricChargeLean = {
  _id: Types.ObjectId;
  amount: number;
  date: Date;
  appliesToPeriod?: { start: Date; end: Date } | null;
};

type SiteCodeLean = {
  _id: Types.ObjectId;
  code: string;
};

export async function getMemberElectricHistory(memberId: string): Promise<MemberElectricHistory> {
  if (!Types.ObjectId.isValid(memberId)) {
    return { readings: [], charges: [] };
  }

  await connectToDatabase();
  const [readings, charges] = await Promise.all([
    ElectricReading.find({ memberRef: memberId })
      .select('siteRef meterValue readingDate kwhUsed billingMode resultingCharge')
      .sort({ readingDate: -1, createdAt: -1 })
      .limit(100)
      .lean<ElectricReadingLean[]>(),
    Payment.find({ memberRef: memberId, type: 'electric' })
      .select('amount date appliesToPeriod')
      .sort({ date: -1, createdAt: -1 })
      .limit(100)
      .lean<ElectricChargeLean[]>(),
  ]);
  const siteIds = readings
    .map((reading) => reading.siteRef)
    .filter((siteId): siteId is Types.ObjectId => Boolean(siteId));
  const sites = siteIds.length
    ? await Site.find({ _id: { $in: siteIds } })
        .select('code')
        .lean<SiteCodeLean[]>()
    : [];
  const siteCodes = new Map(sites.map((site) => [site._id.toString(), site.code]));

  return {
    readings: readings.map((reading) => ({
      id: reading._id.toString(),
      siteCode: reading.siteRef
        ? (siteCodes.get(reading.siteRef.toString()) ?? 'Site unavailable')
        : 'Member account',
      meterValue: reading.meterValue,
      readingDate: reading.readingDate.toISOString(),
      kwhUsed: reading.kwhUsed,
      billingMode: reading.billingMode,
      resultingCharge: reading.resultingCharge,
    })),
    charges: charges.map((charge) => ({
      id: charge._id.toString(),
      amount: charge.amount,
      date: charge.date.toISOString(),
      periodStart: charge.appliesToPeriod?.start.toISOString() ?? null,
      periodEnd: charge.appliesToPeriod?.end.toISOString() ?? null,
    })),
  };
}
