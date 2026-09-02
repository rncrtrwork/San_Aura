import {
  ELECTRIC_BILLING_MODES,
  MEMBERSHIP_TIERS,
  MEMBER_STATUSES,
  type ElectricBillingMode,
  type MembershipTier,
  type MemberStatus,
} from '@/lib/memberOptions';
import {
  LEDGER_ENTRY_KINDS,
  PAYMENT_METHODS,
  PAYMENT_TYPES,
  type LedgerEntryKind,
  type PaymentMethod,
  type PaymentType,
} from '@/lib/paymentOptions';

export type CsvRow = Record<string, string>;

export type LegacyMemberRecord = {
  legacyId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipTier: MembershipTier;
  status: MemberStatus;
  renewalMonth: number;
  joinDate: Date;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  } | null;
  electricBillingMode: ElectricBillingMode | null;
  assignedSiteCode: string;
  staffNotes: string;
};

export type LegacyPaymentRecord = {
  memberLegacyId: string;
  amount: number;
  entryKind: LedgerEntryKind;
  type: PaymentType;
  method: PaymentMethod;
  externalReference: string;
  date: Date;
  appliesToPeriod: {
    start: Date;
    end: Date;
  } | null;
  notes: string;
};

export type LegacyElectricReadingRecord = {
  memberLegacyId: string;
  siteCode: string;
  meterValue: number;
  readingDate: Date;
  kwhUsed: number;
  billingMode: ElectricBillingMode;
  resultingCharge: number;
};

export type LegacyImportPreview = {
  members: LegacyMemberRecord[];
  payments: LegacyPaymentRecord[];
  electricReadings: LegacyElectricReadingRecord[];
};

type CsvCellParseResult = {
  value: string;
  nextIndex: number;
};

function parseCsvCell(line: string, startIndex: number): CsvCellParseResult {
  if (line[startIndex] !== '"') {
    const nextComma = line.indexOf(',', startIndex);
    const endIndex = nextComma === -1 ? line.length : nextComma;
    return { value: line.slice(startIndex, endIndex).trim(), nextIndex: endIndex + 1 };
  }

  let index = startIndex + 1;
  let value = '';
  while (index < line.length) {
    const character = line[index];
    const nextCharacter = line[index + 1];
    if (character === '"' && nextCharacter === '"') {
      value += '"';
      index += 2;
    } else if (character === '"') {
      return { value, nextIndex: index + 2 };
    } else {
      value += character;
      index += 1;
    }
  }

  return { value, nextIndex: line.length + 1 };
}

export function parseCsvRows(content: string): CsvRow[] {
  const lines = content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return headers.reduce<CsvRow>((row, header, index) => {
      row[header] = cells[index]?.trim() ?? '';
      return row;
    }, {});
  });
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let index = 0;
  while (index <= line.length) {
    const parsed = parseCsvCell(line, index);
    cells.push(parsed.value);
    index = parsed.nextIndex;
    if (index > line.length) {
      break;
    }
  }
  return cells;
}

function requiredText(row: CsvRow, field: string, label: string): string {
  const value = row[field]?.trim();
  if (!value) {
    throw new Error(`${label} is required.`);
  }
  return value;
}

function optionalText(row: CsvRow, field: string): string {
  return row[field]?.trim() ?? '';
}

function requiredDate(row: CsvRow, field: string, label: string): Date {
  const value = requiredText(row, field, label);
  const date = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} must be a valid date.`);
  }
  return date;
}

function optionalDate(row: CsvRow, field: string, label: string): Date | null {
  const value = optionalText(row, field);
  if (!value) {
    return null;
  }
  const date = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} must be a valid date.`);
  }
  return date;
}

