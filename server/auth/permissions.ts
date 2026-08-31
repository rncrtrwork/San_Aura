export const PERMISSIONS = [
  'dashboard.read',
  'members.read',
  'members.write',
  'reservations.read',
  'reservations.write',
  'payments.read',
  'payments.write',
  'sites.read',
  'sites.write',
  'events.read',
  'events.write',
  'media.read',
  'media.write',
  'content.read',
  'content.write',
  'settings.read',
  'settings.write',
  'staff.read',
  'staff.write',
  'activity.read',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_NAMES = ['Admin', 'Front Desk', 'Content Editor', 'Maintenance'] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, readonly Permission[]> = {
  Admin: PERMISSIONS,
  'Front Desk': [
    'dashboard.read',
    'members.read',
    'members.write',
    'reservations.read',
    'reservations.write',
    'payments.read',
    'payments.write',
    'sites.read',
    'events.read',
    'media.read',
    'activity.read',
  ],
  'Content Editor': [
    'dashboard.read',
    'events.read',
    'events.write',
    'media.read',
    'media.write',
    'content.read',
    'content.write',
  ],
  Maintenance: [
    'dashboard.read',
    'reservations.read',
    'sites.read',
    'sites.write',
    'activity.read',
  ],
};
