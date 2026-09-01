import { NextResponse, type NextRequest } from 'next/server';
import type {
  PropertySettingsMutationRequest,
  PropertySettingsMutationResponse,
} from '@/lib/settingsManager';
import { connectToDatabase } from '@/lib/db';
import { PropertySettings } from '@/models/PropertySettings';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { DEFAULT_PROPERTY_SETTINGS } from '@/server/settings/defaultPropertySettings';
import { propertySettingsSnapshot } from '@/server/settings/propertySnapshot';
import { validatePropertySettings } from '@/server/settings/propertyValidation';

export const runtime = 'nodejs';

function propertyResponse(
  settings: Awaited<ReturnType<typeof PropertySettings.findOne>>,
): PropertySettingsMutationResponse['property'] {
  if (!settings) return undefined;

  return {
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
    addressLine: `${settings.address.street}, ${settings.address.city}, ${settings.address.state} ${settings.address.postalCode}`,
    logoConfigured: Boolean(settings.logoUrl),
    checkInTime: settings.checkInTime,
    checkOutTime: settings.checkOutTime,
    keyReturnTime: settings.keyReturnTime,
    cancellationWindowDays: settings.cancellationWindowDays,
    depositRequirementPercent: settings.depositRequirementPercent,
    minimumAge: settings.minimumAge,
    defaultMinimumStay: settings.defaultMinimumStay,
  };
}

export const PATCH = requirePermission('settings.write', async (request: NextRequest, staff) => {
  let body: Partial<PropertySettingsMutationRequest> | null;
  try {
    body = (await request.json()) as Partial<PropertySettingsMutationRequest>;
  } catch {
    return NextResponse.json<PropertySettingsMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validatePropertySettings(body);
  if (!validation.valid) {
    return NextResponse.json<PropertySettingsMutationResponse>(
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
  const beforeSnapshot = existingSettings ? propertySettingsSnapshot(settings) : null;

  settings.resortName = validation.data.resortName;
  settings.logoUrl = validation.data.logoUrl;
  settings.logoPublicId = validation.data.logoPublicId;
  settings.address = validation.data.address;
  settings.phone = validation.data.phone;
  settings.email = validation.data.email;
  settings.timezone = validation.data.timezone;
  settings.checkInTime = validation.data.checkInTime;
  settings.checkOutTime = validation.data.checkOutTime;
  settings.keyReturnTime = validation.data.keyReturnTime;
  await settings.save();

  await logActivity({
    actorId: staff.userId,
    action: existingSettings ? 'update' : 'create',
    entityType: 'PropertySettings',
    entityId: settings._id,
    beforeSnapshot,
    afterSnapshot: propertySettingsSnapshot(settings),
  });

  return NextResponse.json<PropertySettingsMutationResponse>({
    message: 'Property details saved.',
    property: propertyResponse(settings),
  });
});
