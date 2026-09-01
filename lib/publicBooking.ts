import type { SiteType } from '@/models/Site';

export type PublicBookingStayType = {
  id: string;
  name: string;
  siteType: SiteType;
  minimumStay: number;
  baseRate: number;
  weekendRate: number;
  extraGuestFee: number;
  cleaningFee: number;
};

export type PublicBookingSite = {
  id: string;
  code: string;
  area: string;
  type: SiteType;
};

export type PublicBookingAvailabilityQuery = {
  checkIn: string;
  checkOut: string;
  siteType: string;
};

export type PublicBookingAvailabilityResponse = {
  sites?: PublicBookingSite[];
  message?: string;
};

export type PublicBookingRequest = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  stayTypeId: string;
  siteId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
};

export type PublicBookingResponse = {
  id?: string;
  totalAmount?: number;
  message?: string;
};

type DateRangeValidation =
  | { valid: true; checkIn: Date; checkOut: Date; nights: number }
  | { valid: false; message: string };

export type PublicBookingRequestValidation =
  | {
      valid: true;
      data: PublicBookingRequest & { checkInDate: Date; checkOutDate: Date; nights: number };
    }
  | { valid: false; message: string };

export type PublicBookingAvailabilityValidation =
  | { valid: true; data: { checkIn: Date; checkOut: Date; siteType: SiteType } }
  | { valid: false; message: string };

function parseBookingDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateDateRange(checkInValue: string, checkOutValue: string): DateRangeValidation {
  const checkIn = parseBookingDate(checkInValue);
  const checkOut = parseBookingDate(checkOutValue);
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return { valid: false, message: 'Choose a valid check-in and check-out date.' };
  }

  return {
    valid: true,
    checkIn,
    checkOut,
    nights: Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000),
  };
}

function validSiteType(value: string): value is SiteType {
  return value === 'cabin' || value === 'rv' || value === 'tent';
}

function isText(value: string, maxLength: number): boolean {
  return value.trim().length > 0 && value.length <= maxLength;
}

function isEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value) && value.length <= 254;
}

export function validatePublicBookingAvailability(
  query: PublicBookingAvailabilityQuery,
): PublicBookingAvailabilityValidation {
  const dateRange = validateDateRange(query.checkIn, query.checkOut);
  if (!dateRange.valid) return dateRange;
  if (!validSiteType(query.siteType)) {
    return { valid: false, message: 'Choose cabin, RV, or tent availability.' };
  }

  return {
    valid: true,
    data: {
      checkIn: dateRange.checkIn,
      checkOut: dateRange.checkOut,
      siteType: query.siteType,
    },
  };
}

export function validatePublicBookingRequest(
  request: PublicBookingRequest,
): PublicBookingRequestValidation {
  if (
    !request ||
    !isText(request.guestName, 120) ||
    !isEmail(request.guestEmail) ||
    !isText(request.guestPhone, 30) ||
    !isText(request.stayTypeId, 80) ||
    !isText(request.siteId, 80) ||
    !Number.isInteger(request.guestsCount) ||
    request.guestsCount < 1 ||
    request.guestsCount > 100
  ) {
    return { valid: false, message: 'Complete all required booking request fields.' };
  }

  const dateRange = validateDateRange(request.checkIn, request.checkOut);
  if (!dateRange.valid) return dateRange;

  return {
    valid: true,
    data: {
      ...request,
      guestName: request.guestName.trim(),
      guestEmail: request.guestEmail.trim().toLowerCase(),
      guestPhone: request.guestPhone.trim(),
      stayTypeId: request.stayTypeId.trim(),
      siteId: request.siteId.trim(),
      checkInDate: dateRange.checkIn,
      checkOutDate: dateRange.checkOut,
      nights: dateRange.nights,
    },
  };
}

export function calculatePublicReservationTotal(
  checkIn: Date,
  checkOut: Date,
  guestsCount: number,
  rates: { baseRate: number; weekendRate: number; extraGuestFee: number; cleaningFee: number },
): number {
  let total = rates.cleaningFee;
  const cursor = new Date(checkIn);

  while (cursor < checkOut) {
    const day = cursor.getDay();
    total += day === 5 || day === 6 ? rates.weekendRate : rates.baseRate;
    total += Math.max(0, guestsCount - 2) * rates.extraGuestFee;
    cursor.setDate(cursor.getDate() + 1);
  }

  return Math.round(total * 100) / 100;
}
