export type ElectricReadingCreateRequest = {
  siteId: string;
  meterValue: number;
  readingDate: string;
};

export type ElectricReadingCreateResponse = {
  id?: string;
  chargeId?: string;
  kwhUsed?: number;
  resultingCharge?: number;
  prepaidApplied?: number;
  newDueAmount?: number;
  balanceAfterCharge?: number;
  message?: string;
};

export function computeKwhDelta(currentMeterValue: number, priorMeterValue: number | null): number {
  if (priorMeterValue === null) return 0;
  return Number((currentMeterValue - priorMeterValue).toFixed(3));
}

export function validateElectricReadingRequest(
  body: Partial<ElectricReadingCreateRequest> | null,
): ElectricReadingCreateRequest | string {
  if (
    !body ||
    typeof body.siteId !== 'string' ||
    typeof body.meterValue !== 'number' ||
    typeof body.readingDate !== 'string'
  ) {
    return 'Meter reading details are incomplete or malformed.';
  }

  if (!Number.isFinite(body.meterValue) || body.meterValue < 0 || body.meterValue > 10_000_000) {
    return 'Enter a valid meter value.';
  }

  if (Number.isNaN(Date.parse(body.readingDate))) {
    return 'Enter a valid reading date.';
  }

  return {
    siteId: body.siteId.trim(),
    meterValue: body.meterValue,
    readingDate: body.readingDate,
  };
}
