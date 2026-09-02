# Legacy data migration

This runbook closes the Phase 14 one-time Excel migration item. The importer expects the client's Excel workbook sheets to be exported as CSV files and placed in a local `legacy-data/` folder that is not committed.

## Files

Create these files from the workbook:

- `legacy-data/members.csv`
- `legacy-data/payments.csv`
- `legacy-data/electric-readings.csv`

## Members columns

```txt
legacyId,name,email,phone,address,membershipTier,status,renewalMonth,joinDate,emergencyContactName,emergencyContactRelationship,emergencyContactPhone,electricBillingMode,assignedSiteCode,staffNotes
```

Supported membership tiers are `2850`, `2000`, `1250`, and `500`. Supported statuses are `active`, `probationary`, `hiatus`, and `inactive`.

## Payments columns

```txt
memberLegacyId,amount,entryKind,type,method,date,externalReference,appliesToStart,appliesToEnd,notes
```

Supported payment types are `dues`, `electric`, `day-fee`, `cabin`, `rv`, and `addon`. Supported methods are `cash`, `check`, `paypal-external`, and `manual-adjustment`.

## Electric readings columns

```txt
memberLegacyId,siteCode,meterValue,readingDate,kwhUsed,billingMode,resultingCharge
```

Supported billing modes are `flat25`, `flat15`, `kwh`, and `weekly`.

## Dry run

Run the parser before touching the production database:

```bash
npm run import:legacy -- legacy-data --dry-run
```

The dry run validates file presence, required fields, dates, membership tiers, payment values, and billing modes.

## Import

Set the staff account that should be recorded as the importer, then run the command without `--dry-run`:

```bash
LEGACY_IMPORT_STAFF_EMAIL=owner@sunauraresort.net npm run import:legacy -- legacy-data
```

The importer:

- upserts members by email when an email exists;
- imports payments as member ledger entries;
- imports electric readings with the supplied billing snapshot;
- resolves assigned sites and electric reading sites by site code.

Run this once after Atlas backups are enabled and before staff soft-launch testing begins.
