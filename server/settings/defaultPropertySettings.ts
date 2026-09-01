import type { PropertySettingsDocument } from '@/models/PropertySettings';

export const DEFAULT_PROPERTY_SETTINGS: Omit<PropertySettingsDocument, 'createdAt' | 'updatedAt'> =
  {
    key: 'property',
    resortName: 'Sun Aura Resort',
    logoUrl: '',
    logoPublicId: '',
    address: {
      street: '3449 East State Road 10',
      city: 'Lake Village',
      state: 'Indiana',
      postalCode: '46349',
      country: 'United States',
    },
    phone: '219-345-2000',
    email: 'sunauraresort@outlook.com',
    timezone: 'America/Chicago',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    keyReturnTime: '11:00',
    cancellationWindowDays: 7,
    depositRequirementPercent: 25,
    minimumAge: 21,
    defaultMinimumStay: 1,
    openYearRound: true,
    taxRatePercent: 0,
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    privacy: {
      photographyProhibited: true,
      videoProhibited: true,
      showPrivacyNoticeAtBooking: true,
    },
    notifications: {
      newReservation: true,
      cancellation: true,
      paymentRecorded: true,
      arrivalReminder: true,
    },
    paypalMeUrl: '',
  };
