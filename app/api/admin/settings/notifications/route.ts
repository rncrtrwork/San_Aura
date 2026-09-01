import { NextResponse, type NextRequest } from 'next/server';
import {
  enabledNotificationCount,
  NOTIFICATION_SETTING_DEFINITIONS,
  type NotificationSettingsMutationRequest,
  type NotificationSettingsMutationResponse,
} from '@/lib/settingsManager';
import { connectToDatabase } from '@/lib/db';
import { PropertySettings } from '@/models/PropertySettings';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { DEFAULT_PROPERTY_SETTINGS } from '@/server/settings/defaultPropertySettings';
import { notificationSettingsSnapshot } from '@/server/settings/notificationSnapshot';
import { validateNotificationSettings } from '@/server/settings/notificationValidation';

export const runtime = 'nodejs';

export const PATCH = requirePermission('settings.write', async (request: NextRequest, staff) => {
  let body: Partial<NotificationSettingsMutationRequest> | null;
  try {
    body = (await request.json()) as Partial<NotificationSettingsMutationRequest>;
  } catch {
    return NextResponse.json<NotificationSettingsMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateNotificationSettings(body);
  if (!validation.valid) {
    return NextResponse.json<NotificationSettingsMutationResponse>(
      { message: validation.message },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const existingSettings = await PropertySettings.findOne({ key: 'property' });
  const settings =
    existingSettings ??
    new PropertySettings({
      ...DEFAULT_PROPERTY_SETTINGS,
    });
  const beforeSnapshot = existingSettings
    ? notificationSettingsSnapshot(settings.notifications)
    : null;

  settings.notifications = validation.data;
  await settings.save();

  await logActivity({
    actorId: staff.userId,
    action: existingSettings ? 'update' : 'create',
    entityType: 'PropertySettings',
    entityId: settings._id,
    beforeSnapshot,
    afterSnapshot: notificationSettingsSnapshot(settings.notifications),
  });

  return NextResponse.json<NotificationSettingsMutationResponse>({
    message: 'Notification settings saved.',
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
  });
});
