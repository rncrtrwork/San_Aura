import { NextResponse, type NextRequest } from 'next/server';
import type {
  PaymentSettingsMutationRequest,
  PaymentSettingsMutationResponse,
} from '@/lib/settingsManager';
import { connectToDatabase } from '@/lib/db';
import { PropertySettings } from '@/models/PropertySettings';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { DEFAULT_PROPERTY_SETTINGS } from '@/server/settings/defaultPropertySettings';
import { paymentSettingsSnapshot } from '@/server/settings/paymentSettingsSnapshot';
import { validatePaymentSettings } from '@/server/settings/paymentSettingsValidation';

export const runtime = 'nodejs';

export const PATCH = requirePermission('settings.write', async (request: NextRequest, staff) => {
  let body: Partial<PaymentSettingsMutationRequest> | null;
  try {
    body = (await request.json()) as Partial<PaymentSettingsMutationRequest>;
  } catch {
    return NextResponse.json<PaymentSettingsMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validatePaymentSettings(body);
  if (!validation.valid) {
    return NextResponse.json<PaymentSettingsMutationResponse>(
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
  const beforeSnapshot = existingSettings ? paymentSettingsSnapshot(settings) : null;

  settings.paypalMeUrl = validation.data.paypalMeUrl;
  await settings.save();

  await logActivity({
    actorId: staff.userId,
    action: existingSettings ? 'update' : 'create',
    entityType: 'PropertySettings',
    entityId: settings._id,
    beforeSnapshot,
    afterSnapshot: paymentSettingsSnapshot(settings),
  });

  return NextResponse.json<PaymentSettingsMutationResponse>({
    message: 'Payment settings saved.',
    payments: {
      paypalMeConfigured: Boolean(settings.paypalMeUrl),
      paypalMeUrl: settings.paypalMeUrl,
    },
  });
});
