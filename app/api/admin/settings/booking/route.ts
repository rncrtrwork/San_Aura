import { NextResponse, type NextRequest } from 'next/server';
import type {
  BookingSettingsMutationRequest,
  BookingSettingsMutationResponse,
} from '@/lib/settingsManager';
import { connectToDatabase } from '@/lib/db';
import { PropertySettings } from '@/models/PropertySettings';
import { logActivity } from '@/server/activity/logActivity';
import { requirePermission } from '@/server/auth/authorization';
import { bookingSettingsSnapshot } from '@/server/settings/bookingSnapshot';
import { validateBookingSettings } from '@/server/settings/bookingValidation';
import { DEFAULT_PROPERTY_SETTINGS } from '@/server/settings/defaultPropertySettings';

export const runtime = 'nodejs';

export const PATCH = requirePermission('settings.write', async (request: NextRequest, staff) => {
  let body: Partial<BookingSettingsMutationRequest> | null;
  try {
    body = (await request.json()) as Partial<BookingSettingsMutationRequest>;
  } catch {
    return NextResponse.json<BookingSettingsMutationResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validation = validateBookingSettings(body);
  if (!validation.valid) {
    return NextResponse.json<BookingSettingsMutationResponse>(
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
  const beforeSnapshot = existingSettings ? bookingSettingsSnapshot(settings) : null;

  settings.cancellationWindowDays = validation.data.cancellationWindowDays;
  settings.depositRequirementPercent = validation.data.depositRequirementPercent;
  settings.minimumAge = validation.data.minimumAge;
  settings.defaultMinimumStay = validation.data.defaultMinimumStay;
  await settings.save();

  await logActivity({
    actorId: staff.userId,
    action: existingSettings ? 'update' : 'create',
    entityType: 'PropertySettings',
    entityId: settings._id,
    beforeSnapshot,
    afterSnapshot: bookingSettingsSnapshot(settings),
  });

  return NextResponse.json<BookingSettingsMutationResponse>({
    message: 'Booking defaults saved.',
    booking: {
      checkInTime: settings.checkInTime,
      checkOutTime: settings.checkOutTime,
      keyReturnTime: settings.keyReturnTime,
      cancellationWindowDays: settings.cancellationWindowDays,
      depositRequirementPercent: settings.depositRequirementPercent,
      minimumAge: settings.minimumAge,
      defaultMinimumStay: settings.defaultMinimumStay,
    },
  });
});
