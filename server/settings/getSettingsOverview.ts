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
import { ROLE_NAMES } from '@/server/auth/permissions';
import { DEFAULT_PROPERTY_SETTINGS } from '@/server/settings/defaultPropertySettings';

type SettingsQueryParams = Record<string, string | string[] | undefined>;

function addressLine(settings: Pick<PropertySettingsDocument, 'address'>): string {
  const { address } = settings;
  return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
}

export async function getSettingsOverview(params: SettingsQueryParams): Promise<SettingsOverview> {
  await connectToDatabase();
  const [storedSettings, activeStaffCount, roles, staffUsers] = await Promise.all([
    PropertySettings.findOne({ key: 'property' }).lean<PropertySettingsDocument | null>(),
    User.countDocuments({ active: true }),
    Role.find().select('_id name permissions').lean(),
    User.find().select('_id name email roleId active lastLogin').sort({ name: 1 }).lean(),
  ]);
  const settings = storedSettings ?? DEFAULT_PROPERTY_SETTINGS;
  const sortedRoles = [...roles].sort(
    (left, right) =>
      ROLE_NAMES.findIndex((roleName) => roleName === left.name) -
      ROLE_NAMES.findIndex((roleName) => roleName === right.name),
  );

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
      paypalMeUrl: settings.paypalMeUrl,
    },
    staff: {
      activeStaffCount,
      roleCount: sortedRoles.length,
      roles: sortedRoles.map((role) => ({
        id: role._id.toString(),
        name: role.name,
        permissionCount: role.permissions.length,
        permissions: role.permissions,
      })),
      users: staffUsers.map((user) => {
        const roleId = user.roleId.toString();
        const role = sortedRoles.find((entry) => entry._id.toString() === roleId);

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          roleId,
          roleName: role?.name ?? 'Unassigned',
          active: user.active,
          lastLogin: user.lastLogin?.toISOString() ?? null,
        };
      }),
    },
  };
}
