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
  };
  payments: {
    paypalMeConfigured: boolean;
  };
  staff: {
    activeStaffCount: number;
    roleCount: number;
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

export function parseSettingsTab(value: string | string[] | undefined): SettingsTab {
  const tab = typeof value === 'string' ? value : '';
  return SETTINGS_TABS.find((entry) => entry === tab) ?? 'property';
}

export function settingsTabHref(tab: SettingsTab): string {
  return tab === 'property' ? '/admin/settings' : `/admin/settings?tab=${tab}`;
}
