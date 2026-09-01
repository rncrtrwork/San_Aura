import { connectToDatabase } from '@/lib/db';
import { parseSettingsTab, type SettingsOverview } from '@/lib/settingsManager';
import { PropertySettings, type PropertySettingsDocument } from '@/models/PropertySettings';
import { Role } from '@/models/Role';
import { User } from '@/models/User';

type SettingsQueryParams = Record<string, string | string[] | undefined>;

const fallbackSettings: Omit<PropertySettingsDocument, 'createdAt' | 'updatedAt'> = {
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

function addressLine(settings: Pick<PropertySettingsDocument, 'address'>): string {
  const { address } = settings;
  return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
}

function enabledNotificationCount(
  settings: Pick<PropertySettingsDocument, 'notifications'>,
): number {
  return Object.values(settings.notifications).filter(Boolean).length;
}

export async function getSettingsOverview(params: SettingsQueryParams): Promise<SettingsOverview> {
  await connectToDatabase();
  const [storedSettings, activeStaffCount, roleCount] = await Promise.all([
    PropertySettings.findOne({ key: 'property' }).lean<PropertySettingsDocument | null>(),
    User.countDocuments({ active: true }),
    Role.countDocuments(),
  ]);
  const settings = storedSettings ?? fallbackSettings;

  return {
    activeTab: parseSettingsTab(params.tab),
    property: {
      resortName: settings.resortName,
      email: settings.email,
      phone: settings.phone,
      timezone: settings.timezone,
      addressLine: addressLine(settings),
      logoConfigured: Boolean(settings.logoUrl),
    },
    booking: {
      checkInTime: settings.checkInTime,
      checkOutTime: settings.checkOutTime,
      cancellationWindowDays: settings.cancellationWindowDays,
      depositRequirementPercent: settings.depositRequirementPercent,
      minimumAge: settings.minimumAge,
      defaultMinimumStay: settings.defaultMinimumStay,
    },
    operating: {
      openYearRound: settings.openYearRound,
      taxRatePercent: settings.taxRatePercent,
      currency: settings.currency,
      dateFormat: settings.dateFormat,
    },
    privacy: {
      photographyProhibited: settings.privacy.photographyProhibited,
      videoProhibited: settings.privacy.videoProhibited,
      showPrivacyNoticeAtBooking: settings.privacy.showPrivacyNoticeAtBooking,
    },
    notifications: {
      enabledCount: enabledNotificationCount(settings),
      totalCount: Object.keys(settings.notifications).length,
    },
    payments: {
      paypalMeConfigured: Boolean(settings.paypalMeUrl),
    },
    staff: {
      activeStaffCount,
      roleCount,
    },
  };
}
