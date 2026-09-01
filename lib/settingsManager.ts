import { PERMISSIONS, type Permission } from '@/server/auth/permissions';

export const SETTINGS_TABS = [
  'property',
  'booking',
  'payments',
  'notifications',
  'staff-roles',
  'integrations',
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

export type SettingsTabDefinition = {
  id: SettingsTab;
  label: string;
  description: string;
};

export type PermissionGroup = {
  label: string;
  permissions: Permission[];
};

export const PERMISSION_GROUPS: readonly PermissionGroup[] = [
  { label: 'Dashboard', permissions: ['dashboard.read'] },
  { label: 'Members', permissions: ['members.read', 'members.write'] },
  {
    label: 'Reservations',
    permissions: ['reservations.read', 'reservations.write'],
  },
  { label: 'Payments', permissions: ['payments.read', 'payments.write'] },
  { label: 'Sites', permissions: ['sites.read', 'sites.write'] },
  { label: 'Events', permissions: ['events.read', 'events.write'] },
  { label: 'Media', permissions: ['media.read', 'media.write'] },
  { label: 'Content', permissions: ['content.read', 'content.write'] },
  { label: 'Settings', permissions: ['settings.read', 'settings.write'] },
  { label: 'Staff', permissions: ['staff.read', 'staff.write'] },
  { label: 'Activity', permissions: ['activity.read'] },
] as const;

export type NotificationSettingKey =
  | 'newReservation'
  | 'cancellation'
  | 'paymentRecorded'
  | 'arrivalReminder';

export type NotificationSettingDefinition = {
  key: NotificationSettingKey;
  label: string;
  description: string;
};

export const SETTINGS_TAB_DEFINITIONS: readonly SettingsTabDefinition[] = [
  {
    id: 'property',
    label: 'Property',
    description: 'Resort identity, address, logo, timezone, and contact details.',
  },
  {
    id: 'booking',
    label: 'Booking',
    description: 'Check-in rules, deposits, age minimums, and default stay settings.',
  },
  {
    id: 'payments',
    label: 'Payments',
    description: 'MVP payment instructions and PayPal-link-only configuration.',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Staff alerts for reservations, cancellations, payments, and arrivals.',
  },
  {
    id: 'staff-roles',
    label: 'Staff & Roles',
    description: 'Staff access, role permissions, invites, and deactivation workflows.',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'External services and future connection readiness.',
  },
] as const;

export const NOTIFICATION_SETTING_DEFINITIONS: readonly NotificationSettingDefinition[] = [
  {
    key: 'newReservation',
    label: 'New Reservation',
    description: 'Alert staff when a reservation request or booking is created.',
  },
  {
    key: 'cancellation',
    label: 'Cancellation',
    description: 'Alert staff when a reservation is cancelled.',
  },
  {
    key: 'paymentRecorded',
    label: 'Payment Recorded',
    description: 'MVP-safe replacement for payment-failed alerts until payment processing exists.',
  },
  {
    key: 'arrivalReminder',
    label: 'Arrival Reminder',
    description: 'Remind staff about upcoming arrivals and check-in preparation.',
  },
] as const;

export type NotificationSettingsMutationRequest = Record<NotificationSettingKey, boolean>;

export type SettingsOverview = {
  activeTab: SettingsTab;
  property: {
    resortName: string;
    logoUrl: string;
    logoPublicId: string;
    email: string;
    phone: string;
    timezone: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    addressLine: string;
    logoConfigured: boolean;
  };
  booking: {
    checkInTime: string;
    checkOutTime: string;
    keyReturnTime: string;
    cancellationWindowDays: number;
    depositRequirementPercent: number;
    minimumAge: number;
    defaultMinimumStay: number;
  };
  operating: {
    openYearRound: boolean;
    taxRatePercent: number;
    currency: string;
    dateFormat: string;
  };
  privacy: {
    photographyProhibited: boolean;
    videoProhibited: boolean;
    showPrivacyNoticeAtBooking: boolean;
  };
  notifications: {
    enabledCount: number;
    totalCount: number;
    values: NotificationSettingsMutationRequest;
  };
  payments: {
    paypalMeConfigured: boolean;
    paypalMeUrl: string;
  };
  staff: {
    activeStaffCount: number;
    roleCount: number;
    roles: {
      id: string;
      name: string;
      permissionCount: number;
      permissions: Permission[];
    }[];
    users: {
      id: string;
      name: string;
      email: string;
      roleId: string;
      roleName: string;
      active: boolean;
      lastLogin: string | null;
    }[];
  };
};

export type PropertySettingsMutationRequest = {
  resortName: string;
  logoUrl: string;
  logoPublicId: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  timezone: string;
  checkInTime: string;
  checkOutTime: string;
  keyReturnTime: string;
};

export type PropertySettingsMutationResponse = {
  message?: string;
  property?: SettingsOverview['property'] & SettingsOverview['booking'];
};

export type OperatingSettingsMutationRequest = {
  openYearRound: boolean;
  taxRatePercent: number;
  currency: string;
  dateFormat: string;
};

export type OperatingSettingsMutationResponse = {
  message?: string;
  operating?: SettingsOverview['operating'];
};

export type BookingSettingsMutationRequest = {
  cancellationWindowDays: number;
  depositRequirementPercent: number;
  minimumAge: number;
  defaultMinimumStay: number;
};

export type BookingSettingsMutationResponse = {
  message?: string;
  booking?: SettingsOverview['booking'];
};

export type PrivacySettingsMutationRequest = SettingsOverview['privacy'];

export type PrivacySettingsMutationResponse = {
  message?: string;
  privacy?: SettingsOverview['privacy'];
};

export type NotificationSettingsMutationResponse = {
  message?: string;
  notifications?: SettingsOverview['notifications'];
};

export function privacyPolicySummaryText(privacy: SettingsOverview['privacy']): string {
  const rules: string[] = [];
  if (privacy.photographyProhibited) {
    rules.push('Photography is not permitted on the property');
  }
  if (privacy.videoProhibited) {
    rules.push('video recording is not permitted on the property');
  }

  const policy = rules.length > 0 ? `${rules.join(' and ')}.` : 'Media capture is not restricted.';
  const bookingNotice = privacy.showPrivacyNoticeAtBooking
    ? 'Guests will see this privacy notice during booking.'
    : 'This notice is retained internally and hidden during booking.';

  return `${policy} ${bookingNotice}`;
}

export function enabledNotificationCount(values: NotificationSettingsMutationRequest): number {
  return NOTIFICATION_SETTING_DEFINITIONS.filter((definition) => values[definition.key]).length;
}

export type RolePermissionsMutationRequest = {
  permissions: string[];
};

export type RolePermissionsMutationResponse = {
  message?: string;
  role?: SettingsOverview['staff']['roles'][number];
};

export function isPermission(value: string): value is Permission {
  return PERMISSIONS.some((permission) => permission === value);
}

export type StaffUserCreateRequest = {
  name: string;
  email: string;
  roleId: string;
  temporaryPassword: string;
};

export type StaffUserUpdateRequest = {
  roleId: string;
  active: boolean;
};

export type StaffUserMutationResponse = {
  message?: string;
  staffUser?: SettingsOverview['staff']['users'][number];
};

export type PaymentSettingsMutationRequest = {
  paypalMeUrl: string;
};

export type PaymentSettingsMutationResponse = {
  message?: string;
  payments?: SettingsOverview['payments'];
};

export function parseSettingsTab(value: string | string[] | undefined): SettingsTab {
  const tab = typeof value === 'string' ? value : '';
  return SETTINGS_TABS.find((entry) => entry === tab) ?? 'property';
}

export function settingsTabHref(tab: SettingsTab): string {
  return tab === 'property' ? '/admin/settings' : `/admin/settings?tab=${tab}`;
}
