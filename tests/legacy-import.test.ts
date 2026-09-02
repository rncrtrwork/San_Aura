import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildLegacyImportPreview,
  normalizeLegacyElectricReadings,
  normalizeLegacyMembers,
  normalizeLegacyPayments,
  parseCsvRows,
} from '@/lib/legacyImport';

test('legacy CSV parser handles quoted values exported from Excel', () => {
  const rows = parseCsvRows('legacyId,name,notes\nM-1,"River, Cabin","Paid ""ahead"""');

  assert.deepEqual(rows, [
    {
      legacyId: 'M-1',
      name: 'River, Cabin',
      notes: 'Paid "ahead"',
    },
  ]);
});

test('legacy member, payment, and electric rows normalize to typed records', () => {
  const members = normalizeLegacyMembers(
    parseCsvRows(
      [
        'legacyId,name,email,phone,address,membershipTier,status,renewalMonth,joinDate,emergencyContactName,emergencyContactRelationship,emergencyContactPhone,electricBillingMode,assignedSiteCode,staffNotes',
        'M-1,Maureen Guest,maureen@example.com,219-555-0100,Lot 1,2850,active,5,2024-05-01,Pat Guest,Spouse,219-555-0101,flat25,RV 101,Founding member',
      ].join('\n'),
    ),
  );
  const payments = normalizeLegacyPayments(
    parseCsvRows(
      [
        'memberLegacyId,amount,entryKind,type,method,date,externalReference,appliesToStart,appliesToEnd,notes',
        'M-1,250,payment,dues,check,2026-05-15,CHK-1,2026-05-01,2026-05-31,May dues',
      ].join('\n'),
    ),
  );
  const readings = normalizeLegacyElectricReadings(
    parseCsvRows(
      [
        'memberLegacyId,siteCode,meterValue,readingDate,kwhUsed,billingMode,resultingCharge',
        'M-1,RV 101,1540.25,2026-05-31,40.25,kwh,10.06',
      ].join('\n'),
    ),
  );

  assert.equal(members[0].membershipTier, '2850');
  assert.equal(members[0].emergencyContact?.name, 'Pat Guest');
  assert.equal(payments[0].appliesToPeriod?.start.toISOString(), '2026-05-01T12:00:00.000Z');
  assert.equal(readings[0].resultingCharge, 10.06);
});

test('legacy import preview rejects unsupported values before database writes', () => {
  assert.throws(
    () =>
      buildLegacyImportPreview({
        membersCsv:
          'legacyId,name,email,phone,membershipTier,status,renewalMonth,joinDate\nM-1,Guest,,219-555-0100,9000,active,5,2026-05-01',
        paymentsCsv: 'memberLegacyId,amount,type,date\n',
        electricReadingsCsv: 'memberLegacyId,meterValue,readingDate,billingMode\n',
      }),
    /Membership tier 9000 is not supported/,
  );
});