function requiredNumber(row: CsvRow, field: string, label: string): number {
  const value = Number(requiredText(row, field, label));
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be numeric.`);
  }
  return value;
}

function optionalNumber(row: CsvRow, field: string): number | null {
  const rawValue = optionalText(row, field);
  if (!rawValue) {
    return null;
  }
  const value = Number(rawValue);
  return Number.isFinite(value) ? value : null;
}

function isMembershipTier(value: string): value is MembershipTier {
  return MEMBERSHIP_TIERS.some((entry) => entry === value);
}

function isMemberStatus(value: string): value is MemberStatus {
  return MEMBER_STATUSES.some((entry) => entry === value);
}

function isElectricBillingMode(value: string): value is ElectricBillingMode {
  return ELECTRIC_BILLING_MODES.some((entry) => entry === value);
}

function isLedgerEntryKind(value: string): value is LedgerEntryKind {
  return LEDGER_ENTRY_KINDS.some((entry) => entry === value);
}

function isPaymentType(value: string): value is PaymentType {
  return PAYMENT_TYPES.some((entry) => entry === value);
}

function isPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHODS.some((entry) => entry === value);
}

function membershipTier(value: string): MembershipTier {
  const tier = value.trim();
  if (isMembershipTier(tier)) {
    return tier;
  }
  throw new Error(`Membership tier ${tier} is not supported.`);
}

function memberStatus(value: string): MemberStatus {
  const status = value.trim().toLowerCase();
  if (isMemberStatus(status)) {
    return status;
  }
  throw new Error(`Member status ${value} is not supported.`);
}

function electricBillingMode(value: string): ElectricBillingMode | null {
  const mode = value.trim().toLowerCase();
  if (!mode) {
    return null;
  }
  if (isElectricBillingMode(mode)) {
    return mode;
  }
  throw new Error(`Electric billing mode ${value} is not supported.`);
}

function requiredElectricBillingMode(value: string): ElectricBillingMode {
  const mode = electricBillingMode(value);
  if (!mode) {
    throw new Error('Electric billing mode is required.');
  }
  return mode;
}

function ledgerEntryKind(value: string): LedgerEntryKind {
  const kind = value.trim().toLowerCase();
  if (isLedgerEntryKind(kind)) {
    return kind;
  }
  throw new Error(`Ledger entry kind ${value} is not supported.`);
}

function paymentType(value: string): PaymentType {
  const type = value.trim().toLowerCase();
  if (isPaymentType(type)) {
    return type;
  }
  throw new Error(`Payment type ${value} is not supported.`);
}

function paymentMethod(value: string): PaymentMethod {
  const method = value.trim().toLowerCase();
  if (isPaymentMethod(method)) {
    return method;
  }
  throw new Error(`Payment method ${value} is not supported.`);
}

export function normalizeLegacyMembers(rows: CsvRow[]): LegacyMemberRecord[] {
  return rows.map((row) => {
    const emergencyContactName = optionalText(row, 'emergencyContactName');
    const emergencyContactPhone = optionalText(row, 'emergencyContactPhone');
    return {
      legacyId: requiredText(row, 'legacyId', 'Member legacy ID'),
      name: requiredText(row, 'name', 'Member name'),
      email: optionalText(row, 'email').toLowerCase(),
      phone: requiredText(row, 'phone', 'Member phone'),
      address: optionalText(row, 'address'),
      membershipTier: membershipTier(requiredText(row, 'membershipTier', 'Membership tier')),
      status: memberStatus(optionalText(row, 'status') || 'active'),
      renewalMonth: Math.min(
        12,
        Math.max(1, Math.round(requiredNumber(row, 'renewalMonth', 'Renewal month'))),
      ),
      joinDate: requiredDate(row, 'joinDate', 'Join date'),
      emergencyContact:
        emergencyContactName && emergencyContactPhone
          ? {
              name: emergencyContactName,
              relationship: optionalText(row, 'emergencyContactRelationship'),
              phone: emergencyContactPhone,
            }
          : null,
      electricBillingMode: electricBillingMode(optionalText(row, 'electricBillingMode')),
      assignedSiteCode: optionalText(row, 'assignedSiteCode'),
      staffNotes: optionalText(row, 'staffNotes'),
    };
  });
}

export function normalizeLegacyPayments(rows: CsvRow[]): LegacyPaymentRecord[] {
  return rows.map((row) => {
    const periodStart = optionalDate(row, 'appliesToStart', 'Payment period start');
    const periodEnd = optionalDate(row, 'appliesToEnd', 'Payment period end');
    if ((periodStart && !periodEnd) || (!periodStart && periodEnd)) {
      throw new Error('Payment period start and end must be supplied together.');
    }
    if (periodStart && periodEnd && periodEnd < periodStart) {
      throw new Error('Payment period end must be on or after start.');
    }

    return {
      memberLegacyId: requiredText(row, 'memberLegacyId', 'Payment member legacy ID'),
      amount: requiredNumber(row, 'amount', 'Payment amount'),
      entryKind: ledgerEntryKind(optionalText(row, 'entryKind') || 'payment'),
      type: paymentType(requiredText(row, 'type', 'Payment type')),
      method: paymentMethod(optionalText(row, 'method') || 'manual-adjustment'),
      externalReference: optionalText(row, 'externalReference'),
      date: requiredDate(row, 'date', 'Payment date'),
      appliesToPeriod:
        periodStart && periodEnd
          ? {
              start: periodStart,
              end: periodEnd,
            }
          : null,
      notes: optionalText(row, 'notes'),
    };
  });
}

export function normalizeLegacyElectricReadings(rows: CsvRow[]): LegacyElectricReadingRecord[] {
  return rows.map((row) => {
    const providedKwhUsed = optionalNumber(row, 'kwhUsed');
    return {
      memberLegacyId: requiredText(row, 'memberLegacyId', 'Electric member legacy ID'),
      siteCode: optionalText(row, 'siteCode'),
      meterValue: requiredNumber(row, 'meterValue', 'Meter value'),
      readingDate: requiredDate(row, 'readingDate', 'Reading date'),
      kwhUsed: providedKwhUsed ?? 0,
      billingMode: requiredElectricBillingMode(requiredText(row, 'billingMode', 'Billing mode')),
      resultingCharge: optionalNumber(row, 'resultingCharge') ?? 0,
    };
  });
}

export function buildLegacyImportPreview(files: {
  membersCsv: string;
  paymentsCsv: string;
  electricReadingsCsv: string;
}): LegacyImportPreview {
  return {
    members: normalizeLegacyMembers(parseCsvRows(files.membersCsv)),
    payments: normalizeLegacyPayments(parseCsvRows(files.paymentsCsv)),
    electricReadings: normalizeLegacyElectricReadings(parseCsvRows(files.electricReadingsCsv)),
  };
}
