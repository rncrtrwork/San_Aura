import { connectToDatabase } from '@/lib/db';
import {
  enabledNotificationCount,
  NOTIFICATION_SETTING_DEFINITIONS,
  parseSettingsTab,
  type SettingsOverview,
} from '@/lib/settingsManager';
import { PropertySettings, type PropertySettingsDocument } from '@/models/PropertySettings';
import { Role } from '@/models/Role';
import { User } from '@/models/User';
import { DEFAULT_PROPERTY_SETTINGS } from '@/server/settings/defaultPropertySettings';

type SettingsQueryParams = Record<string, string | string[] | undefined>;

function addressLine(settings: Pick<PropertySettingsDocument, 'address'>): string {
  const { address } = settings;
  return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
}

export async function getSettingsOverview(params: SettingsQueryParams): Promise<SettingsOverview> {
  await connectToDatabase();
  const [storedSettings, activeStaffCount, roleCount] = await Promise.all([
    PropertySettings.findOne({ key: 'property' }).lean<PropertySettingsDocument | null>(),
    User.countDocuments({ active: true }),
    Role.countDocuments(),
  ]);
  const settings = storedSettings ?? DEFAULT_PROPERTY_SETTINGS;

  return {
    activeTab: parseSettingsTab(params.tab),
    property: {
      resortName: settings.resortName,
      logoUrl: settings.logoUrl,
      logoPublicId: settings.logoPublicId,
      email: settings.email,
      phone: settings.phone,
      timezone: settings.timezone,
      address: {
        street: settings.address.street,
        city: settings.address.city,
        state: settings.address.state,
        postalCode: settings.address.postalCode,
        country: settings.address.country,
      },
      addressLine: addressLine(settings),
      logoConfigured: Boolean(settings.logoUrl),
    },
    booking: {
      checkInTime: settings.checkInTime,
      checkOutTime: settings.checkOutTime,
      keyReturnTime: settings.keyReturnTime,
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
      enabledCount: enabledNotificationCount(settings.notifications),
      totalCount: NOTIFICATION_SETTING_DEFINITIONS.length,
      values: {
        newReservation: settings.notifications.newReservation,
        cancellation: settings.notifications.cancellation,
        paymentRecorded: settings.notifications.paymentRecorded,
        arrivalReminder: settings.notifications.arrivalReminder,
      },
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
