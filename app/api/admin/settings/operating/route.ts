import { NextResponse, type NextRequest } from 'next/server';
import type {
  OperatingSettingsMutationRequest,
  OperatingSettingsMutationResponse,
} from '@/lib/settingsManager';
import { connectToDatabase } from '@/lib/db';
import { PropertySettings } from '@/models/PropertySettings';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { DEFAULT_PROPERTY_SETTINGS } from '@/server/settings/defaultPropertySettings';
import { operatingSettingsSnapshot } from '@/server/settings/operatingSnapshot';
import { validateOperatingSettings } from '@/server/settings/operatingValidation';

export const runtime = 'nodejs';

export const PATCH = requirePermission('settings.write', async (request: NextRequest, staff) => {
  let body: Partial<OperatingSettingsMutationRequest> | null;
  try {
    body = (await request.json()) as Partial<OperatingSettingsMutationRequest>;
  } catch {
    return NextResponse.json<OperatingSettingsMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateOperatingSettings(body);
  if (!validation.valid) {
    return NextResponse.json<OperatingSettingsMutationResponse>(
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
  const beforeSnapshot = existingSettings ? operatingSettingsSnapshot(settings) : null;

  settings.openYearRound = validation.data.openYearRound;
  settings.taxRatePercent = validation.data.taxRatePercent;
  settings.currency = validation.data.currency;
  settings.dateFormat = validation.data.dateFormat;
  await settings.save();

  await logActivity({
    actorId: staff.userId,
    action: existingSettings ? 'update' : 'create',
    entityType: 'PropertySettings',
    entityId: settings._id,
    beforeSnapshot,
    afterSnapshot: operatingSettingsSnapshot(settings),
  });

  return NextResponse.json<OperatingSettingsMutationResponse>({
    message: 'Operating settings saved.',
    operating: {
      openYearRound: settings.openYearRound,
      taxRatePercent: settings.taxRatePercent,
      currency: settings.currency,
      dateFormat: settings.dateFormat,
    },
  });
});
