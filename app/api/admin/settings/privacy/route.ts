import { NextResponse, type NextRequest } from 'next/server';
import type {
  PrivacySettingsMutationRequest,
  PrivacySettingsMutationResponse,
} from '@/lib/settingsManager';
import { connectToDatabase } from '@/lib/db';
import { PropertySettings } from '@/models/PropertySettings';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { DEFAULT_PROPERTY_SETTINGS } from '@/server/settings/defaultPropertySettings';
import { privacySettingsSnapshot } from '@/server/settings/privacySnapshot';
import { validatePrivacySettings } from '@/server/settings/privacyValidation';

export const runtime = 'nodejs';

export const PATCH = requirePermission('settings.write', async (request: NextRequest, staff) => {
  let body: Partial<PrivacySettingsMutationRequest> | null;
  try {
    body = (await request.json()) as Partial<PrivacySettingsMutationRequest>;
  } catch {
    return NextResponse.json<PrivacySettingsMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validatePrivacySettings(body);
  if (!validation.valid) {
    return NextResponse.json<PrivacySettingsMutationResponse>(
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
  const beforeSnapshot = existingSettings ? privacySettingsSnapshot(settings.privacy) : null;

  settings.privacy = validation.data;
  await settings.save();

  await logActivity({
    actorId: staff.userId,
    action: existingSettings ? 'update' : 'create',
    entityType: 'PropertySettings',
    entityId: settings._id,
    beforeSnapshot,
    afterSnapshot: privacySettingsSnapshot(settings.privacy),
  });

  return NextResponse.json<PrivacySettingsMutationResponse>({
    message: 'Privacy and safety settings saved.',
    privacy: {
      photographyProhibited: settings.privacy.photographyProhibited,
      videoProhibited: settings.privacy.videoProhibited,
      showPrivacyNoticeAtBooking: settings.privacy.showPrivacyNoticeAtBooking,
    },
  });
});
