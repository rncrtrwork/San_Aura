import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Types } from 'mongoose';

import { connectToDatabase } from '@/lib/db';
import {
  buildLegacyImportPreview,
  type LegacyImportPreview,
  type LegacyMemberRecord,
} from '@/lib/legacyImport';
import { ElectricReading } from '@/models/ElectricReading';
import { Member } from '@/models/Member';
import { Payment } from '@/models/Payment';
import { Site } from '@/models/Site';
import { User } from '@/models/User';

type LegacyImportArgs = {
  directory: string;
  dryRun: boolean;
};

type ImportedMemberMap = Map<string, Types.ObjectId>;

function parseArgs(args: string[]): LegacyImportArgs {
  const dryRun = args.includes('--dry-run');
  const directory = args.find((arg) => !arg.startsWith('--')) ?? 'legacy-data';
  return { directory: resolve(directory), dryRun };
}

function readRequiredCsv(directory: string, filename: string): string {
  const filePath = join(directory, filename);
  if (!existsSync(filePath)) {
    throw new Error(`${filename} was not found in ${directory}`);
  }
  return readFileSync(filePath, 'utf8');
}

export function readLegacyImportPreview(directory: string): LegacyImportPreview {
  return buildLegacyImportPreview({
    membersCsv: readRequiredCsv(directory, 'members.csv'),
    paymentsCsv: readRequiredCsv(directory, 'payments.csv'),
    electricReadingsCsv: readRequiredCsv(directory, 'electric-readings.csv'),
  });
}

async function getRecorderId(email: string | undefined): Promise<Types.ObjectId> {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('LEGACY_IMPORT_STAFF_EMAIL is required for non-dry-run imports.');
  }

  const staff = await User.findOne({ email: normalizedEmail, active: true }).select('_id');
  if (!staff) {
    throw new Error(`Active staff user ${normalizedEmail} was not found.`);
  }
  return staff._id;
}

async function siteIdForCode(siteCode: string): Promise<Types.ObjectId | null> {
  if (!siteCode) {
    return null;
  }

  const site = await Site.findOne({ code: siteCode }).select('_id');
  if (!site) {
    throw new Error(`Site ${siteCode} was not found.`);
  }
  return site._id;
}

async function upsertLegacyMember(member: LegacyMemberRecord): Promise<Types.ObjectId> {
  const assignedSiteId = await siteIdForCode(member.assignedSiteCode);
  const existingMember = member.email
    ? await Member.findOne({ email: member.email }).select('+staffNotes')
    : null;

  if (existingMember) {
    existingMember.name = member.name;
    existingMember.phone = member.phone;
    existingMember.address = member.address;
    existingMember.membershipTier = member.membershipTier;
    existingMember.status = member.status;
    existingMember.renewalMonth = member.renewalMonth;
    existingMember.joinDate = member.joinDate;
    existingMember.emergencyContact = member.emergencyContact;
    existingMember.electricBillingMode = member.electricBillingMode;
    existingMember.assignedSiteId = assignedSiteId;
    existingMember.staffNotes = member.staffNotes;
    await existingMember.save();
    return existingMember._id;
  }

  const createdMember = await Member.create({
    name: member.name,
    email: member.email,
    phone: member.phone,
    address: member.address,
    vehicleInfo: [],
    membershipTier: member.membershipTier,
    status: member.status,
    renewalMonth: member.renewalMonth,
    joinDate: member.joinDate,
    emergencyContact: member.emergencyContact,
    electricBillingMode: member.electricBillingMode,
    assignedSiteId,
    partyLinks: [],
    staffNotes: member.staffNotes,
  });
  return createdMember._id;
}

async function importLegacyData(
  preview: LegacyImportPreview,
  recorderId: Types.ObjectId,
): Promise<void> {
  const membersByLegacyId: ImportedMemberMap = new Map();

  for (const member of preview.members) {
    membersByLegacyId.set(member.legacyId, await upsertLegacyMember(member));
  }

  for (const payment of preview.payments) {
    const memberId = membersByLegacyId.get(payment.memberLegacyId);
    if (!memberId) {
      throw new Error(`Payment references missing member ${payment.memberLegacyId}.`);
    }

    await Payment.create({
      reservationRef: null,
      memberRef: memberId,
      amount: payment.amount,
      entryKind: payment.entryKind,
      type: payment.type,
      method: payment.method,
      externalReference: payment.externalReference,
      recordedBy: recorderId,
      date: payment.date,
      appliesToPeriod: payment.appliesToPeriod,
      notes: payment.notes,
    });
  }

  for (const reading of preview.electricReadings) {
    const memberId = membersByLegacyId.get(reading.memberLegacyId);
    if (!memberId) {
      throw new Error(`Electric reading references missing member ${reading.memberLegacyId}.`);
    }

    await ElectricReading.create({
      siteRef: await siteIdForCode(reading.siteCode),
      memberRef: memberId,
      previousReadingRef: null,
      meterValue: reading.meterValue,
      readingDate: reading.readingDate,
      kwhUsed: reading.kwhUsed,
      enteredBy: recorderId,
      billingMode: reading.billingMode,
      resultingCharge: reading.resultingCharge,
    });
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const preview = readLegacyImportPreview(args.directory);

  process.stdout.write(
    `Legacy import preview: ${preview.members.length} members, ${preview.payments.length} payments, ${preview.electricReadings.length} electric readings.\n`,
  );

  if (args.dryRun) {
    process.stdout.write('Dry run complete. No database records were changed.\n');
    return;
  }

  await connectToDatabase();
  await importLegacyData(preview, await getRecorderId(process.env.LEGACY_IMPORT_STAFF_EMAIL));
  process.stdout.write('Legacy import complete.\n');
}

if (require.main === module) {
  main().catch((error: Error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
